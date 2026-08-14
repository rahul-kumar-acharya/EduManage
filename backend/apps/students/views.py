from apps.academics.views import BaseTenantViewSet
from apps.students.models import StudentProfile
from apps.students.serializers import StudentProfileSerializer, StudentCreateSerializer
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.common.permissions import IsTeacher, HasTenantAccess

class StudentProfileViewSet(BaseTenantViewSet):
    queryset = StudentProfile.objects.all().select_related('user', 'section', 'section__class_level').order_by('-created_at')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            from apps.common.permissions import CanManageStudents
            return [CanManageStudents(), HasTenantAccess()]
        from apps.common.permissions import IsTeacher
        return [IsTeacher(), HasTenantAccess()]

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        return StudentProfileSerializer

    def perform_create(self, serializer):
        user = self.request.user
        section = serializer.validated_data.get('section')
        if user.role == 'TEACHER':
            teacher_profile = getattr(user, 'teacher_profile', None)
            if not teacher_profile or not teacher_profile.assigned_sections.filter(id=section.id).exists():
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only enroll students in your assigned Class Section.")
        serializer.save(school=self.request.school)

    def perform_update(self, serializer):
        user = self.request.user
        section = serializer.validated_data.get('section')
        if user.role == 'TEACHER':
            teacher_profile = getattr(user, 'teacher_profile', None)
            if not teacher_profile or (section and not teacher_profile.assigned_sections.filter(id=section.id).exists()):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only modify students in your assigned Class Section.")
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        user = self.request.user
        if user.role == 'TEACHER':
            instance = self.get_object()
            teacher_profile = getattr(user, 'teacher_profile', None)
            if not teacher_profile or not teacher_profile.assigned_sections.filter(id=instance.section_id).exists():
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only delete students in your assigned Class Section.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['post'], url_path='bulk-create')
    def bulk_create(self, request):
        from django.db import transaction
        section_id = request.data.get('section')
        records = request.data.get('records', [])

        if not section_id:
            return Response({"detail": "Target section is required for bulk enrollment."}, status=status.HTTP_400_BAD_REQUEST)
        if not records or not isinstance(records, list):
            return Response({"detail": "Please provide a valid list of student records."}, status=status.HTTP_400_BAD_REQUEST)

        school = request.school
        
        # Calculate current max roll number in section
        existing_rolls = StudentProfile.objects.filter(school=school, section_id=section_id).values_list('roll_number', flat=True)
        valid_nums = [int(r) for r in existing_rolls if r and r.isdigit()]
        start_roll = max(valid_nums) + 1 if valid_nums else 1

        created_profiles = []
        errors = []

        with transaction.atomic():
            for idx, item in enumerate(records):
                first_name = (item.get('first_name') or '').strip()
                last_name = (item.get('last_name') or '').strip()
                if not first_name or not last_name:
                    errors.append(f"Row #{idx+1}: First name and last name are required.")
                    continue

                serializer = StudentCreateSerializer(data={
                    'first_name': first_name,
                    'last_name': last_name,
                    'section': int(section_id),
                    'admission_number': (item.get('admission_number') or '').strip(),
                    'roll_number': str(start_roll),
                    'guardian_name': (item.get('guardian_name') or '').strip(),
                    'guardian_phone': (item.get('guardian_phone') or '').strip(),
                    'guardian_email': (item.get('guardian_email') or '').strip(),
                }, context={'request': request})

                if serializer.is_valid():
                    profile = serializer.save()
                    created_profiles.append(profile.id)
                    start_roll += 1
                else:
                    err_msg = ", ".join([f"{k}: {' '.join(v)}" if isinstance(v, list) else str(v) for k, v in serializer.errors.items()])
                    errors.append(f"Row #{idx+1} ({first_name} {last_name}): {err_msg}")

        return Response({
            "created_count": len(created_profiles),
            "errors": errors
        }, status=status.HTTP_201_CREATED if created_profiles else status.HTTP_400_BAD_REQUEST)


    def get_queryset(self):
        qs = super().get_queryset()
        section_id = self.request.query_params.get('section')
        if section_id:
            qs = qs.filter(section_id=section_id)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                user__first_name__icontains=search
            ) | qs.filter(
                user__last_name__icontains=search
            ) | qs.filter(
                admission_number__icontains=search
            )
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return Response(StudentProfileSerializer(profile).data, status=status.HTTP_201_CREATED)

from apps.academics.views import BaseTenantViewSet
from apps.students.models import StudentProfile
from apps.students.serializers import StudentProfileSerializer, StudentCreateSerializer
from rest_framework import status
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

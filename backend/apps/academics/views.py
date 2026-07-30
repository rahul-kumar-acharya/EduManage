from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.academics.models import AcademicSession, ClassLevel, Section, Subject
from apps.academics.serializers import (
    AcademicSessionSerializer,
    ClassLevelSerializer,
    SectionSerializer,
    SubjectSerializer
)
from apps.common.permissions import HasTenantAccess

class BaseTenantViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, HasTenantAccess]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'set_current']:
            from apps.common.permissions import IsSchoolAdmin
            return [IsSchoolAdmin(), HasTenantAccess()]
        return [permissions.IsAuthenticated(), HasTenantAccess()]

    def get_queryset(self):
        if hasattr(self.request, 'school') and self.request.school:
            return self.queryset.filter(school=self.request.school)
        return self.queryset.none()

    def perform_create(self, serializer):
        serializer.save(school=self.request.school)

class AcademicSessionViewSet(BaseTenantViewSet):
    queryset = AcademicSession.objects.all().order_by('-start_date')
    serializer_class = AcademicSessionSerializer

    @action(detail=True, methods=['post'], url_path='set-current')
    def set_current(self, request, pk=None):
        session = self.get_object()
        AcademicSession.objects.filter(school=request.school).update(is_current=False)
        session.is_current = True
        session.save()
        return Response({'message': f"Session {session.name} is now current."}, status=status.HTTP_200_OK)

class ClassLevelViewSet(BaseTenantViewSet):
    queryset = ClassLevel.objects.all().order_by('name')
    serializer_class = ClassLevelSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        current_session = AcademicSession.objects.filter(school=self.request.school, is_current=True).first()
        if current_session:
            # Synchronize any older global classes to the current active session
            ClassLevel.objects.filter(school=self.request.school, academic_session__isnull=True).update(academic_session=current_session)
            return qs.filter(academic_session=current_session)
        return qs

    def perform_create(self, serializer):
        current_session = AcademicSession.objects.filter(school=self.request.school, is_current=True).first()
        if not current_session:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "No active academic session found. Please create and set an active Academic Session first."})
        serializer.save(school=self.request.school, academic_session=current_session)

class SectionViewSet(BaseTenantViewSet):
    queryset = Section.objects.all().order_by('name')
    serializer_class = SectionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == 'TEACHER':
            class_teacher_only = self.request.query_params.get('class_teacher_only') == 'true'
            if class_teacher_only:
                teacher_profile = getattr(user, 'teacher_profile', None)
                if teacher_profile:
                    qs = qs.filter(class_teacher=teacher_profile)
                else:
                    qs = qs.none()
        current_session = AcademicSession.objects.filter(school=self.request.school, is_current=True).first()
        if current_session:
            return qs.filter(class_level__academic_session=current_session)
        return qs

    def perform_create(self, serializer):
        current_session = AcademicSession.objects.filter(school=self.request.school, is_current=True).first()
        if not current_session:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "No active academic session found. Please create and set an active Academic Session first."})
        
        class_level = serializer.validated_data.get('class_level')
        if class_level.academic_session != current_session:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "The selected class does not belong to the current active academic session."})
            
        serializer.save(school=self.request.school)

class SubjectViewSet(BaseTenantViewSet):
    queryset = Subject.objects.all().select_related('class_level', 'section', 'section__class_level').order_by('name')
    serializer_class = SubjectSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            from apps.common.permissions import CanManageSubjects
            return [CanManageSubjects(), HasTenantAccess()]
        return [permissions.IsAuthenticated(), HasTenantAccess()]

    def perform_create(self, serializer):
        user = self.request.user
        section = serializer.validated_data.get('section')
        class_level = serializer.validated_data.get('class_level')
        
        if section and not class_level:
            class_level = section.class_level

        if user.role == 'TEACHER':
            teacher_profile = getattr(user, 'teacher_profile', None)
            if section:
                if not teacher_profile or not teacher_profile.assigned_sections.filter(id=section.id).exists():
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied("You can only add subjects for your assigned section.")
            elif class_level:
                if not teacher_profile or not teacher_profile.assigned_sections.filter(class_level=class_level).exists():
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied("You can only add subjects for your assigned Class Level.")

        serializer.save(school=self.request.school, class_level=class_level)

    def perform_update(self, serializer):
        user = self.request.user
        section = serializer.validated_data.get('section')
        class_level = serializer.validated_data.get('class_level')

        if section and not class_level:
            class_level = section.class_level

        if user.role == 'TEACHER':
            teacher_profile = getattr(user, 'teacher_profile', None)
            if section and (not teacher_profile or not teacher_profile.assigned_sections.filter(id=section.id).exists()):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only modify subjects for your assigned section.")
        serializer.save(class_level=class_level)

    def destroy(self, request, *args, **kwargs):
        user = self.request.user
        if user.role == 'TEACHER':
            instance = self.get_object()
            teacher_profile = getattr(user, 'teacher_profile', None)
            if instance.section and (not teacher_profile or not teacher_profile.assigned_sections.filter(id=instance.section.id).exists()):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only delete subjects for your assigned section.")
        return super().destroy(request, *args, **kwargs)

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        
        section_id = self.request.query_params.get('section')
        if section_id:
            return qs.filter(section_id=section_id)

        class_level_id = self.request.query_params.get('class_level')
        if class_level_id:
            qs = qs.filter(class_level_id=class_level_id)
        elif user.role == 'TEACHER':
            taught_only = self.request.query_params.get('taught_only') == 'true'
            if taught_only:
                teacher_profile = getattr(user, 'teacher_profile', None)
                if teacher_profile:
                    from apps.timetable.models import TimetablePeriod
                    subject_ids = TimetablePeriod.objects.filter(teacher=teacher_profile).values_list('subject_id', flat=True)
                    qs = qs.filter(id__in=subject_ids)
                else:
                    qs = qs.none()
        return qs


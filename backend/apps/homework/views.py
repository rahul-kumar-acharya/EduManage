from apps.academics.views import BaseTenantViewSet
from apps.homework.models import HomeworkAssignment
from apps.homework.serializers import HomeworkAssignmentSerializer

class HomeworkAssignmentViewSet(BaseTenantViewSet):
    queryset = HomeworkAssignment.objects.all().select_related('section', 'subject', 'section__class_level', 'assigned_by').order_by('-due_date')
    serializer_class = HomeworkAssignmentSerializer

    def get_permissions(self):
        from apps.common.permissions import CanManageHomework, IsTeacherOrStudentParent, HasTenantAccess
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [CanManageHomework(), HasTenantAccess()]
        return [IsTeacherOrStudentParent(), HasTenantAccess()]

    def get_queryset(self):
        qs = super().get_queryset()
        section_id = self.request.query_params.get('section')
        if section_id:
            qs = qs.filter(section_id=section_id)
        subject_id = self.request.query_params.get('subject')
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'TEACHER':
            teacher_profile = getattr(user, 'teacher_profile', None)
            section = serializer.validated_data.get('section')
            subject = serializer.validated_data.get('subject')
            if teacher_profile and section and subject:
                from apps.timetable.models import TimetablePeriod
                teacher_has_periods = TimetablePeriod.objects.filter(teacher=teacher_profile).exists()
                if teacher_has_periods:
                    is_class_teacher = teacher_profile.assigned_sections.filter(id=section.id).exists()
                    teaches_here = TimetablePeriod.objects.filter(
                        teacher=teacher_profile,
                        section=section,
                        subject=subject
                    ).exists()
                    if not is_class_teacher and not teaches_here:
                        from rest_framework.exceptions import PermissionDenied
                        raise PermissionDenied("You are not assigned to teach this Subject in this Section.")
        serializer.save(school=self.request.school, assigned_by=user)


    def perform_update(self, serializer):
        user = self.request.user
        if user.role == 'TEACHER':
            teacher_profile = getattr(user, 'teacher_profile', None)
            section = serializer.validated_data.get('section', serializer.instance.section)
            subject = serializer.validated_data.get('subject', serializer.instance.subject)
            if teacher_profile and section and subject:
                from apps.timetable.models import TimetablePeriod
                teacher_has_periods = TimetablePeriod.objects.filter(teacher=teacher_profile).exists()
                if teacher_has_periods:
                    is_class_teacher = teacher_profile.assigned_sections.filter(id=section.id).exists()
                    teaches_here = TimetablePeriod.objects.filter(
                        teacher=teacher_profile,
                        section=section,
                        subject=subject
                    ).exists()
                    if not is_class_teacher and not teaches_here:
                        from rest_framework.exceptions import PermissionDenied
                        raise PermissionDenied("You are not assigned to teach this Subject in this Section.")
        serializer.save()

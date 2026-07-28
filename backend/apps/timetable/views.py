from apps.academics.views import BaseTenantViewSet
from apps.timetable.models import TimetablePeriod
from apps.timetable.serializers import TimetablePeriodSerializer

class TimetablePeriodViewSet(BaseTenantViewSet):
    queryset = TimetablePeriod.objects.all().select_related('section', 'subject', 'teacher', 'teacher__user').order_by('start_time')
    serializer_class = TimetablePeriodSerializer

    def get_permissions(self):
        from apps.common.permissions import CanManageTimetable, IsTeacherOrStudentParent, HasTenantAccess
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [CanManageTimetable(), HasTenantAccess()]
        return [IsTeacherOrStudentParent(), HasTenantAccess()]

    def get_queryset(self):
        qs = super().get_queryset()
        section_id = self.request.query_params.get('section')
        if section_id:
            qs = qs.filter(section_id=section_id)
        teacher_id = self.request.query_params.get('teacher')
        if teacher_id:
            qs = qs.filter(teacher_id=teacher_id)
        day = self.request.query_params.get('day_of_week')
        if day:
            qs = qs.filter(day_of_week=day)
        return qs

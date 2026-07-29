from rest_framework.decorators import action
from rest_framework.response import Response
from apps.academics.views import BaseTenantViewSet
from apps.timetable.models import TimetablePeriod
from apps.timetable.serializers import TimetablePeriodSerializer
from apps.teachers.models import TeacherProfile
from apps.teachers.serializers import TeacherProfileSerializer

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

    @action(detail=False, methods=['get'], url_path='free-teachers')
    def free_teachers(self, request):
        day = request.query_params.get('day_of_week')
        start_time = request.query_params.get('start_time')
        end_time = request.query_params.get('end_time')

        all_teachers = TeacherProfile.objects.filter(school=request.school, is_active=True).select_related('user')

        if day and start_time and end_time:
            busy_teacher_ids = TimetablePeriod.objects.filter(
                school=request.school,
                day_of_week=day,
                start_time=start_time,
                end_time=end_time,
                teacher__isnull=False
            ).values_list('teacher_id', flat=True)

            free_teachers_qs = all_teachers.exclude(id__in=busy_teacher_ids)
        else:
            free_teachers_qs = all_teachers

        serializer = TeacherProfileSerializer(free_teachers_qs, many=True)
        return Response(serializer.data)


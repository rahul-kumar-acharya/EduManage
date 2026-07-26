from django.db import models
from apps.common.models import TenantModel

class TimetablePeriod(TenantModel):
    section = models.ForeignKey('academics.Section', on_delete=models.CASCADE, related_name='timetable')
    subject = models.ForeignKey('academics.Subject', on_delete=models.CASCADE)
    teacher = models.ForeignKey('teachers.TeacherProfile', on_delete=models.SET_NULL, null=True)
    day_of_week = models.CharField(max_length=15, choices=[('MON', 'Monday'), ('TUE', 'Tuesday'), ('WED', 'Wednesday'), ('THU', 'Thursday'), ('FRI', 'Friday'), ('SAT', 'Saturday')])
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.section.name} - {self.subject.name} ({self.day_of_week})"

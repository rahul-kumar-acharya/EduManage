from django.db import models
from apps.common.models import TenantModel

class StudentAttendance(TenantModel):
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=[('PRESENT', 'Present'), ('ABSENT', 'Absent'), ('LATE', 'Late'), ('LEAVE', 'On Leave')], default='PRESENT')

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.date} ({self.status})"

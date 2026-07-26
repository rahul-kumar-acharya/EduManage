from django.db import models
from apps.common.models import TenantModel

class Exam(TenantModel):
    name = models.CharField(max_length=150) # Midterm, Annual
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.name} - {self.school.name}"

class ExamMark(TenantModel):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='marks')
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE)
    subject = models.ForeignKey('academics.Subject', on_delete=models.CASCADE)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    max_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.subject.name}: {self.marks_obtained}/{self.max_marks}"

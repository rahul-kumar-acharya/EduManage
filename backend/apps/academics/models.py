from django.db import models
from apps.common.models import TenantModel

class AcademicSession(TenantModel):
    name = models.CharField(max_length=100) # e.g. 2026-2027
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.school.name}"

class ClassLevel(TenantModel):
    name = models.CharField(max_length=100) # e.g. Grade 10, Class 5
    academic_session = models.ForeignKey(
        'academics.AcademicSession',
        on_delete=models.CASCADE,
        related_name='classes',
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.name} ({self.school.subdomain})"

class Section(TenantModel):
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=50) # e.g. Section A
    class_teacher = models.ForeignKey(
        'teachers.TeacherProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_sections'
    )

    def __str__(self):
        return f"{self.class_level.name} - {self.name}"

class Subject(TenantModel):
    name = models.CharField(max_length=100) # e.g. Mathematics
    code = models.CharField(max_length=20, blank=True)
    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.CASCADE,
        related_name='subjects',
        null=True,
        blank=True
    )
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='subjects',
        null=True,
        blank=True
    )

    def __str__(self):
        if self.section:
            return f"{self.name} ({self.section.class_level.name} - Sec {self.section.name})"
        return self.name


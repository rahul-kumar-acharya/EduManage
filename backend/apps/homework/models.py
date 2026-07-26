from django.db import models
from apps.common.models import TenantModel

class HomeworkAssignment(TenantModel):
    section = models.ForeignKey('academics.Section', on_delete=models.CASCADE, related_name='homeworks')
    subject = models.ForeignKey('academics.Subject', on_delete=models.CASCADE, related_name='homeworks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()

    def __str__(self):
        return f"{self.title} ({self.subject.name})"

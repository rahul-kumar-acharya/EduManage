from django.db import models
from apps.common.models import TenantModel

from django.conf import settings

class HomeworkAssignment(TenantModel):
    section = models.ForeignKey('academics.Section', on_delete=models.CASCADE, related_name='homeworks')
    subject = models.ForeignKey('academics.Subject', on_delete=models.CASCADE, related_name='homeworks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_homeworks'
    )

    def __str__(self):
        return f"{self.title} ({self.subject.name})"


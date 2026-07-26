from django.db import models
from apps.common.models import TenantModel
from django.conf import settings

class TeacherProfile(TenantModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=50)
    department = models.CharField(max_length=100, blank=True)
    qualification = models.CharField(max_length=100, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['school', 'employee_id'], name='unique_school_employee_id')
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"

from django.db.models.signals import post_delete
from django.dispatch import receiver

@receiver(post_delete, sender=TeacherProfile)
def delete_associated_user(sender, instance, **kwargs):
    if instance.user:
        instance.user.delete()

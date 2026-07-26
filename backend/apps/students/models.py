from django.db import models
from apps.common.models import TenantModel
from django.conf import settings

class StudentProfile(TenantModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    admission_number = models.CharField(max_length=50)
    roll_number = models.CharField(max_length=50, blank=True)
    section = models.ForeignKey('academics.Section', on_delete=models.SET_NULL, null=True, related_name='students')
    guardian_name = models.CharField(max_length=255, blank=True)
    guardian_phone = models.CharField(max_length=20, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['school', 'admission_number'], name='unique_school_admission_number')
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.admission_number})"

from django.db.models.signals import post_delete
from django.dispatch import receiver

@receiver(post_delete, sender=StudentProfile)
def delete_associated_user(sender, instance, **kwargs):
    if instance.user:
        instance.user.delete()

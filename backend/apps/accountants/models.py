from django.db import models
from apps.common.models import TenantModel
from django.conf import settings

class AccountantProfile(TenantModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='accountant_profile')
    employee_id = models.CharField(max_length=50)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['school', 'employee_id'], name='unique_school_accountant_employee_id')
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"

from django.db.models.signals import post_delete
from django.dispatch import receiver

@receiver(post_delete, sender=AccountantProfile)
def delete_associated_user(sender, instance, **kwargs):
    if instance.user:
        instance.user.delete()

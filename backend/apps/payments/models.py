from django.db import models
from apps.common.models import TenantModel

class PaymentTransaction(TenantModel):
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    gateway = models.CharField(max_length=50, default='Razorpay')
    status = models.CharField(max_length=20, choices=[('SUCCESS', 'Success'), ('FAILED', 'Failed'), ('PENDING', 'Pending')], default='PENDING')

    def __str__(self):
        return f"{self.transaction_id} - ${self.amount} ({self.status})"

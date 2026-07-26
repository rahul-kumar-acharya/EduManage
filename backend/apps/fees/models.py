from django.db import models
from apps.common.models import TenantModel

class FeeStructure(TenantModel):
    name = models.CharField(max_length=150) # e.g. Tuition Fee, Exam Fee
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()

    def __str__(self):
        return f"{self.name} - ${self.amount}"

class StudentFeePayment(TenantModel):
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE)
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    receipt_number = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=[('PAID', 'Paid'), ('PARTIAL', 'Partial'), ('PENDING', 'Pending')], default='PAID')

    def __str__(self):
        return f"Receipt {self.receipt_number} - {self.student.user.get_full_name()}"

from rest_framework import serializers
from apps.fees.models import FeeStructure, StudentFeePayment
from apps.students.serializers import StudentProfileSerializer

class FeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = ['id', 'name', 'amount', 'due_date', 'created_at']
        read_only_fields = ['id', 'created_at']

class StudentFeePaymentSerializer(serializers.ModelSerializer):
    student_details = StudentProfileSerializer(source='student', read_only=True)
    fee_structure_details = FeeStructureSerializer(source='fee_structure', read_only=True)

    class Meta:
        model = StudentFeePayment
        fields = ['id', 'fee_structure', 'fee_structure_details', 'student', 'student_details', 'amount_paid', 'payment_date', 'receipt_number', 'status', 'created_at']
        read_only_fields = ['id', 'receipt_number', 'payment_date', 'created_at']

class CollectFeeSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    fee_structure_id = serializers.IntegerField()
    amount_paid = serializers.DecimalField(max_digits=10, decimal_places=2)

import random
import string
from datetime import date
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from apps.academics.views import BaseTenantViewSet
from apps.fees.models import FeeStructure, StudentFeePayment
from apps.fees.serializers import (
    FeeStructureSerializer,
    StudentFeePaymentSerializer,
    CollectFeeSerializer
)
from apps.students.models import StudentProfile
from apps.students.serializers import StudentProfileSerializer
from apps.common.permissions import IsAccountant, HasTenantAccess

class FeeStructureViewSet(BaseTenantViewSet):
    permission_classes = [IsAccountant, HasTenantAccess]
    queryset = FeeStructure.objects.all().order_by('-due_date')
    serializer_class = FeeStructureSerializer

class StudentFeePaymentViewSet(BaseTenantViewSet):
    permission_classes = [IsAccountant, HasTenantAccess]
    queryset = StudentFeePayment.objects.all().select_related('student', 'student__user', 'fee_structure').order_by('-payment_date')
    serializer_class = StudentFeePaymentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('student')
        if student_id:
            qs = qs.filter(student_id=student_id)
        structure_id = self.request.query_params.get('fee_structure')
        if structure_id:
            qs = qs.filter(fee_structure_id=structure_id)
        status_val = self.request.query_params.get('status')
        if status_val:
            qs = qs.filter(status=status_val)
        return qs

    @action(detail=False, methods=['post'], url_path='collect')
    @transaction.atomic
    def collect(self, request):
        serializer = CollectFeeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        school = request.school
        student_id = serializer.validated_data['student_id']
        fee_structure_id = serializer.validated_data['fee_structure_id']
        amount_paid = serializer.validated_data['amount_paid']

        student = StudentProfile.objects.filter(school=school, id=student_id).first()
        fee_struct = FeeStructure.objects.filter(school=school, id=fee_structure_id).first()

        if not student or not fee_struct:
            return Response({'error': 'Student or Fee Structure not found for this tenant.'}, status=status.HTTP_404_NOT_FOUND)

        # Generate unique receipt number e.g. REC-2026-X8921
        rand_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        receipt_num = f"REC-{date.today().year}-{rand_str}"

        # Status calculation
        if float(amount_paid) >= float(fee_struct.amount):
            pay_status = 'PAID'
        elif float(amount_paid) > 0:
            pay_status = 'PARTIAL'
        else:
            pay_status = 'PENDING'

        payment = StudentFeePayment.objects.create(
            school=school,
            student=student,
            fee_structure=fee_struct,
            amount_paid=amount_paid,
            receipt_number=receipt_num,
            status=pay_status
        )

        return Response(StudentFeePaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='dues')
    def dues(self, request):
        school = request.school
        students = StudentProfile.objects.filter(school=school).select_related('user', 'section', 'section__class_level')
        structures = FeeStructure.objects.filter(school=school)

        dues_list = []
        for st in students:
            total_due = sum(float(fs.amount) for fs in structures)
            payments = StudentFeePayment.objects.filter(school=school, student=st)
            total_paid = sum(float(p.amount_paid) for p in payments)
            balance = total_due - total_paid

            if balance > 0 or len(structures) == 0:
                dues_list.append({
                    'student': StudentProfileSerializer(st).data,
                    'total_assessed': total_due,
                    'total_paid': total_paid,
                    'balance_due': balance if balance > 0 else 0.0,
                    'status': 'OVERDUE' if balance > 0 else 'CLEAR'
                })

        return Response(dues_list, status=status.HTTP_200_OK)

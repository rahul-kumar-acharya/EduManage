from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from apps.academics.views import BaseTenantViewSet
from apps.attendance.models import StudentAttendance
from apps.attendance.serializers import (
    StudentAttendanceSerializer,
    BulkAttendanceSerializer
)
from apps.common.permissions import IsTeacher, HasTenantAccess

class StudentAttendanceViewSet(BaseTenantViewSet):
    queryset = StudentAttendance.objects.all().select_related('student', 'student__user')
    serializer_class = StudentAttendanceSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_mark']:
            from apps.common.permissions import CanManageAttendance
            return [CanManageAttendance(), HasTenantAccess()]
        from apps.common.permissions import IsTeacher
        return [IsTeacher(), HasTenantAccess()]

    def get_queryset(self):
        qs = super().get_queryset()
        section_id = self.request.query_params.get('section')
        if section_id:
            qs = qs.filter(student__section_id=section_id)
        date_val = self.request.query_params.get('date')
        if date_val:
            qs = qs.filter(date=date_val)
        return qs

    @action(detail=False, methods=['post'], url_path='bulk-mark')
    @transaction.atomic
    def bulk_mark(self, request):
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        school = request.school
        section_id = serializer.validated_data['section_id']
        att_date = serializer.validated_data['date']
        records = serializer.validated_data['records']

        created_or_updated = 0
        for rec in records:
            obj, created = StudentAttendance.objects.update_or_create(
                school=school,
                student_id=rec['student_id'],
                date=att_date,
                defaults={'status': rec['status']}
            )
            created_or_updated += 1

        return Response({
            'message': f"Successfully recorded attendance for {created_or_updated} students.",
            'date': att_date,
            'section_id': section_id
        }, status=status.HTTP_200_OK)

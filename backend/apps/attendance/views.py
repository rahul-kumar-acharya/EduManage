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
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        if year and month:
            qs = qs.filter(date__year=year, date__month=month)
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

        import datetime
        today = datetime.date.today()
        if att_date != today:
            return Response({
                'detail': "Attendance can only be recorded for today's date."
            }, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if user.role == 'TEACHER':
            teacher_profile = getattr(user, 'teacher_profile', None)
            if not teacher_profile or not teacher_profile.assigned_sections.filter(id=section_id).exists():
                return Response({
                    'detail': 'You are only authorized to record attendance for your assigned class section.'
                }, status=status.HTTP_403_FORBIDDEN)

            # Check if attendance for this section and date has already been submitted by teacher
            already_submitted = StudentAttendance.objects.filter(
                student__section_id=section_id,
                date=att_date
            ).exists()

            if already_submitted:
                return Response({
                    'detail': 'Attendance for this date has already been submitted and locked. Please contact School Admin to request any modifications.'
                }, status=status.HTTP_403_FORBIDDEN)

        created_or_updated = 0
        newly_absent_students = []
        for rec in records:
            obj, created = StudentAttendance.objects.update_or_create(
                school=school,
                student_id=rec['student_id'],
                date=att_date,
                defaults={'status': rec['status']}
            )
            created_or_updated += 1
            if rec['status'] == 'ABSENT':
                newly_absent_students.append(obj.student)

        # Dispatch automated absentee email notifications to guardians
        if newly_absent_students:
            send_absentee_notifications(newly_absent_students, att_date, school)

        return Response({
            'message': f"Successfully recorded attendance for {created_or_updated} students.",
            'date': att_date,
            'section_id': section_id,
            'absent_notifications_sent': len(newly_absent_students)
        }, status=status.HTTP_200_OK)


def send_absentee_notifications(absent_students, att_date, school):
    import logging
    from django.core.mail import send_mail
    from django.conf import settings

    logger = logging.getLogger(__name__)
    formatted_date = str(att_date)

    for student in absent_students:
        guardian_email = (student.guardian_email or getattr(student.user, 'email', '') or '').strip()
        if not guardian_email:
            continue

        student_name = f"{student.user.first_name} {student.user.last_name}".strip()
        guardian_name = student.guardian_name or "Parent / Guardian"
        school_name = school.name if school else "EduManage School"
        roll_no = student.roll_number or 'N/A'

        subject = f"[{school_name}] Attendance Notice: {student_name} marked ABSENT on {formatted_date}"
        
        html_message = f"""
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E0D8; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #5C1D24; padding-bottom: 16px; margin-bottom: 24px;">
                <h2 style="color: #5C1D24; margin: 0; font-size: 22px;">{school_name}</h2>
                <span style="color: #64748B; font-size: 12px; font-weight: bold; text-transform: uppercase;">Daily Attendance Notification</span>
            </div>

            <p style="font-size: 15px; color: #1A1918;">Dear <strong>{guardian_name}</strong>,</p>

            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                This is an official notice to inform you that your child, <strong style="color: #1B2A4A;">{student_name}</strong> (Roll No. #{roll_no}), was marked <strong style="color: #5C1D24;">ABSENT</strong> for class today, <strong>{formatted_date}</strong>.
            </p>

            <div style="background-color: #FFF5F5; border: 1px solid #FEB2B2; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
                <span style="display: block; font-size: 12px; font-weight: bold; color: #9B2C2C; text-transform: uppercase;">Absence Record</span>
                <span style="display: block; font-size: 18px; font-weight: bold; color: #742A2A; margin-top: 4px;">{student_name} — ABSENT ({formatted_date})</span>
            </div>

            <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
                If your child was absent due to an illness or pre-approved leave, please contact the school office. If you believe this record is an error, please reach out to the Class Teacher immediately.
            </p>

            <div style="border-top: 1px solid #E5E0D8; margin-top: 24px; padding-top: 16px; font-size: 12px; color: #94A3B8; text-align: center;">
                <p style="margin: 0;">Automated Notification from {school_name} Management Portal.</p>
            </div>
        </div>
        """

        try:
            send_mail(
                subject=subject,
                message=f"Dear {guardian_name}, {student_name} was marked ABSENT today ({formatted_date}) at {school_name}.",
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@edumanage.com'),
                recipient_list=[guardian_email],
                html_message=html_message,
                fail_silently=True,
            )
            logger.info(f"Absentee notification email sent to {guardian_email} for student {student_name}")
        except Exception as e:
            logger.error(f"Failed to send absentee notification email to {guardian_email}: {e}")


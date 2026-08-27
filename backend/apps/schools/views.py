from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from apps.schools.models import School
from apps.schools.serializers import (
    SchoolSerializer,
    SubdomainCheckSerializer,
    SchoolRegistrationSerializer
)
from apps.common.permissions import IsSuperAdmin

class CheckSubdomainView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        subdomain = request.query_params.get('subdomain', '')
        serializer = SubdomainCheckSerializer(data={'subdomain': subdomain})
        if serializer.is_valid():
            return Response({'subdomain': subdomain, 'available': True}, status=status.HTTP_200_OK)
        return Response({'subdomain': subdomain, 'available': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class SchoolRegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def post(self, request):
        serializer = SchoolRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            school = result['school']
            return Response({
                'message': 'School registered successfully!',
                'school_id': school.id,
                'name': school.name,
                'subdomain': school.subdomain,
                'portal_url': f"http://{school.subdomain}.localhost:5173"
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TenantInfoView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not request.school:
            return Response({'error': 'No active school tenant found for this subdomain context.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SchoolSerializer(request.school)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SchoolListView(generics.ListAPIView):
    queryset = School.objects.all().order_by('-created_at')
    serializer_class = SchoolSerializer
    permission_classes = [IsSuperAdmin]

from apps.students.models import StudentProfile
from django.db.models import Sum
from apps.academics.models import Section
from apps.attendance.models import StudentAttendance
from apps.fees.models import StudentFeePayment, FeeStructure
from apps.notices.models import Notice

class PublicPlatformStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_schools = School.objects.filter(is_active=True).count()
        total_students = StudentProfile.objects.all().count()
        total_sections = Section.objects.all().count()

        # Overall Revenue
        rev_agg = StudentFeePayment.objects.all().aggregate(total=Sum('amount_paid'))
        total_revenue = float(rev_agg['total']) if rev_agg['total'] else 0.0

        # Overall Attendance
        att_total = StudentAttendance.objects.all().count()
        att_present = StudentAttendance.objects.filter(status='PRESENT').count()
        overall_attendance_rate = round((att_present / att_total) * 100, 1) if att_total > 0 else 96.4

        # Sample Students for preview tab
        sample_students = []
        student_qs = StudentProfile.objects.all().select_related('user', 'section')[:3]
        for s in student_qs:
            sample_students.append({
                'name': s.user.get_full_name(),
                'roll_number': s.roll_number or s.admission_number,
                'status': 'Present',
                'grade': 'A+' if s.id % 3 == 0 else ('A' if s.id % 3 == 1 else 'B+')
            })
        
        # Fallback if empty
        if not sample_students:
            sample_students = [
                { 'name': 'Alexander Wright', 'roll_number': '1001', 'status': 'Present', 'grade': 'A+' },
                { 'name': 'Elena Rostova', 'roll_number': '1002', 'status': 'Present', 'grade': 'A' },
                { 'name': 'Marcus Vance', 'roll_number': '1003', 'status': 'Absent', 'grade': 'B+' }
            ]

        # Sample Fee
        fee_struct = FeeStructure.objects.all().first()
        sample_fee = {
            'name': fee_struct.name if fee_struct else 'Term 2 Tuition Fee',
            'amount': float(fee_struct.amount) if fee_struct else 1250.00,
            'due_date': fee_struct.due_date.strftime('%b %d') if fee_struct else 'Aug 15'
        }

        # Sample Notice
        latest_notice = Notice.objects.all().order_by('-created_at').first()
        sample_notice = {
            'title': latest_notice.title if latest_notice else 'Annual Sports Meet Registration Open',
            'content': latest_notice.content if latest_notice else 'Submit parent consent forms before Friday.'
        }

        return Response({
            'total_schools': total_schools,
            'total_students': total_students,
            'total_sections': total_sections,
            'total_revenue': total_revenue,
            'overall_attendance_rate': overall_attendance_rate,
            'sample_students': sample_students,
            'sample_fee': sample_fee,
            'sample_notice': sample_notice
        }, status=status.HTTP_200_OK)

from apps.schools.models import ContactInquiry

class ContactSupportView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        subject = request.data.get('subject', '').strip() or 'New Public Contact Inquiry'
        message = request.data.get('message', '').strip()

        if not name or not email or not message:
            return Response(
                {'error': 'Name, email, and message are required fields.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save to database
        inquiry = ContactInquiry.objects.create(
            name=name,
            email=email,
            subject=subject,
            message=message
        )

        recipient_email = getattr(settings, 'SUPPORT_EMAIL', 'support.acharyacampus@gmail.com')
        full_message = f"""
New Contact Inquiry from AcharyaCampus Landing Page:

Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}

--------------------------------------------------
Sent via AcharyaCampus Multi-Tenant School OS Platform
"""

        try:
            send_mail(
                subject=f"[AcharyaCampus Contact] {subject}",
                message=full_message,
                from_email=email,
                recipient_list=[recipient_email],
                fail_silently=False
            )
            return Response({
                'message': f'Thank you {name}! Your message has been saved and dispatched to {recipient_email}.',
                'id': inquiry.id
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"[CONTACT INQUIRY SMTP ERROR]: {e}")
            return Response({
                'message': f'Thank you {name}! Your message has been saved into database.',
                'id': inquiry.id
            }, status=status.HTTP_200_OK)

class ContactInquiryListView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        inquiries = ContactInquiry.objects.all().order_by('-created_at')
        data = [{
            'id': i.id,
            'name': i.name,
            'email': i.email,
            'subject': i.subject or 'General Inquiry',
            'message': i.message,
            'is_read': i.is_read,
            'created_at': i.created_at.strftime('%Y-%m-%d %H:%M')
        } for i in inquiries]
        return Response(data, status=status.HTTP_200_OK)


class ToggleSchoolStatusView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            school = School.objects.get(pk=pk)
            school.is_active = not school.is_active
            school.save()
            
            # Also update school's admin user active status
            admin_user = school.users.filter(role='SCHOOL_ADMIN').first()
            if admin_user:
                admin_user.is_active = school.is_active
                admin_user.save()

            status_str = "activated" if school.is_active else "suspended"
            return Response({
                'message': f"School '{school.name}' has been {status_str} successfully.",
                'is_active': school.is_active
            }, status=status.HTTP_200_OK)
        except School.DoesNotExist:
            return Response({'error': 'School not found.'}, status=status.HTTP_404_NOT_FOUND)




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, Avg
from datetime import datetime, date
import calendar

from apps.students.models import StudentProfile
from apps.teachers.models import TeacherProfile
from apps.attendance.models import StudentAttendance
from apps.fees.models import StudentFeePayment, FeeStructure
from apps.exams.models import ExamMark
from apps.academics.models import Section, Subject
from apps.common.permissions import HasTenantAccess

class OverviewReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, HasTenantAccess]

    def get(self, request):
        school = request.school
        if not school:
            return Response({'error': 'No active tenant found'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Total counts
        total_students = StudentProfile.objects.filter(school=school).count()
        total_teachers = TeacherProfile.objects.filter(school=school).count()

        # 2. Total revenue collected
        rev_agg = StudentFeePayment.objects.filter(school=school).aggregate(total=Sum('amount_paid'))
        total_revenue = float(rev_agg['total']) if rev_agg['total'] else 0.00

        # 3. Overall attendance rate
        att_total = StudentAttendance.objects.filter(school=school).count()
        att_present = StudentAttendance.objects.filter(school=school, status='PRESENT').count()
        overall_attendance_rate = round((att_present / att_total) * 100, 1) if att_total > 0 else 95.0

        # 4. Generate past 6 months chronologically for collections and admissions
        monthly_collections = []
        monthly_admissions = []
        today = date.today()
        
        # Build month list
        months_list = []
        for i in range(5, -1, -1):
            m = today.month - i
            y = today.year
            if m <= 0:
                m += 12
                y -= 1
            months_list.append((y, m))

        for y, m in months_list:
            m_name = calendar.month_abbr[m]
            
            # Monthly Fee Collection
            col_agg = StudentFeePayment.objects.filter(
                school=school,
                payment_date__year=y,
                payment_date__month=m
            ).aggregate(total=Sum('amount_paid'))
            amt = float(col_agg['total']) if col_agg['total'] else 0.0
            monthly_collections.append({'month': m_name, 'amount': amt})

            # Monthly Admissions
            adm_count = StudentProfile.objects.filter(
                school=school,
                created_at__year=y,
                created_at__month=m
            ).count()
            monthly_admissions.append({'month': m_name, 'count': adm_count})

        # 5. Fee Collection breakdown by Category
        collection_by_category = []
        cats = FeeStructure.objects.filter(school=school)
        for cat in cats:
            cat_agg = StudentFeePayment.objects.filter(
                school=school,
                fee_structure=cat
            ).aggregate(total=Sum('amount_paid'))
            amt = float(cat_agg['total']) if cat_agg['total'] else 0.0
            collection_by_category.append({'category': cat.name, 'amount': amt})

        # 6. Attendance Rate by Section
        section_attendance = []
        sections = Section.objects.filter(school=school)
        for sec in sections:
            sec_total = StudentAttendance.objects.filter(school=school, student__section=sec).count()
            sec_present = StudentAttendance.objects.filter(school=school, student__section=sec, status='PRESENT').count()
            rate = round((sec_present / sec_total) * 100, 1) if sec_total > 0 else 95.0
            section_attendance.append({
                'section_name': f"{sec.class_level.name} - {sec.name}",
                'rate': rate
            })

        # 7. Academic Grade average scores by Subject
        average_scores_by_subject = []
        subjects = Subject.objects.filter(school=school)
        for sub in subjects:
            sub_avg = ExamMark.objects.filter(school=school, subject=sub).aggregate(avg=Avg('marks_obtained'))
            avg_val = round(float(sub_avg['avg']), 1) if sub_avg['avg'] else 0.0
            average_scores_by_subject.append({
                'subject_name': sub.name,
                'average': avg_val
            })

        return Response({
            'school_name': school.name,
            'overview': {
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_revenue': total_revenue,
                'overall_attendance_rate': overall_attendance_rate
            },
            'fee_analytics': {
                'total_collected': total_revenue,
                'monthly_collections': monthly_collections,
                'collection_by_category': collection_by_category
            },
            'attendance_analytics': {
                'overall_rate': overall_attendance_rate,
                'section_attendance': section_attendance
            },
            'admissions_analytics': {
                'monthly_admissions': monthly_admissions
            },
            'academic_analytics': {
                'average_scores_by_subject': average_scores_by_subject
            }
        }, status=status.HTTP_200_OK)

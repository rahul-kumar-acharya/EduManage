from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from apps.academics.views import BaseTenantViewSet
from apps.exams.models import Exam, ExamMark
from apps.exams.serializers import (
    ExamSerializer,
    ExamMarkSerializer,
    BulkExamMarkSerializer,
    compute_grade
)
from apps.students.models import StudentProfile
from apps.students.serializers import StudentProfileSerializer

class ExamViewSet(BaseTenantViewSet):
    queryset = Exam.objects.all().order_by('-start_date')
    serializer_class = ExamSerializer

    def get_permissions(self):
        from apps.common.permissions import IsTeacher, IsTeacherOrStudentParent, HasTenantAccess
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsTeacher(), HasTenantAccess()]
        return [IsTeacherOrStudentParent(), HasTenantAccess()]

class ExamMarkViewSet(BaseTenantViewSet):
    queryset = ExamMark.objects.all().select_related('exam', 'student', 'student__user', 'subject')
    serializer_class = ExamMarkSerializer

    def get_permissions(self):
        from apps.common.permissions import IsTeacher, IsTeacherOrStudentParent, HasTenantAccess
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_entry']:
            return [IsTeacher(), HasTenantAccess()]
        return [IsTeacherOrStudentParent(), HasTenantAccess()]

    def get_queryset(self):
        qs = super().get_queryset()
        exam_id = self.request.query_params.get('exam')
        if exam_id:
            qs = qs.filter(exam_id=exam_id)
        subject_id = self.request.query_params.get('subject')
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        section_id = self.request.query_params.get('section')
        if section_id:
            qs = qs.filter(student__section_id=section_id)
        student_id = self.request.query_params.get('student')
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs

    @action(detail=False, methods=['post'], url_path='bulk-entry')
    @transaction.atomic
    def bulk_entry(self, request):
        serializer = BulkExamMarkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        school = request.school
        exam_id = serializer.validated_data['exam_id']
        subject_id = serializer.validated_data['subject_id']
        records = serializer.validated_data['records']

        count = 0
        for rec in records:
            obj, created = ExamMark.objects.update_or_create(
                school=school,
                exam_id=exam_id,
                subject_id=subject_id,
                student_id=rec['student_id'],
                defaults={
                    'marks_obtained': rec['marks_obtained'],
                    'max_marks': rec['max_marks']
                }
            )
            count += 1

        return Response({
            'message': f"Saved marks for {count} students successfully.",
            'exam_id': exam_id,
            'subject_id': subject_id
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='report-card')
    def report_card(self, request):
        student_id = request.query_params.get('student_id')
        exam_id = request.query_params.get('exam_id')

        if not student_id or not exam_id:
            return Response({'error': 'student_id and exam_id parameters are required.'}, status=status.HTTP_400_BAD_REQUEST)

        student = StudentProfile.objects.filter(school=request.school, id=student_id).first()
        exam = Exam.objects.filter(school=request.school, id=exam_id).first()

        if not student or not exam:
            return Response({'error': 'Student or Exam not found for this tenant.'}, status=status.HTTP_404_NOT_FOUND)

        marks_qs = ExamMark.objects.filter(school=request.school, student=student, exam=exam).select_related('subject')
        serialized_marks = ExamMarkSerializer(marks_qs, many=True).data

        total_obtained = sum(float(m.marks_obtained) for m in marks_qs)
        total_max = sum(float(m.max_marks) for m in marks_qs)
        overall_pct = round((total_obtained / total_max) * 100, 2) if total_max > 0 else 0.0
        overall_grade = compute_grade(overall_pct)

        return Response({
            'school_name': request.school.name,
            'student': StudentProfileSerializer(student).data,
            'exam': ExamSerializer(exam).data,
            'marks': serialized_marks,
            'total_obtained': total_obtained,
            'total_max': total_max,
            'overall_percentage': overall_pct,
            'overall_grade': overall_grade
        }, status=status.HTTP_200_OK)

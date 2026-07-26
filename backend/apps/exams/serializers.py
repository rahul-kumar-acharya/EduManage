from rest_framework import serializers
from apps.exams.models import Exam, ExamMark
from apps.students.serializers import StudentProfileSerializer
from apps.academics.serializers import SubjectSerializer

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ['id', 'name', 'start_date', 'end_date', 'created_at']
        read_only_fields = ['id', 'created_at']

def compute_grade(percentage):
    if percentage >= 90: return 'A+'
    if percentage >= 80: return 'A'
    if percentage >= 70: return 'B'
    if percentage >= 60: return 'C'
    if percentage >= 50: return 'D'
    return 'F'

class ExamMarkSerializer(serializers.ModelSerializer):
    student_details = StudentProfileSerializer(source='student', read_only=True)
    subject_details = SubjectSerializer(source='subject', read_only=True)
    percentage = serializers.SerializerMethodField()
    grade = serializers.SerializerMethodField()

    class Meta:
        model = ExamMark
        fields = ['id', 'exam', 'student', 'student_details', 'subject', 'subject_details', 'marks_obtained', 'max_marks', 'percentage', 'grade', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_percentage(self, obj):
        if not obj.max_marks or obj.max_marks == 0:
            return 0.0
        return round((float(obj.marks_obtained) / float(obj.max_marks)) * 100, 2)

    def get_grade(self, obj):
        pct = self.get_percentage(obj)
        return compute_grade(pct)

class BulkExamMarkItemSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    marks_obtained = serializers.DecimalField(max_digits=5, decimal_places=2)
    max_marks = serializers.DecimalField(max_digits=5, decimal_places=2, default=100.00)

class BulkExamMarkSerializer(serializers.Serializer):
    exam_id = serializers.IntegerField()
    subject_id = serializers.IntegerField()
    section_id = serializers.IntegerField()
    records = BulkExamMarkItemSerializer(many=True)

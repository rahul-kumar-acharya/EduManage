from rest_framework import serializers
from apps.attendance.models import StudentAttendance
from apps.students.serializers import StudentProfileSerializer

class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_details = StudentProfileSerializer(source='student', read_only=True)

    class Meta:
        model = StudentAttendance
        fields = ['id', 'student', 'student_details', 'date', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

class BulkAttendanceItemSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=[('PRESENT', 'Present'), ('ABSENT', 'Absent'), ('LATE', 'Late'), ('LEAVE', 'On Leave')])

class BulkAttendanceSerializer(serializers.Serializer):
    section_id = serializers.IntegerField()
    date = serializers.DateField()
    records = BulkAttendanceItemSerializer(many=True)

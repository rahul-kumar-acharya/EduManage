from rest_framework import serializers
from apps.timetable.models import TimetablePeriod
from apps.academics.serializers import SectionSerializer, SubjectSerializer
from apps.teachers.serializers import TeacherProfileSerializer

class TimetablePeriodSerializer(serializers.ModelSerializer):
    section_details = SectionSerializer(source='section', read_only=True)
    subject_details = SubjectSerializer(source='subject', read_only=True)
    teacher_details = TeacherProfileSerializer(source='teacher', read_only=True)

    class Meta:
        model = TimetablePeriod
        fields = ['id', 'section', 'section_details', 'subject', 'subject_details', 'teacher', 'teacher_details', 'day_of_week', 'start_time', 'end_time', 'created_at']
        read_only_fields = ['id', 'created_at']

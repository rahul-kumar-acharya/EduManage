from rest_framework import serializers
from apps.homework.models import HomeworkAssignment
from apps.academics.serializers import SectionSerializer, SubjectSerializer

class HomeworkAssignmentSerializer(serializers.ModelSerializer):
    section_details = SectionSerializer(source='section', read_only=True)
    subject_details = SubjectSerializer(source='subject', read_only=True)

    class Meta:
        model = HomeworkAssignment
        fields = ['id', 'section', 'section_details', 'subject', 'subject_details', 'title', 'description', 'due_date', 'created_at']
        read_only_fields = ['id', 'created_at']

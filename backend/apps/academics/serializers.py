from rest_framework import serializers
from apps.academics.models import AcademicSession, ClassLevel, Section, Subject

class AcademicSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSession
        fields = ['id', 'name', 'start_date', 'end_date', 'is_current', 'created_at']
        read_only_fields = ['id', 'created_at']

class SectionSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_level.name', read_only=True)
    class_teacher_name = serializers.CharField(source='class_teacher.user.get_full_name', read_only=True, default='')

    class Meta:
        model = Section
        fields = ['id', 'class_level', 'class_name', 'name', 'class_teacher', 'class_teacher_name', 'created_at']
        read_only_fields = ['id', 'created_at']

class ClassLevelSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)

    class Meta:
        model = ClassLevel
        fields = ['id', 'name', 'academic_session', 'sections', 'created_at']
        read_only_fields = ['id', 'created_at']

class SubjectSerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(source='class_level.name', read_only=True, default='')
    section_name = serializers.CharField(source='section.name', read_only=True, default='')
    class_name = serializers.CharField(source='section.class_level.name', read_only=True, default='')

    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'class_level', 'class_level_name', 'section', 'section_name', 'class_name', 'created_at']
        read_only_fields = ['id', 'created_at']


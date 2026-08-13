from rest_framework import serializers
from apps.academics.models import AcademicSession, ClassLevel, Section, Subject

import re
import datetime

class AcademicSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSession
        fields = ['id', 'name', 'start_date', 'end_date', 'is_current', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        name = data.get('name', getattr(self.instance, 'name', '')).strip()
        start_date = data.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = data.get('end_date', getattr(self.instance, 'end_date', None))

        current_year = datetime.date.today().year

        # 1. Validate Session Name Year Span (e.g., "2026 - 2028" is invalid)
        if name:
            match = re.search(r'(\d{4})\s*[-–/]\s*(\d{4})', name)
            if match:
                y1 = int(match.group(1))
                y2 = int(match.group(2))
                if y2 - y1 != 1:
                    raise serializers.ValidationError({
                        'name': f"Session name year range must be exactly 1 year (e.g., {y1} - {y1+1}). Multi-year span '{name}' is not permitted."
                    })
                if not self.instance and y1 != current_year:
                    raise serializers.ValidationError({
                        'name': f"Session name starting year ({y1}) must be the current ongoing year ({current_year})."
                    })

        # 2. Only validate ongoing year constraint on new session creation
        if not self.instance and start_date:
            if start_date.year != current_year:
                raise serializers.ValidationError({
                    'start_date': f"Session start date must be in the current ongoing year ({current_year}). Past or future start years are not permitted."
                })

        # 3. Validate start_date vs end_date duration
        if start_date and end_date:
            if end_date <= start_date:
                raise serializers.ValidationError({
                    'end_date': "End date must be after the start date."
                })

            duration_days = (end_date - start_date).days
            if duration_days < 350 or duration_days > 366:
                raise serializers.ValidationError({
                    'end_date': f"Academic session duration must be exactly 1 year (12 months / 365 days). Current selection span is {duration_days} days."
                })

        return data



class SectionSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_level.name', read_only=True)
    class_teacher_name = serializers.CharField(source='class_teacher.user.get_full_name', read_only=True, default='')

    class Meta:
        model = Section
        fields = ['id', 'class_level', 'class_name', 'name', 'class_teacher', 'class_teacher_name', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        name = value.strip()
        suffix = re.sub(r'^section\s*', '', name, flags=re.IGNORECASE).strip().upper()
        if suffix not in ['A', 'B', 'C']:
            raise serializers.ValidationError(
                "Section division must be only A, B, or C (e.g. Section A, Section B, Section C)."
            )
        return f"Section {suffix}"



class ClassLevelSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)

    class Meta:
        model = ClassLevel
        fields = ['id', 'name', 'academic_session', 'sections', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        name = value.strip()
        
        # Check preschool levels
        upper_name = name.upper()
        if upper_name in ['NURSERY', 'GRADE NURSERY']:
            return 'Nursery'
        if upper_name in ['LKG', 'GRADE LKG']:
            return 'LKG'
        if upper_name in ['UKG', 'GRADE UKG']:
            return 'UKG'
        
        # Check Grade 1 to 10
        suffix = re.sub(r'^grade\s*', '', name, flags=re.IGNORECASE).strip()
        if suffix.isdigit():
            num = int(suffix)
            if 1 <= num <= 10:
                return f"Grade {num}"

        raise serializers.ValidationError(
            "Invalid class level. Allowed classes are Nursery, LKG, UKG, and Grade 1 through Grade 10."
        )




class SubjectSerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(source='class_level.name', read_only=True, default='')
    section_name = serializers.CharField(source='section.name', read_only=True, default='')
    class_name = serializers.CharField(source='section.class_level.name', read_only=True, default='')

    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'class_level', 'class_level_name', 'section', 'section_name', 'class_name', 'created_at']
        read_only_fields = ['id', 'created_at']


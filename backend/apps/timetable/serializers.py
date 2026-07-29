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
        fields = ['id', 'section', 'section_details', 'subject', 'subject_details', 'teacher', 'teacher_details', 'day_of_week', 'start_time', 'end_time', 'room_number', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        teacher = attrs.get('teacher')
        day_of_week = attrs.get('day_of_week')
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')

        # Check for self instance during update
        instance_id = self.instance.id if self.instance else None

        if teacher and day_of_week and start_time and end_time:
            # Query for conflicting periods for this teacher on the same day and time
            conflict_qs = TimetablePeriod.objects.filter(
                teacher=teacher,
                day_of_week=day_of_week,
                start_time=start_time,
                end_time=end_time
            )
            if instance_id:
                conflict_qs = conflict_qs.exclude(id=instance_id)

            if conflict_qs.exists():
                conflict_period = conflict_qs.first()
                sec_name = f"{conflict_period.section.class_level.name} - Sec {conflict_period.section.name}" if hasattr(conflict_period.section, 'class_level') else conflict_period.section.name
                teacher_name = f"{teacher.user.first_name} {teacher.user.last_name}" if teacher.user else "Selected Teacher"
                raise serializers.ValidationError({
                    "teacher": f"Conflict: {teacher_name} is already assigned to teach {conflict_period.subject.name} in {sec_name} during this period slot ({day_of_week} {start_time}-{end_time})."
                })

        return attrs


import random
import string
from datetime import date
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import get_user_model
from apps.students.models import StudentProfile
from apps.accounts.serializers import UserSerializer
from apps.academics.serializers import SectionSerializer
from apps.common.constants import UserRole

User = get_user_model()

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    section_details = SectionSerializer(source='section', read_only=True)

    # Write-only fields for student user info
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'admission_number', 'roll_number', 'section', 'section_details', 
            'guardian_name', 'guardian_phone', 'guardian_email', 'created_at', 'first_name', 'last_name', 
            'phone'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_section(self, value):
        request = self.context.get('request')
        if not request:
            return value
        user = request.user
        if user.role == 'TEACHER':
            teacher_profile = getattr(user, 'teacher_profile', None)
            if not teacher_profile:
                raise serializers.ValidationError("Teacher profile not found.")
            if value and value.class_teacher != teacher_profile:
                raise serializers.ValidationError("You are not authorized to assign students to this section.")
        return value

    @transaction.atomic
    def update(self, instance, validated_data):
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        phone = validated_data.pop('phone', None)

        user = instance.user
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if phone is not None:
            user.phone = phone
        user.save()

        return super().update(instance, validated_data)

class StudentCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    admission_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    roll_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    section = serializers.IntegerField(required=False, allow_null=True)
    guardian_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    guardian_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    guardian_email = serializers.EmailField(required=False, allow_blank=True)

    def validate_first_name(self, value):
        from apps.common.utils import clean_name
        return clean_name(value, "First Name")

    def validate_last_name(self, value):
        from apps.common.utils import clean_name
        return clean_name(value, "Last Name")

    def validate_guardian_name(self, value):
        if value:
            from apps.common.utils import clean_name
            return clean_name(value, "Guardian Name")
        return value

    def validate_guardian_phone(self, value):
        if value:
            import re
            digits = re.sub(r'[\s\-\(\)\+]', '', value)
            if not re.match(r'^[6-9]\d{9}$', digits):
                raise serializers.ValidationError("Guardian Phone must be a valid 10-digit mobile number starting with 6, 7, 8, or 9.")
            if User.objects.filter(phone=digits).exists():
                raise serializers.ValidationError("A user with this phone number already exists.")
            return digits
        return value

    def validate(self, attrs):
        request = self.context['request']
        school = request.school
        user = request.user
        section_id = attrs.get('section')
        roll_number = attrs.get('roll_number', '').strip()

        if user.role == 'TEACHER':
            teacher_profile = getattr(user, 'teacher_profile', None)
            if not teacher_profile:
                raise serializers.ValidationError("Teacher profile not found.")
            from apps.academics.models import Section
            if section_id and not Section.objects.filter(id=section_id, class_teacher=teacher_profile).exists():
                raise serializers.ValidationError({"section": "You are not authorized to assign students to this section."})

        # Strict Sequential Roll Number validation per section
        if section_id:
            existing_rolls = StudentProfile.objects.filter(school=school, section_id=section_id).values_list('roll_number', flat=True)
            valid_nums = [int(r) for r in existing_rolls if r and r.isdigit()]
            expected_next = max(valid_nums) + 1 if valid_nums else 1

            if not roll_number:
                attrs['roll_number'] = str(expected_next)
            else:
                if not roll_number.isdigit():
                    raise serializers.ValidationError({"roll_number": "Roll Number must be digits only."})
                entered_roll = int(roll_number)
                if entered_roll != expected_next:
                    raise serializers.ValidationError({
                        "roll_number": f"Roll Numbers must follow sequential order (1, 2, 3...). Next required Roll Number for this section is #{expected_next}."
                    })


        # Admission Number check
        admission_number = attrs.get('admission_number', '').strip()
        if admission_number and StudentProfile.objects.filter(school=school, admission_number=admission_number).exists():
            raise serializers.ValidationError({"admission_number": "A student with this Admission Number already exists in your school."})

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context['request']
        school = request.school
        section_id = validated_data.get('section')

        # Auto-generate admission_number if blank
        admission_number = validated_data.get('admission_number', '').strip()
        if not admission_number:
            current_year = date.today().year
            count = StudentProfile.objects.filter(school=school).count() + 1
            admission_number = f"ADM-{current_year}-{count:04d}"

        # Auto-generate temporary password
        chars = string.ascii_letters + string.digits
        temp_password = ''.join(random.choices(chars, k=10))

        guardian_email = validated_data.get('guardian_email', '').strip()
        username = f"std_{admission_number.lower().replace('-', '_').replace(' ', '')}"

        user = User.objects.create_user(
            username=username,
            email=guardian_email,
            password=temp_password,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('guardian_phone', ''),
            role=UserRole.STUDENT,
            school=school
        )

        profile = StudentProfile.objects.create(
            school=school,
            user=user,
            admission_number=admission_number,
            roll_number=validated_data.get('roll_number', ''),
            section_id=section_id,
            guardian_name=validated_data.get('guardian_name', ''),
            guardian_phone=validated_data.get('guardian_phone', ''),
            guardian_email=guardian_email
        )

        # Dispatch Welcome Email to Guardian if email provided
        if guardian_email:
            try:
                subject = f"Welcome to {school.name} — Student Login Credentials"
                message = f"""Dear {validated_data.get('guardian_name') or 'Parent'},

Your child {validated_data['first_name']} {validated_data['last_name']} has been enrolled at {school.name}.

Student Account Details:
- Admission Number: {admission_number}
- Roll Number: {validated_data.get('roll_number') or 'N/A'}
- Username: {username}
- Temporary Password: {temp_password}

Login Portal: http://{school.subdomain}.localhost:5173/login

Best regards,
{school.name} Administration
"""
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL or 'support.acharyacampus@gmail.com',
                    [guardian_email],
                    fail_silently=True
                )
            except Exception as e:
                pass

        return profile


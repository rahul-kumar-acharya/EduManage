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
    email = serializers.EmailField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=8)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'admission_number', 'roll_number', 'section', 'section_details', 
            'guardian_name', 'guardian_phone', 'created_at', 'first_name', 'last_name', 
            'email', 'password', 'phone'
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
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)
        phone = validated_data.pop('phone', None)

        user = instance.user
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if email is not None and email.lower() != user.email.lower():
            if User.objects.filter(email__iexact=email).exists():
                raise serializers.ValidationError({"email": "A user with this email already exists."})
            user.email = email
            user.username = email
        if phone is not None:
            user.phone = phone
        if password:
            user.set_password(password)
        user.save()

        return super().update(instance, validated_data)

class StudentCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    admission_number = serializers.CharField(max_length=50)
    roll_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    section = serializers.IntegerField(required=False, allow_null=True)
    guardian_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    guardian_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        request = self.context['request']
        school = request.school
        user = request.user
        section_id = attrs.get('section')

        if user.role == 'TEACHER':
            teacher_profile = getattr(user, 'teacher_profile', None)
            if not teacher_profile:
                raise serializers.ValidationError("Teacher profile not found.")
            from apps.academics.models import Section
            if section_id and not Section.objects.filter(id=section_id, class_teacher=teacher_profile).exists():
                raise serializers.ValidationError({"section": "You are not authorized to assign students to this section."})

        admission_number = attrs.get('admission_number')
        if StudentProfile.objects.filter(school=school, admission_number=admission_number).exists():
            raise serializers.ValidationError({"admission_number": "A student with this Admission Number already exists in your school."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        school = self.context['request'].school
        section_id = validated_data.get('section')

        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('phone', ''),
            role=UserRole.STUDENT,
            school=school
        )

        profile = StudentProfile.objects.create(
            school=school,
            user=user,
            admission_number=validated_data['admission_number'],
            roll_number=validated_data.get('roll_number', ''),
            section_id=section_id,
            guardian_name=validated_data.get('guardian_name', ''),
            guardian_phone=validated_data.get('guardian_phone', '')
        )

        return profile

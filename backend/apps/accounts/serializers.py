from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from apps.schools.models import School

User = get_user_model()

class SchoolMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['id', 'name', 'subdomain', 'logo', 'email']

class UserSerializer(serializers.ModelSerializer):
    school = SchoolMinimalSerializer(read_only=True)
    permissions = serializers.SerializerMethodField()
    class_teacher_sections = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'school', 'phone', 'profile_picture', 'is_active', 'date_joined', 'permissions', 'class_teacher_sections']
        read_only_fields = ['id', 'date_joined']

    def get_permissions(self, obj):
        from apps.common.permissions import get_user_permissions
        return get_user_permissions(obj)

    def get_class_teacher_sections(self, obj):
        if obj.role == 'TEACHER' and hasattr(obj, 'teacher_profile'):
            return [
                {
                    "id": sec.id,
                    "class_level_id": sec.class_level.id,
                    "class_level_name": sec.class_level.name,
                    "section_name": sec.name
                }
                for sec in obj.teacher_profile.assigned_sections.all()
            ]
        return []

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

from apps.academics.views import BaseTenantViewSet
from apps.teachers.models import TeacherProfile
from apps.teachers.serializers import TeacherProfileSerializer, TeacherCreateSerializer
from rest_framework import status
from rest_framework.response import Response
from apps.common.permissions import IsSchoolAdmin, HasTenantAccess

class TeacherProfileViewSet(BaseTenantViewSet):
    queryset = TeacherProfile.objects.all().select_related('user', 'school').prefetch_related('assigned_sections', 'assigned_sections__class_level').order_by('-created_at')

    def get_permissions(self):
      from apps.common.permissions import IsSchoolAdmin, IsSchoolAdminOrTeacherOrStudentParent, HasTenantAccess
      if self.action in ['create', 'update', 'partial_update', 'destroy']:
          return [IsSchoolAdmin(), HasTenantAccess()]
      return [IsSchoolAdminOrTeacherOrStudentParent(), HasTenantAccess()]

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherCreateSerializer
        return TeacherProfileSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return Response(TeacherProfileSerializer(profile).data, status=status.HTTP_201_CREATED)

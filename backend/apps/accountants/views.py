from apps.academics.views import BaseTenantViewSet
from apps.accountants.models import AccountantProfile
from apps.accountants.serializers import AccountantProfileSerializer, AccountantCreateSerializer
from rest_framework import status
from rest_framework.response import Response
from apps.common.permissions import IsSchoolAdmin, HasTenantAccess

class AccountantProfileViewSet(BaseTenantViewSet):
    permission_classes = [IsSchoolAdmin, HasTenantAccess]
    queryset = AccountantProfile.objects.all().select_related('user', 'school').order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return AccountantCreateSerializer
        return AccountantProfileSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return Response(AccountantProfileSerializer(profile).data, status=status.HTTP_201_CREATED)

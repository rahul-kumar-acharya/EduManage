from apps.academics.views import BaseTenantViewSet
from apps.notices.models import Notice
from apps.notices.serializers import NoticeSerializer

class NoticeViewSet(BaseTenantViewSet):
    queryset = Notice.objects.all().order_by('-created_at')
    serializer_class = NoticeSerializer

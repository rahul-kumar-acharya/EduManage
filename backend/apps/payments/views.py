from apps.academics.views import BaseTenantViewSet
from apps.payments.models import PaymentTransaction
from apps.payments.serializers import PaymentTransactionSerializer

class PaymentTransactionViewSet(BaseTenantViewSet):
    queryset = PaymentTransaction.objects.all()
    serializer_class = PaymentTransactionSerializer

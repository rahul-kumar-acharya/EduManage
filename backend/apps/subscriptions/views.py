from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import date, timedelta
from apps.subscriptions.models import SubscriptionPlan, SchoolSubscription
from apps.subscriptions.serializers import SubscriptionPlanSerializer, SchoolSubscriptionSerializer
from apps.common.permissions import IsSuperAdmin, IsSchoolAdmin

class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]

class SchoolSubscriptionDetailView(generics.RetrieveAPIView):
    serializer_class = SchoolSubscriptionSerializer
    permission_classes = [IsSchoolAdmin]

    def get_object(self):
        return getattr(self.request.school, 'subscription', None)

class CheckoutSubscriptionView(APIView):
    permission_classes = [IsSchoolAdmin]

    def post(self, request):
        school = request.school
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({'error': 'plan_id parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        plan = SubscriptionPlan.objects.filter(id=plan_id, is_active=True).first()
        if not plan:
            return Response({'error': 'Subscription plan not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Simulation: assume payment succeeds
        # Extend the subscription duration by 30 days for monthly, or 365 days for yearly
        days_to_add = 365 if plan.billing_cycle == 'YEARLY' else 30
        end_date = date.today() + timedelta(days=days_to_add)

        sub, created = SchoolSubscription.objects.update_or_create(
            school=school,
            defaults={
                'plan': plan,
                'status': 'ACTIVE',
                'end_date': end_date
            }
        )

        return Response(SchoolSubscriptionSerializer(sub).data, status=status.HTTP_200_OK)

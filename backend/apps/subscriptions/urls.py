from django.urls import path
from apps.subscriptions.views import (
    SubscriptionPlanListView, 
    SchoolSubscriptionDetailView,
    CheckoutSubscriptionView
)

urlpatterns = [
    path('plans/', SubscriptionPlanListView.as_view(), name='subscription-plans'),
    path('current/', SchoolSubscriptionDetailView.as_view(), name='subscription-current'),
    path('checkout/', CheckoutSubscriptionView.as_view(), name='subscription-checkout'),
]

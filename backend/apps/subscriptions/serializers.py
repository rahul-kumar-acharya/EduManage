from rest_framework import serializers
from apps.subscriptions.models import SubscriptionPlan, SchoolSubscription

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class SchoolSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)

    class Meta:
        model = SchoolSubscription
        fields = '__all__'

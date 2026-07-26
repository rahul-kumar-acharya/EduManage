from rest_framework import serializers

class OverviewReportSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    total_teachers = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    attendance_rate = serializers.FloatField()

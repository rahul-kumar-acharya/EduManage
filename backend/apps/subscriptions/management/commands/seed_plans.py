from django.core.management.base import BaseCommand
from apps.subscriptions.models import SubscriptionPlan
from django.contrib.auth import get_user_model
from apps.common.constants import UserRole

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial subscription plans and superadmin user.'

    def handle(self, *args, **options):
        # 1. Plans
        plans = [
            {'name': 'Starter Plan', 'code': 'starter', 'price': 0.00, 'max_students': 100, 'max_teachers': 10},
            {'name': 'Growth Plan', 'code': 'growth', 'price': 49.00, 'max_students': 500, 'max_teachers': 50},
            {'name': 'Enterprise Plan', 'code': 'enterprise', 'price': 149.00, 'max_students': 5000, 'max_teachers': 500},
        ]

        for p in plans:
            plan, created = SubscriptionPlan.objects.get_or_create(code=p['code'], defaults=p)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created plan: {plan.name}"))
            else:
                self.stdout.write(f"Plan already exists: {plan.name}")

        # 2. SuperAdmin
        if not User.objects.filter(role=UserRole.SUPER_ADMIN).exists():
            admin_email = 'support.acharyacampus@gmail.com'
            admin_user = User.objects.create_superuser(
                username=admin_email,
                email=admin_email,
                password='AdminPassword123!',
                first_name='Super',
                last_name='Admin',
                role=UserRole.SUPER_ADMIN
            )
            self.stdout.write(self.style.SUCCESS(f"Created SuperAdmin user: {admin_user.email} (Password: AdminPassword123!)"))
        else:
            self.stdout.write("SuperAdmin user already exists.")

from django.contrib import admin
from apps.accountants.models import AccountantProfile

@admin.register(AccountantProfile)
class AccountantProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'employee_id', 'school')
    list_filter = ('school',)
    search_fields = ('employee_id', 'user__first_name', 'user__last_name', 'user__email')

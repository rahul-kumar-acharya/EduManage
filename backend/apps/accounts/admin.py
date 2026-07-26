from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from apps.accounts.models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('SaaS Tenant Config', {'fields': ('role', 'school', 'phone', 'profile_picture')}),
    )
    list_display = ('email', 'first_name', 'last_name', 'role', 'school', 'is_active')
    list_filter = ('role', 'school', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

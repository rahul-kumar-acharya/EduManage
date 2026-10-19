from django.conf import settings

def extract_subdomain(host):
    """
    Extracts subdomain from HTTP Host header.
    Handles 'abcschool.acharyarahul.in', 'abcschool.localhost:8000', etc.
    Returns None if main domain or IP address.
    """
    if not host:
        return None

    # Remove port if present
    host_without_port = host.split(':')[0].lower()

    # Ignored exact hosts
    if host_without_port in ['localhost', '127.0.0.1', 'campus.acharyarahul.in', 'www.campus.acharyarahul.in', 'admin.campus.acharyarahul.in']:
        return None

    parts = host_without_port.split('.')

    # e.g., abcschool.localhost -> ['abcschool', 'localhost']
    if len(parts) == 2 and parts[1] == 'localhost':
        return parts[0]

    # e.g., abcschool.campus.acharyarahul.in -> ['abcschool', 'campus', 'acharyarahul', 'in']
    if len(parts) >= 4 and parts[-3:] == ['campus', 'acharyarahul', 'in']:
        if parts[0] != 'www' and parts[0] != 'admin':
            return parts[0]

    # Generic fallback
    if len(parts) >= 3:
        if parts[0] != 'www' and parts[0] != 'admin' and parts[0] != 'campus':
            return parts[0]

    return None

import re
from rest_framework.exceptions import ValidationError

def clean_name(value, field_name="Name"):
    """
    Validates and cleans names:
    - Removes extra consecutive, leading, and trailing whitespace
    - Ensures ONLY letters (a-z, A-Z) and single spaces between words
    - Blocks numbers and special characters
    """
    if not value:
        return ""
    
    cleaned = re.sub(r'\s+', ' ', str(value).strip())
    
    if not cleaned:
        return ""
        
    if not re.match(r'^[a-zA-Z]+(?:\s[a-zA-Z]+)*$', cleaned):
        raise ValidationError(f"{field_name} can only contain alphabetic letters and spaces. Numbers, special characters, and extra spaces are not allowed.")
        
    return cleaned


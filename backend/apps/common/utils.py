from django.conf import settings

def extract_subdomain(host):
    """
    Extracts subdomain from HTTP Host header.
    Handles 'abcschool.xyz.com', 'abcschool.localhost:8000', etc.
    Returns None if main domain or IP address.
    """
    if not host:
        return None

    # Remove port if present
    host_without_port = host.split(':')[0].lower()

    # Ignored exact hosts
    if host_without_port in ['localhost', '127.0.0.1', 'xyz.com', 'admin.xyz.com']:
        return None

    parts = host_without_port.split('.')

    # e.g., abcschool.localhost -> ['abcschool', 'localhost']
    if len(parts) == 2 and parts[1] in ['localhost', 'xyz.com']:
        return parts[0]

    # e.g., abcschool.xyz.com -> ['abcschool', 'xyz', 'com']
    if len(parts) >= 3:
        if parts[0] != 'www' and parts[0] != 'admin':
            return parts[0]

    return None

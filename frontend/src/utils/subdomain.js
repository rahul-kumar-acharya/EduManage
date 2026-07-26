export const getSubdomain = () => {
  const hostname = window.location.hostname.toLowerCase();

  // Allow manual dev override from localStorage if set
  const devSubdomain = localStorage.getItem('DEV_TENANT_SUBDOMAIN');
  if (devSubdomain) {
    return devSubdomain;
  }

  // Exact main domain matches
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'edumanage.acharyaworks.in') {
    return null;
  }

  const parts = hostname.split('.');

  // e.g. abcschool.localhost -> ['abcschool', 'localhost']
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0] === 'www' ? null : parts[0];
  }

  // e.g. abcschool.edumanage.acharyaworks.in -> ['abcschool', 'edumanage', 'acharyaworks', 'in']
  if (parts.length >= 3) {
    if (parts[0] === 'www') return null;
    return parts[0];
  }

  return null;
};

export const isSuperAdminDomain = () => {
  const subdomain = getSubdomain();
  return subdomain === 'admin';
};

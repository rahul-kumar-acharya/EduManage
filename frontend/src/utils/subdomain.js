export const getSubdomain = () => {
  const hostname = window.location.hostname.toLowerCase();

  // Allow manual dev override from localStorage if set
  const devSubdomain = localStorage.getItem('DEV_TENANT_SUBDOMAIN');
  if (devSubdomain) {
    return devSubdomain;
  }

  // Exact main domain matches (Always show Home page)
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === 'campus.acharyarahul.in' ||
    hostname === 'www.campus.acharyarahul.in' ||
    hostname === 'acharyarahul.in' ||
    hostname === 'www.acharyarahul.in'
  ) {
    return null;
  }

  const parts = hostname.split('.');

  // Localhost tenant subdomains (e.g. dps.localhost -> ['dps', 'localhost'])
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0] === 'www' ? null : parts[0];
  }

  // Production tenant subdomains (e.g. dps.campus.acharyarahul.in -> ['dps', 'campus', 'acharyarahul', 'in'])
  if (parts.length >= 4 && parts.slice(-3).join('.') === 'campus.acharyarahul.in') {
    if (parts[0] === 'www' || parts[0] === 'api' || parts[0] === 'campus') return null;
    return parts[0];
  }

  // Vercel deployment & preview domains (e.g. edumanage.vercel.app, project-xyz.vercel.app)
  // Direct vercel.app domains (3 parts) are main marketing sites -> show Home page!
  if (hostname.endsWith('.vercel.app')) {
    if (parts.length <= 3) {
      return null;
    }
    // Subdomain testing on vercel (4+ parts, e.g. dps.edumanage.vercel.app)
    return parts[0] === 'www' || parts[0] === 'api' ? null : parts[0];
  }

  // Fallback for custom domains or other multi-level subdomains
  if (parts.length >= 3) {
    if (parts[0] === 'www' || parts[0] === 'api' || parts[0] === 'campus') return null;
    return parts[0];
  }

  return null;
};

export const isSuperAdminDomain = () => {
  const subdomain = getSubdomain();
  return subdomain === 'admin';
};

/**
 * Generates an accurate, environment-aware full URL for a given tenant subdomain.
 * Correctly targets .localhost in development and campus.acharyarahul.in in production.
 */
export const getTenantUrl = (tenantSubdomain, path = '') => {
  if (!tenantSubdomain) return '/';
  const hostname = window.location.hostname.toLowerCase();
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  // Localhost development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
    return `${protocol}//${tenantSubdomain}.localhost${port}${cleanPath}`;
  }

  // Production environment or Vercel preview (target campus.acharyarahul.in)
  if (
    hostname === 'campus.acharyarahul.in' ||
    hostname === 'www.campus.acharyarahul.in' ||
    hostname.endsWith('.campus.acharyarahul.in') ||
    hostname.endsWith('.vercel.app') ||
    hostname.endsWith('acharyarahul.in')
  ) {
    return `https://${tenantSubdomain}.campus.acharyarahul.in${cleanPath}`;
  }

  const parts = hostname.split('.');
  if (parts.length >= 2) {
    const rootDomain = parts.slice(-2).join('.');
    return `${protocol}//${tenantSubdomain}.${rootDomain}${port}${cleanPath}`;
  }

  return `${protocol}//${tenantSubdomain}.${hostname}${port}${cleanPath}`;
};

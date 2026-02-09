export type AppRole = 'super_admin' | 'billing_admin' | 'blog_editor' | 'instructor' | 'student';

export const ADMIN_ROLES: AppRole[] = ['super_admin', 'billing_admin'];

export function isSuperAdmin(roles?: AppRole[] | null): boolean {
  return Array.isArray(roles) && roles.includes('super_admin');
}

export function isAdmin(roles?: AppRole[] | null): boolean {
  return Array.isArray(roles) && (roles.includes('super_admin') || roles.includes('billing_admin'));
}

export function isBlogEditor(roles?: AppRole[] | null): boolean {
  return Array.isArray(roles) && (roles.includes('super_admin') || roles.includes('blog_editor'));
}

export function primaryAdminRole(roles?: AppRole[] | null): 'super_admin' | 'billing_admin' | null {
  if (!Array.isArray(roles)) return null;
  if (roles.includes('super_admin')) return 'super_admin';
  if (roles.includes('billing_admin')) return 'billing_admin';
  return null;
}

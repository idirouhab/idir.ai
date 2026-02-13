export type AppRole = 'super_admin' | 'billing_admin' | 'blog_editor' | 'instructor' | 'student';
export type RoleInput = AppRole[] | string | null | undefined;

export const ADMIN_ROLES: AppRole[] = ['super_admin', 'billing_admin'];

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function normalizeRoles(roles?: RoleInput): AppRole[] {
  if (!roles) return [];
  if (Array.isArray(roles)) return roles;
  if (typeof roles !== 'string') return [];

  const trimmed = roles.trim();
  if (!trimmed) return [];

  let inner = trimmed;
  if (inner.startsWith('{') && inner.endsWith('}')) {
    inner = inner.slice(1, -1);
  }
  if (!inner) return [];

  return inner
    .split(',')
    .map(role => stripQuotes(role.trim()))
    .filter(Boolean) as AppRole[];
}

export function isSuperAdmin(roles?: RoleInput): boolean {
  return normalizeRoles(roles).includes('super_admin');
}

export function isAdmin(roles?: RoleInput): boolean {
  const normalized = normalizeRoles(roles);
  return normalized.includes('super_admin') || normalized.includes('billing_admin');
}

export function isBlogEditor(roles?: RoleInput): boolean {
  const normalized = normalizeRoles(roles);
  return normalized.includes('super_admin') || normalized.includes('blog_editor');
}

export function primaryAdminRole(roles?: RoleInput): 'super_admin' | 'billing_admin' | null {
  const normalized = normalizeRoles(roles);
  if (normalized.includes('super_admin')) return 'super_admin';
  if (normalized.includes('billing_admin')) return 'billing_admin';
  return null;
}

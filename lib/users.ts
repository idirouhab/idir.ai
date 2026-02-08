import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { AppRole } from './app-roles';
import { isAdmin } from './app-roles';

// User type definition
export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: AppRole[];
  is_active: boolean;
  linkedin_url?: string;
  twitter_url?: string;
  created_at: string;
  updated_at: string;
};

export type UserInput = {
  email: string;
  password: string;
  name: string;
  role: AppRole;
};

// Get Supabase admin client (bypasses RLS)
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase admin environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create a new user
export async function createUser(input: UserInput, isActive: boolean = true): Promise<User> {
  const supabase = getAdminClient();

  // Hash password
  const passwordHash = await hashPassword(input.password);

  const trimmedName = input.name.trim();
  const [firstName, ...lastParts] = trimmedName.split(' ').filter(Boolean);
  const lastName = lastParts.join(' ');

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email: input.email.toLowerCase().trim(),
        password_hash: passwordHash,
        first_name: firstName || 'Admin',
        last_name: lastName || 'User',
        is_active: isActive,
        email_verified: true,
      },
    ])
    .select('id, email, first_name, last_name, is_active, created_at, updated_at')
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw new Error(error.message);
  }

  // Assign admin role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert([{ user_id: data.id, role: input.role }]);

  if (roleError) {
    console.error('Error assigning role:', roleError);
    throw new Error(roleError.message);
  }

  return {
    ...(data as Omit<User, 'roles'>),
    roles: [input.role],
  } as User;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, is_active, created_at, updated_at, user_roles(role)')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching user:', error);
    throw new Error(error.message);
  }

  const roles = (data.user_roles || []).map((r: any) => r.role) as AppRole[];
  return {
    id: data.id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    roles,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as User;
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, is_active, created_at, updated_at, user_roles(role)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching user:', error);
    throw new Error(error.message);
  }

  const roles = (data.user_roles || []).map((r: any) => r.role) as AppRole[];
  return {
    id: data.id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    roles,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as User;
}

// Authenticate user (login)
export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const user = await getUserByEmail(email);

  if (!user || !user.is_active) {
    return null;
  }
  if (!isAdmin(user.roles)) {
    return null;
  }

  const passwordHash = await getPasswordHash(user.id);
  if (!passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, passwordHash);
  if (!isValid) {
    return null;
  }

  return user;
}

// Get password hash for a user (internal use only)
async function getPasswordHash(userId: string): Promise<string | null> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.password_hash;
}

// List all users (owner only)
export async function listUsers(): Promise<User[]> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, is_active, created_at, updated_at, user_roles(role)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing users:', error);
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    email: row.email,
    first_name: row.first_name,
    last_name: row.last_name,
    roles: (row.user_roles || []).map((r: any) => r.role),
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })) as User[];
}

// Update user status (owner only)
export async function updateUserStatus(userId: string, isActive: boolean): Promise<User> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select('id, email, first_name, last_name, is_active, created_at, updated_at, user_roles(role)')
    .single();

  if (error) {
    console.error('Error updating user status:', error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    roles: (data.user_roles || []).map((r: any) => r.role),
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as User;
}

// Delete user (owner only)
export async function deleteUser(userId: string): Promise<void> {
  const supabase = getAdminClient();

  const { error } = await supabase.from('users').delete().eq('id', userId);

  if (error) {
    console.error('Error deleting user:', error);
    throw new Error(error.message);
  }
}

// Update user password
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const supabase = getAdminClient();
  const passwordHash = await hashPassword(newPassword);

  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', userId);

  if (error) {
    console.error('Error updating password:', error);
    throw new Error(error.message);
  }
}

// Update user role (owner only)
export async function updateUserRole(userId: string, newRole: AppRole): Promise<User> {
  const supabase = getAdminClient();

  // Replace admin roles (super_admin/billing_admin) while preserving other roles
  const { error: deleteError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .in('role', ['super_admin', 'billing_admin']);

  if (deleteError) {
    console.error('Error removing existing admin roles:', deleteError);
    throw new Error(deleteError.message);
  }

  const { error: insertError } = await supabase
    .from('user_roles')
    .insert([{ user_id: userId, role: newRole }]);

  if (insertError) {
    console.error('Error updating user role:', insertError);
    throw new Error(insertError.message);
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, is_active, created_at, updated_at, user_roles(role)')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error updating user role:', error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    roles: (data.user_roles || []).map((r: any) => r.role),
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as User;
}

// Update user details (name, email, social profiles)
export async function updateUserDetails(
  userId: string,
  updates: { name?: string; email?: string; linkedin_url?: string; twitter_url?: string }
): Promise<User> {
  const supabase = getAdminClient();

  const updateData: any = {};
  if (updates.name) {
    const trimmedName = updates.name.trim();
    const [firstName, ...lastParts] = trimmedName.split(' ').filter(Boolean);
    updateData.first_name = firstName || 'Admin';
    updateData.last_name = lastParts.join(' ') || 'User';
  }
  if (updates.email) updateData.email = updates.email.toLowerCase().trim();
  if (updates.linkedin_url !== undefined) updateData.linkedin_url = updates.linkedin_url || null;
  if (updates.twitter_url !== undefined) updateData.twitter_url = updates.twitter_url || null;

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select('id, email, first_name, last_name, is_active, created_at, updated_at, user_roles(role)')
    .single();

  if (error) {
    console.error('Error updating user details:', error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    roles: (data.user_roles || []).map((r: any) => r.role),
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as User;
}

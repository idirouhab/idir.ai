import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { UserRole } from './jwt';

// User type definition
export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
  role: UserRole;
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

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email: input.email.toLowerCase().trim(),
        password_hash: passwordHash,
        name: input.name,
        role: input.role,
        is_active: isActive,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw new Error(error.message);
  }

  return data as User;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
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

  return data as User;
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching user:', error);
    throw new Error(error.message);
  }

  return data as User;
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
    .select('id, email, name, role, is_active, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing users:', error);
    throw new Error(error.message);
  }

  return data as User[];
}

// Update user status (owner only)
export async function updateUserStatus(userId: string, isActive: boolean): Promise<User> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user status:', error);
    throw new Error(error.message);
  }

  return data as User;
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
export async function updateUserRole(userId: string, newRole: UserRole): Promise<User> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user role:', error);
    throw new Error(error.message);
  }

  return data as User;
}

// Update user details (name, email, social profiles)
export async function updateUserDetails(
  userId: string,
  updates: { name?: string; email?: string; linkedin_url?: string; twitter_url?: string }
): Promise<User> {
  const supabase = getAdminClient();

  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.email) updateData.email = updates.email.toLowerCase().trim();
  if (updates.linkedin_url !== undefined) updateData.linkedin_url = updates.linkedin_url || null;
  if (updates.twitter_url !== undefined) updateData.twitter_url = updates.twitter_url || null;

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user details:', error);
    throw new Error(error.message);
  }

  return data as User;
}

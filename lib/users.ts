import bcrypt from 'bcryptjs';
import { AppRole } from './app-roles';
import { isAdmin } from './app-roles';
import { getClient, query } from '@/lib/db';

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

async function getUserWithRolesById(userId: string): Promise<User | null> {
  const result = await query(
    `SELECT
      u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at, u.updated_at,
      COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     WHERE u.id = $1
     GROUP BY u.id
     LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    first_name: row.first_name,
    last_name: row.last_name,
    roles: row.roles as AppRole[],
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  } as User;
}

async function getUserWithRolesByEmail(email: string): Promise<User | null> {
  const result = await query(
    `SELECT
      u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at, u.updated_at,
      COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     WHERE u.email = $1
     GROUP BY u.id
     LIMIT 1`,
    [email.toLowerCase().trim()]
  );

  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    first_name: row.first_name,
    last_name: row.last_name,
    roles: row.roles as AppRole[],
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  } as User;
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
  // Hash password
  const passwordHash = await hashPassword(input.password);

  const trimmedName = input.name.trim();
  const [firstName, ...lastParts] = trimmedName.split(' ').filter(Boolean);
  const lastName = lastParts.join(' ');

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, is_active, created_at, updated_at`,
      [
        input.email.toLowerCase().trim(),
        passwordHash,
        firstName || 'Admin',
        lastName || 'User',
        isActive,
        true,
      ]
    );

    const created = userResult.rows[0];
    await client.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
      [created.id, input.role]
    );

    await client.query('COMMIT');
    return {
      ...(created as Omit<User, 'roles'>),
      roles: [input.role],
    } as User;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating user:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  return getUserWithRolesByEmail(email);
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  return getUserWithRolesById(id);
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
  const result = await query(
    `SELECT password_hash FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) return null;
  return result.rows[0].password_hash;
}

// List all users (owner only)
export async function listUsers(): Promise<User[]> {
  const result = await query(
    `SELECT
      u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at, u.updated_at,
      COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );

  return (result.rows || []).map((row: any) => ({
    id: row.id,
    email: row.email,
    first_name: row.first_name,
    last_name: row.last_name,
    roles: row.roles,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })) as User[];
}

// Update user status (owner only)
export async function updateUserStatus(userId: string, isActive: boolean): Promise<User> {
  await query(`UPDATE users SET is_active = $1 WHERE id = $2`, [isActive, userId]);
  const updated = await getUserWithRolesById(userId);
  if (!updated) throw new Error('User not found');
  return updated;
}

// Delete user (owner only)
export async function deleteUser(userId: string): Promise<void> {
  await query(`DELETE FROM users WHERE id = $1`, [userId]);
}

// Update user password
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, userId]);
}

// Update user role (owner only)
export async function updateUserRole(userId: string, newRole: AppRole): Promise<User> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM user_roles
       WHERE user_id = $1 AND role IN ('super_admin', 'billing_admin')`,
      [userId]
    );
    await client.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
      [userId, newRole]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating user role:', error);
    throw error;
  } finally {
    client.release();
  }

  const updated = await getUserWithRolesById(userId);
  if (!updated) throw new Error('User not found');
  return updated;
}

// Update user details (name, email, social profiles)
export async function updateUserDetails(
  userId: string,
  updates: { name?: string; email?: string; linkedin_url?: string; twitter_url?: string }
): Promise<User> {
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

  const fields = Object.keys(updateData);
  if (fields.length > 0) {
    const sets = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map((f) => updateData[f]);
    await query(`UPDATE users SET ${sets} WHERE id = $${fields.length + 1}`, [
      ...values,
      userId,
    ]);
  }

  const updated = await getUserWithRolesById(userId);
  if (!updated) throw new Error('User not found');
  return updated;
}

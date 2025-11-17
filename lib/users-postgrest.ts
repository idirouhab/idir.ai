/**
 * Direct PostgREST client for local development
 * This bypasses the Supabase JS client which doesn't work with local PostgREST
 */

import bcrypt from 'bcryptjs';
import { UserRole } from './jwt';

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

// Get PostgREST configuration
function getPostgRESTConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3001';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return {
    baseURL: url,
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
  };
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Get user by email using direct HTTP request
export async function getUserByEmail(email: string): Promise<User | null> {
  const config = getPostgRESTConfig();

  try {
    const response = await fetch(
      `${config.baseURL}/users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=*`,
      {
        method: 'GET',
        headers: config.headers,
      }
    );

    if (!response.ok) {
      console.error('Error fetching user:', await response.text());
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    return data[0] as User;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return null;
  }
}

// Get password hash for a user
async function getPasswordHash(userId: string): Promise<string | null> {
  const config = getPostgRESTConfig();

  try {
    const response = await fetch(
      `${config.baseURL}/users?id=eq.${userId}&select=password_hash`,
      {
        method: 'GET',
        headers: config.headers,
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    return data[0].password_hash;
  } catch (error) {
    console.error('Error in getPasswordHash:', error);
    return null;
  }
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

import { createClient } from '@supabase/supabase-js';

/**
 * Session Blacklist Manager
 *
 * This module handles JWT token revocation by maintaining a blacklist
 * in the database. When a user logs out or a token needs to be invalidated,
 * it's added to the blacklist to prevent further use.
 */

// Create Supabase admin client for blacklist operations
function getBlacklistClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export type RevocationReason = 'logout' | 'security' | 'admin_action';

export type BlacklistEntry = {
  id: string;
  token_jti: string;
  user_id: string;
  revoked_at: string;
  expires_at: string;
  revocation_reason: RevocationReason;
};

/**
 * Add a token to the blacklist
 * @param jti - JWT ID (unique identifier for the token)
 * @param userId - User ID who owns the token
 * @param expiresAt - When the token would naturally expire
 * @param reason - Why the token is being revoked
 * @returns Success status
 */
export async function blacklistToken(
  jti: string,
  userId: string,
  expiresAt: Date,
  reason: RevocationReason = 'logout'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBlacklistClient();

    const { error } = await supabase.from('token_blacklist').insert({
      token_jti: jti,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
      revocation_reason: reason,
    });

    if (error) {
      // Ignore duplicate key errors (token already blacklisted)
      if (error.code === '23505') {
        return { success: true };
      }
      console.error('Error blacklisting token:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in blacklistToken:', error);
    return { success: false, error: 'Failed to blacklist token' };
  }
}

/**
 * Check if a token is blacklisted
 * @param jti - JWT ID to check
 * @returns True if blacklisted, false otherwise
 */
export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  try {
    const supabase = getBlacklistClient();

    const { data, error } = await supabase
      .from('token_blacklist')
      .select('token_jti')
      .eq('token_jti', jti)
      .single();

    if (error) {
      // If no rows found, token is not blacklisted
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error('Error checking blacklist:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isTokenBlacklisted:', error);
    return false;
  }
}

/**
 * Revoke all tokens for a specific user
 * Useful for security incidents or when forcing re-authentication
 * @param userId - User ID whose tokens should be revoked
 * @param reason - Why the tokens are being revoked
 * @returns Number of tokens revoked
 */
export async function revokeAllUserTokens(
  userId: string,
  reason: RevocationReason = 'security'
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    // Note: This function would need additional logic to find and revoke
    // all active tokens for a user. For now, it's a placeholder that shows
    // the intended functionality. In practice, you might store active tokens
    // or implement a user_sessions table for this purpose.

    // For a simpler approach: Add a revoked_after timestamp to the users table
    // and check if token.iat < user.revoked_after in the middleware

    console.log(`Revoking all tokens for user ${userId} due to ${reason}`);
    return { success: true, count: 0 };
  } catch (error) {
    console.error('Error in revokeAllUserTokens:', error);
    return { success: false, count: 0, error: 'Failed to revoke user tokens' };
  }
}

/**
 * Clean up expired blacklist entries
 * Should be run periodically (e.g., daily cron job)
 * @returns Number of entries cleaned up
 */
export async function cleanupExpiredTokens(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const supabase = getBlacklistClient();

    const { error, count } = await supabase
      .from('token_blacklist')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error cleaning up blacklist:', error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Error in cleanupExpiredTokens:', error);
    return { success: false, count: 0, error: 'Failed to cleanup expired tokens' };
  }
}

/**
 * Get all blacklisted tokens for a user
 * @param userId - User ID to query
 * @returns List of blacklisted tokens
 */
export async function getUserBlacklistedTokens(userId: string): Promise<BlacklistEntry[]> {
  try {
    const supabase = getBlacklistClient();

    const { data, error } = await supabase
      .from('token_blacklist')
      .select('*')
      .eq('user_id', userId)
      .order('revoked_at', { ascending: false });

    if (error) {
      console.error('Error getting user blacklisted tokens:', error);
      return [];
    }

    return data as BlacklistEntry[];
  } catch (error) {
    console.error('Error in getUserBlacklistedTokens:', error);
    return [];
  }
}

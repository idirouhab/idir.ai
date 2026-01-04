import 'server-only';
import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool() {
  if (!pool) {
    // Use local postgres connection
    const connectionString = process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@127.0.0.1:5432/postgres';

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('[DB] Unexpected error on idle client:', {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      });
    });

    // Log successful connection
    pool.on('connect', () => {
      console.log('[DB] New client connected to database pool');
    });
  }

  return pool;
}

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const pool = getDbPool();
  const start = Date.now();
  const queryPreview = text.substring(0, 100).replace(/\s+/g, ' ');

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn('[DB] Slow query detected:', {
        duration: `${duration}ms`,
        queryPreview,
        params: params?.length,
      });
    }

    return res;
  } catch (error) {
    console.error('[DB] Database query error:', {
      queryPreview,
      params,
      error: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      detail: (error as any)?.detail,
      hint: (error as any)?.hint,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

// Get a client from the pool for transactions
export async function getClient() {
  const pool = getDbPool();
  return pool.connect();
}

// Cleanup function (optional, for graceful shutdown)
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

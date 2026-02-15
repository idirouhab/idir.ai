import 'server-only';
import { Pool } from 'pg';

let pool: Pool | null = null;

const RETRYABLE_DB_ERROR_CODES = new Set([
  '57P01', // admin_shutdown
  '57P02', // crash_shutdown
  '57P03', // cannot_connect_now
  '08000', // connection_exception
  '08003', // connection_does_not_exist
  '08006', // connection_failure
  '08001', // sqlclient_unable_to_establish_sqlconnection
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EPIPE',
]);

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const maybeError = error as { code?: unknown; errno?: unknown };
  const code = maybeError.code ?? maybeError.errno;
  return typeof code === 'string' ? code : undefined;
}

export function isRetryableDbError(error: unknown): boolean {
  const code = getErrorCode(error);
  if (code && RETRYABLE_DB_ERROR_CODES.has(code)) {
    return true;
  }

  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    message.includes('connection terminated') ||
    message.includes('connection timeout') ||
    message.includes('timeout') ||
    message.includes('econnreset') ||
    message.includes('econnrefused') ||
    message.includes('server closed the connection unexpectedly')
  );
}

async function resetPool() {
  if (!pool) {
    return;
  }

  const currentPool = pool;
  pool = null;

  try {
    await currentPool.end();
  } catch (error) {
    console.warn('[DB] Failed to close database pool cleanly during reset:', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

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
  const activePool = getDbPool();
  const start = Date.now();
  const queryPreview = text.substring(0, 100).replace(/\s+/g, ' ');

  try {
    const res = await activePool.query(text, params);
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
    const retryable = isRetryableDbError(error);

    console.error('[DB] Database query error:', {
      queryPreview,
      params,
      error: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      detail: (error as any)?.detail,
      hint: (error as any)?.hint,
      retryable,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (retryable) {
      // Discard the pool so the next attempt creates fresh connections.
      await resetPool();
    }

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

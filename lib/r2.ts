import { S3Client } from '@aws-sdk/client-s3';

let cachedClient: S3Client | null = null;

export const R2_BUCKET = process.env.R2_BUCKET_NAME || 'blog-images';

function requireEnv(name: string, value?: string): string {
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}

export function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const accountId = requireEnv('R2_ACCOUNT_ID', process.env.R2_ACCOUNT_ID);
  const accessKeyId = requireEnv('R2_ACCESS_KEY_ID', process.env.R2_ACCESS_KEY_ID);
  const secretAccessKey = requireEnv('R2_SECRET_ACCESS_KEY', process.env.R2_SECRET_ACCESS_KEY);

  cachedClient = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return cachedClient;
}

export function getR2PublicBaseUrl(): string {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (base) return base;

  const accountId = requireEnv('R2_ACCOUNT_ID', process.env.R2_ACCOUNT_ID);
  return `https://${accountId}.r2.cloudflarestorage.com/${R2_BUCKET}`;
}

export function buildR2PublicUrl(key: string): string {
  const base = getR2PublicBaseUrl().replace(/\/+$/, '');
  return `${base}/${key}`;
}

export function getR2KeyFromUrl(imageUrl: string): string | null {
  const base = getR2PublicBaseUrl().replace(/\/+$/, '');
  if (imageUrl.startsWith(`${base}/`)) {
    return imageUrl.slice(base.length + 1);
  }

  try {
    const url = new URL(imageUrl);
    const path = url.pathname.replace(/^\/+/, '');
    if (path.startsWith(`${R2_BUCKET}/`)) {
      return path.slice(R2_BUCKET.length + 1);
    }
  } catch {
    return null;
  }

  return null;
}

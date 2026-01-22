/**
 * Certificate Hashing Utilities (Direct - for scripts)
 * Copied from lib/certificate-hash.ts but without 'server-only' directive
 */

import crypto from 'crypto';

/**
 * Certificate snapshot payload structure
 */
export interface CertificateSnapshot {
  certificate_id: string;
  student_full_name: string;
  student_email_hash: string;
  course_id: string;
  course_title: string;
  course_version: string;
  completed_at: string;
  issued_at: string;
}

/**
 * Deterministic JSON serialization
 */
export function stableStringify(obj: any): string {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';

  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    const items = obj.map(item => stableStringify(item));
    return `[${items.join(',')}]`;
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => {
    const value = stableStringify(obj[key]);
    return `${JSON.stringify(key)}:${value}`;
  });

  return `{${pairs.join(',')}}`;
}

/**
 * Computes SHA-256 hash
 */
export function sha256Hash(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Hashes an email address
 */
export function hashEmail(email: string): string {
  const normalized = email.toLowerCase().trim();
  return sha256Hash(normalized);
}

/**
 * Generates certificate hash from snapshot
 */
export function generateCertificateHash(snapshot: CertificateSnapshot): string {
  const stableJson = stableStringify(snapshot);
  return sha256Hash(stableJson);
}

/**
 * Creates a certificate snapshot
 */
export function createCertificateSnapshot(params: {
  certificate_id: string;
  student_full_name: string;
  student_email: string;
  course_id: string;
  course_title: string;
  course_updated_at: Date | string;
  completed_at: Date | string;
  issued_at: Date | string;
}): CertificateSnapshot {
  const normalizeDate = (date: Date | string): string => {
    return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
  };

  return {
    certificate_id: params.certificate_id,
    student_full_name: params.student_full_name.trim(),
    student_email_hash: hashEmail(params.student_email),
    course_id: params.course_id,
    course_title: params.course_title.trim(),
    course_version: normalizeDate(params.course_updated_at),
    completed_at: normalizeDate(params.completed_at),
    issued_at: normalizeDate(params.issued_at),
  };
}

/**
 * Generates a unique certificate ID
 */
export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const uuid = crypto.randomUUID().toUpperCase();
  return `CERT-${year}-${uuid}`;
}

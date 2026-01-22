/**
 * Certificate Hashing Utilities
 *
 * Provides deterministic JSON serialization and SHA-256 hashing for certificate integrity.
 * The snapshot payload is used to generate a cryptographic hash that proves the certificate
 * authenticity and detects any tampering.
 */

import 'server-only';
import crypto from 'crypto';

/**
 * Certificate snapshot payload structure
 * This is the canonical data format used for hash generation
 */
export interface CertificateSnapshot {
  certificate_id: string;
  student_full_name: string;
  student_email_hash: string; // SHA-256 hash of email (privacy-preserving)
  course_id: string;
  course_title: string;
  course_version: string; // ISO timestamp of course.updated_at
  completed_at: string; // ISO 8601 timestamp
  issued_at: string; // ISO 8601 timestamp
}

/**
 * Deterministic JSON serialization
 * Recursively sorts object keys to ensure consistent output
 *
 * @param obj - Any JSON-serializable object
 * @returns Stable JSON string representation
 */
export function stableStringify(obj: any): string {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';

  // Handle primitive types
  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    const items = obj.map(item => stableStringify(item));
    return `[${items.join(',')}]`;
  }

  // Handle objects - sort keys alphabetically
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => {
    const value = stableStringify(obj[key]);
    return `${JSON.stringify(key)}:${value}`;
  });

  return `{${pairs.join(',')}}`;
}

/**
 * Computes SHA-256 hash of any data
 *
 * @param data - String data to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function sha256Hash(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Computes SHA-256 hash of an email address
 * Used for privacy-preserving email storage in certificate snapshots
 *
 * @param email - Email address to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function hashEmail(email: string): string {
  // Normalize email: lowercase and trim
  const normalized = email.toLowerCase().trim();
  return sha256Hash(normalized);
}

/**
 * Generates deterministic hash from certificate snapshot
 *
 * @param snapshot - Certificate snapshot payload
 * @returns SHA-256 hash of the stable JSON representation
 */
export function generateCertificateHash(snapshot: CertificateSnapshot): string {
  const stableJson = stableStringify(snapshot);
  return sha256Hash(stableJson);
}

/**
 * Verifies a certificate hash against a snapshot
 *
 * @param snapshot - Certificate snapshot to verify
 * @param expectedHash - Expected SHA-256 hash
 * @returns True if hash matches, false otherwise
 */
export function verifyCertificateHash(
  snapshot: CertificateSnapshot,
  expectedHash: string
): boolean {
  const computedHash = generateCertificateHash(snapshot);
  return computedHash === expectedHash;
}

/**
 * Creates a certificate snapshot from database records
 *
 * @param params - Certificate data from database
 * @returns Certificate snapshot ready for hashing
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
  // Normalize dates to ISO 8601 strings
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

/**
 * Certificate Service Layer
 *
 * Production-grade certificate issuance and verification system with:
 * - Deterministic hashing for integrity protection
 * - Revocation and re-issuance support
 * - Complete audit trail
 * - Transaction safety
 */

import 'server-only';
import { getClient, query } from './db';
import {
  createCertificateSnapshot,
  generateCertificateHash,
  type CertificateSnapshot,
} from './certificate-hash';

// ============================================================================
// Types
// ============================================================================

export type CertificateStatus = 'valid' | 'revoked' | 'reissued';
export type CertificateEventType = 'issued' | 'verified' | 'revoked' | 'reissued';

export interface Certificate {
  id: string;
  certificate_id: string;
  course_signup_id: string;
  issued_at: Date;
  status: CertificateStatus;
  revoked_at: Date | null;
  revoked_reason: string | null;
  hash_algorithm: string;
  payload_hash: string;
  snapshot_payload: CertificateSnapshot;
  verification_count: number;
  last_verified_at: Date | null;
  pdf_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CertificateVerificationResult {
  found: boolean;
  certificate_id: string;
  status: CertificateStatus;
  student_name: string;
  course_title: string;
  issued_at: Date;
  completed_at: Date;
  revoked_at?: Date | null;
  revoked_reason?: string | null;
}

export interface IssueResult {
  success: boolean;
  certificate?: Certificate;
  error?: string;
  verification_url?: string;
}

// ============================================================================
// Certificate ID Generation
// ============================================================================

/**
 * Generates a unique public certificate ID
 * Format: CERT-{YEAR}-{UUID}
 * Example: CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4
 */
export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const uuid = crypto.randomUUID().toUpperCase();
  return `CERT-${year}-${uuid}`;
}

// ============================================================================
// Certificate Issuance
// ============================================================================

/**
 * Issues a new certificate for a completed course signup
 * Idempotent: Returns existing valid certificate if one exists
 *
 * @param course_signup_id - UUID of the course signup
 * @param actor_id - Optional: User ID of who issued the certificate
 * @returns Issue result with certificate data or error
 */
export async function issueCertificate(
  course_signup_id: string,
  actor_id?: string
): Promise<IssueResult> {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Step 1: Fetch course signup with related data
    const signupResult = await client.query(
      `
      SELECT
        cs.id,
        cs.full_name,
        cs.email,
        cs.course_id,
        cs.completed_at,
        cs.signup_status,
        c.id as course_uuid,
        c.title as course_title,
        c.updated_at as course_updated_at
      FROM course_signups cs
      INNER JOIN courses c ON cs.course_id = c.id
      WHERE cs.id = $1
      `,
      [course_signup_id]
    );

    if (signupResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Course signup not found',
      };
    }

    const signup = signupResult.rows[0];

    // Step 2: Validate signup is completed
    if (!signup.completed_at) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Course signup is not completed. Cannot issue certificate.',
      };
    }

    // Step 3: Check for existing valid certificate (idempotent behavior)
    const existingResult = await client.query(
      `
      SELECT * FROM certificates
      WHERE course_signup_id = $1 AND status = 'valid'
      LIMIT 1
      `,
      [course_signup_id]
    );

    if (existingResult.rows.length > 0) {
      // Certificate already exists - return it (idempotent)
      await client.query('COMMIT');
      const existing = existingResult.rows[0];

      return {
        success: true,
        certificate: {
          ...existing,
          snapshot_payload: existing.snapshot_payload,
        },
        verification_url: `/certificates/verify/${existing.certificate_id}`,
      };
    }

    // Step 4: Generate certificate ID and timestamps
    const certificate_id = generateCertificateId();
    const issued_at = new Date();

    // Step 5: Create deterministic snapshot
    const snapshot = createCertificateSnapshot({
      certificate_id,
      student_full_name: signup.full_name,
      student_email: signup.email,
      course_id: signup.course_uuid,
      course_title: signup.course_title,
      course_updated_at: signup.course_updated_at,
      completed_at: signup.completed_at,
      issued_at,
    });

    // Step 6: Generate hash
    const payload_hash = generateCertificateHash(snapshot);

    // Step 7: Insert certificate
    const insertResult = await client.query(
      `
      INSERT INTO certificates (
        certificate_id,
        course_signup_id,
        issued_at,
        status,
        hash_algorithm,
        payload_hash,
        snapshot_payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        certificate_id,
        course_signup_id,
        issued_at,
        'valid',
        'sha256',
        payload_hash,
        JSON.stringify(snapshot),
      ]
    );

    const certificate = insertResult.rows[0];

    // Step 8: Log audit event
    await client.query(
      `
      INSERT INTO certificate_events (
        certificate_id,
        certificate_uuid,
        event_type,
        actor_type,
        actor_id,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        certificate_id,
        certificate.id,
        'issued',
        actor_id ? 'admin' : 'system',
        actor_id || null,
        JSON.stringify({
          course_signup_id,
          course_title: signup.course_title,
          student_name: signup.full_name,
        }),
      ]
    );

    await client.query('COMMIT');

    return {
      success: true,
      certificate: {
        ...certificate,
        snapshot_payload: certificate.snapshot_payload,
      },
      verification_url: `/certificates/verify/${certificate_id}`,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Certificates] Issue error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  } finally {
    client.release();
  }
}

// ============================================================================
// Certificate Revocation
// ============================================================================

export interface RevokeResult {
  success: boolean;
  error?: string;
}

/**
 * Revokes a certificate
 *
 * @param certificate_id - Public certificate ID
 * @param reason - Reason for revocation
 * @param actor_id - Optional: User ID who revoked the certificate
 * @returns Revoke result
 */
export async function revokeCertificate(
  certificate_id: string,
  reason: string,
  actor_id?: string
): Promise<RevokeResult> {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Fetch certificate
    const certResult = await client.query(
      'SELECT * FROM certificates WHERE certificate_id = $1',
      [certificate_id]
    );

    if (certResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Certificate not found',
      };
    }

    const cert = certResult.rows[0];

    if (cert.status === 'revoked') {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Certificate is already revoked',
      };
    }

    // Update certificate status
    await client.query(
      `
      UPDATE certificates
      SET status = 'revoked',
          revoked_at = NOW(),
          revoked_reason = $1,
          updated_at = NOW()
      WHERE certificate_id = $2
      `,
      [reason, certificate_id]
    );

    // Log audit event
    await client.query(
      `
      INSERT INTO certificate_events (
        certificate_id,
        certificate_uuid,
        event_type,
        actor_type,
        actor_id,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        certificate_id,
        cert.id,
        'revoked',
        actor_id ? 'admin' : 'system',
        actor_id || null,
        JSON.stringify({ reason }),
      ]
    );

    await client.query('COMMIT');

    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Certificates] Revoke error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  } finally {
    client.release();
  }
}

// ============================================================================
// Certificate Re-issuance
// ============================================================================

/**
 * Re-issues a certificate (marks old as 'reissued', creates new one)
 *
 * @param certificate_id - Public certificate ID to reissue
 * @param actor_id - Optional: User ID who requested reissuance
 * @param updated_student_name - Optional: Corrected student name
 * @returns Issue result with new certificate
 */
export async function reissueCertificate(
  certificate_id: string,
  actor_id?: string,
  updated_student_name?: string
): Promise<IssueResult> {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Step 1: Fetch existing certificate
    const certResult = await client.query(
      'SELECT * FROM certificates WHERE certificate_id = $1',
      [certificate_id]
    );

    if (certResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Certificate not found',
      };
    }

    const oldCert = certResult.rows[0];

    // Step 2: Mark old certificate as 'reissued'
    await client.query(
      `
      UPDATE certificates
      SET status = 'reissued',
          updated_at = NOW()
      WHERE certificate_id = $1
      `,
      [certificate_id]
    );

    // Log reissued event for old certificate
    await client.query(
      `
      INSERT INTO certificate_events (
        certificate_id,
        certificate_uuid,
        event_type,
        actor_type,
        actor_id,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        certificate_id,
        oldCert.id,
        'reissued',
        actor_id ? 'admin' : 'system',
        actor_id || null,
        JSON.stringify({
          reason: 'Certificate reissued',
          name_updated: !!updated_student_name,
        }),
      ]
    );

    // Step 3: Fetch signup data for new certificate
    const signupResult = await client.query(
      `
      SELECT
        cs.id,
        cs.full_name,
        cs.email,
        cs.course_id,
        cs.completed_at,
        c.id as course_uuid,
        c.title as course_title,
        c.updated_at as course_updated_at
      FROM course_signups cs
      INNER JOIN courses c ON cs.course_id = c.id
      WHERE cs.id = $1
      `,
      [oldCert.course_signup_id]
    );

    const signup = signupResult.rows[0];

    // Step 4: Generate new certificate
    const new_certificate_id = generateCertificateId();
    const issued_at = new Date();

    const snapshot = createCertificateSnapshot({
      certificate_id: new_certificate_id,
      student_full_name: updated_student_name || signup.full_name,
      student_email: signup.email,
      course_id: signup.course_uuid,
      course_title: signup.course_title,
      course_updated_at: signup.course_updated_at,
      completed_at: signup.completed_at,
      issued_at,
    });

    const payload_hash = generateCertificateHash(snapshot);

    // Step 5: Insert new certificate
    const insertResult = await client.query(
      `
      INSERT INTO certificates (
        certificate_id,
        course_signup_id,
        issued_at,
        status,
        hash_algorithm,
        payload_hash,
        snapshot_payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        new_certificate_id,
        oldCert.course_signup_id,
        issued_at,
        'valid',
        'sha256',
        payload_hash,
        JSON.stringify(snapshot),
      ]
    );

    const newCert = insertResult.rows[0];

    // Step 6: Log issued event for new certificate
    await client.query(
      `
      INSERT INTO certificate_events (
        certificate_id,
        certificate_uuid,
        event_type,
        actor_type,
        actor_id,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        new_certificate_id,
        newCert.id,
        'issued',
        actor_id ? 'admin' : 'system',
        actor_id || null,
        JSON.stringify({
          reissued_from: certificate_id,
          reason: 'Reissued certificate',
        }),
      ]
    );

    await client.query('COMMIT');

    return {
      success: true,
      certificate: {
        ...newCert,
        snapshot_payload: newCert.snapshot_payload,
      },
      verification_url: `/certificates/verify/${new_certificate_id}`,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Certificates] Reissue error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  } finally {
    client.release();
  }
}

// ============================================================================
// Certificate Verification
// ============================================================================

/**
 * Verifies a certificate and returns public information
 * Also increments verification counter and logs audit event
 *
 * @param certificate_id - Public certificate ID
 * @param ip_address - Optional: IP address of verifier (for audit)
 * @param user_agent - Optional: User agent of verifier (for audit)
 * @returns Verification result with public certificate data
 */
export async function verifyCertificate(
  certificate_id: string,
  ip_address?: string,
  user_agent?: string
): Promise<CertificateVerificationResult | null> {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Fetch certificate with related data
    // LEFT JOIN to support manual certificates (where course_signup_id is NULL)
    const result = await client.query(
      `
      SELECT
        c.*,
        cs.completed_at as signup_completed_at
      FROM certificates c
      LEFT JOIN course_signups cs ON c.course_signup_id = cs.id
      WHERE c.certificate_id = $1
      `,
      [certificate_id]
    );

    if (result.rows.length === 0) {
      await client.query('COMMIT');
      return null;
    }

    const cert = result.rows[0];
    const snapshot = cert.snapshot_payload as CertificateSnapshot;

    // Use snapshot as the canonical source of truth for certificate data
    const completed_at = cert.signup_completed_at || snapshot.completed_at;
    const student_name = snapshot.student_full_name;

    // Increment verification count
    await client.query(
      `
      UPDATE certificates
      SET verification_count = verification_count + 1,
          last_verified_at = NOW(),
          updated_at = NOW()
      WHERE certificate_id = $1
      `,
      [certificate_id]
    );

    // Log verification event
    await client.query(
      `
      INSERT INTO certificate_events (
        certificate_id,
        certificate_uuid,
        event_type,
        actor_type,
        ip_address,
        user_agent,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        certificate_id,
        cert.id,
        'verified',
        'public',
        ip_address || null,
        user_agent || null,
        JSON.stringify({
          verification_count: cert.verification_count + 1,
        }),
      ]
    );

    await client.query('COMMIT');

    // Return public verification data (DO NOT expose email)
    return {
      found: true,
      certificate_id: cert.certificate_id,
      status: cert.status,
      student_name: student_name,
      course_title: snapshot.course_title,
      issued_at: new Date(cert.issued_at),
      completed_at: new Date(completed_at),
      revoked_at: cert.revoked_at ? new Date(cert.revoked_at) : null,
      revoked_reason: cert.revoked_reason,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Certificates] Verify error:', error);
    throw error;
  } finally {
    client.release();
  }
}

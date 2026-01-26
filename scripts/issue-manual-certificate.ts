/**
 * Manual Certificate Issuance Script
 *
 * Issue certificates for students who completed courses via third-party tools
 * (not tracked in course_signups table)
 *
 * Usage:
 *   npx tsx scripts/issue-manual-certificate.ts \
 *     --name "John Doe" \
 *     --email "john@example.com" \
 *     --course-title "Automation 101" \
 *     --course-id "optional-uuid" \
 *     --completed-at "2026-01-20"
 *
 * Or programmatically:
 *   import { issueManualCertificate } from './scripts/issue-manual-certificate';
 */

import 'dotenv/config';
import {getClient} from './lib/db-direct';
import {
    createCertificateSnapshot,
    generateCertificateHash,
} from './lib/certificate-hash-direct';
import {
    generateCertificateId,
} from '../lib/certificate-id';
import crypto from 'crypto';

interface ManualCertificateInput {
    student_full_name: string;
    student_email: string;
    course_title: string;
    course_id?: string; // Optional: custom identifier (e.g., "CLIENT-A-101", UUID, or any string)
    completed_at: Date | string;
    issued_at?: Date | string; // Optional: defaults to now
    actor_email?: string; // Who issued this certificate
    segments?: string[]; // Optional segments for certificate ID generation
    pdf_url?: string; // Optional: URL to PDF certificate in Cloudflare R2
    jpg_url?: string; // Optional: URL to JPG certificate in Cloudflare R2
}

interface ManualCertificateResult {
    success: boolean;
    certificate_id?: string;
    verification_url?: string;
    payload_hash?: string;
    error?: string;
}

/**
 * Issue a manual certificate without requiring course_signup_id
 */
export async function issueManualCertificate(
    input: ManualCertificateInput
): Promise<ManualCertificateResult> {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        // Generate certificate ID
        const certificate_id = generateCertificateId(input.course_title, input.segments);
        const issued_at = input.issued_at ? new Date(input.issued_at) : new Date();
        const completed_at = new Date(input.completed_at);

        // For external/manual certificates:
        // - If course_id provided: use it as-is (can be custom ID, UUID, or any identifier)
        // - If not provided: generate unique "EXTERNAL-{HASH}" identifier
        const course_id = input.course_id || `EXTERNAL-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

        // Create deterministic snapshot
        const snapshot = createCertificateSnapshot({
            certificate_id,
            student_full_name: input.student_full_name,
            student_email: input.student_email,
            course_id,
            course_title: input.course_title,
            course_updated_at: issued_at, // For external certs: use issued_at as version timestamp
            completed_at,
            issued_at,
        });

        // Generate hash
        const payload_hash = generateCertificateHash(snapshot);

        // Insert certificate (with NULL course_signup_id since this is manual)
        const insertResult = await client.query(
            `
                INSERT INTO certificates (certificate_id,
                                          course_signup_id,
                                          issued_at,
                                          status,
                                          hash_algorithm,
                                          payload_hash,
                                          snapshot_payload,
                                          pdf_url,
                                          jpg_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
            `,
            [
                certificate_id,
                null, // NULL course_signup_id for manual certificates
                issued_at,
                'valid',
                'sha256',
                payload_hash,
                JSON.stringify(snapshot),
                input.pdf_url || null,
                input.jpg_url || null,
            ]
        );

        const certificate = insertResult.rows[0];

        // Log audit event
        await client.query(
            `
                INSERT INTO certificate_events (certificate_id,
                                                certificate_uuid,
                                                event_type,
                                                actor_type,
                                                actor_email,
                                                metadata)
                VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [
                certificate_id,
                certificate.id,
                'issued',
                'manual',
                input.actor_email || 'system',
                JSON.stringify({
                    source: 'manual_script',
                    course_title: input.course_title,
                    student_name: input.student_full_name,
                    student_email: input.student_email,
                }),
            ]
        );

        await client.query('COMMIT');

        return {
            success: true,
            certificate_id,
            verification_url: `/certificates/verify/${certificate_id}`,
            payload_hash,
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[Manual Certificate] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    } finally {
        client.release();
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);

    // Parse command line arguments
    const getArg = (flag: string): string | undefined => {
        const index = args.findIndex(arg => arg === flag);
        return index !== -1 ? args[index + 1] : undefined;
    };

    const name = getArg('--name');
    const email = getArg('--email');
    const courseTitle = getArg('--course-title');
    const courseId = getArg('--course-id');
    const completedAt = getArg('--completed-at');
    const issuedAt = getArg('--issued-at');
    const actorEmail = getArg('--actor');
    const segmentsRaw = getArg('--segments');
    const segments = segmentsRaw
        ? segmentsRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [];


    // Validate required fields
    if (!name || !email || !courseTitle || !completedAt) {
        console.error('❌ Missing required arguments\n');
        console.log('Usage:');
        console.log('  npx tsx scripts/issue-manual-certificate.ts \\');
        console.log('    --name "John Doe" \\');
        console.log('    --email "john@example.com" \\');
        console.log('    --course-title "Automation 101" \\');
        console.log('    --completed-at "2026-01-20" \\');
        console.log('    [--course-id "uuid"] \\');
        console.log('    [--issued-at "2026-01-21"] \\');
        console.log('    [--actor "admin@example.com"]');
        console.log('\nRequired:');
        console.log('  --name            Student full name');
        console.log('  --email           Student email');
        console.log('  --course-title    Course title');
        console.log('  --completed-at    Completion date (YYYY-MM-DD or ISO)');
        console.log('\nOptional:');
        console.log('  --course-id       Custom course identifier (e.g., "CLIENT-A-101", UUID)');
        console.log('                    If not provided, generates "EXTERNAL-{HASH}"');
        console.log('  --issued-at       Issue date (defaults to now)');
        console.log('  --actor           Email of person issuing certificate');
        process.exit(1);
    }

    console.log('📜 Issuing manual certificate...\n');
    console.log(`Student: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Course: ${courseTitle}`);
    console.log(`Completed: ${completedAt}`);
    if (courseId) console.log(`Course ID: ${courseId}`);
    if (segmentsRaw) console.log(`Segments: ${segmentsRaw}`);
    if (issuedAt) console.log(`Issued: ${issuedAt}`);
    if (actorEmail) console.log(`Actor: ${actorEmail}`);
    console.log();

    issueManualCertificate({
        student_full_name: name,
        student_email: email,
        course_title: courseTitle,
        course_id: courseId,
        completed_at: completedAt,
        issued_at: issuedAt,
        actor_email: actorEmail,
        segments: segments
    })
        .then(result => {
            if (result.success) {
                console.log('✅ Certificate issued successfully!\n');
                console.log(`Certificate ID: ${result.certificate_id}`);
                console.log(`Payload Hash: ${result.payload_hash}`);
                console.log(`Verification URL: https://idir.ai${result.verification_url}`);
                console.log();
                console.log('📧 Send this to the student:');
                console.log('─'.repeat(60));
                console.log(`Certificate ID: ${result.certificate_id}`);
                console.log(`Verify at: https://idir.ai/en/certificates/verify`);
                console.log('─'.repeat(60));
                process.exit(0);
            } else {
                console.error('❌ Failed to issue certificate');
                console.error(`Error: ${result.error}`);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Unexpected error:', error);
            process.exit(1);
        });
}
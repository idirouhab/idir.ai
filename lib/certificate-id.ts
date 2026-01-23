/**
 * Certificate ID Generation Utilities
 *
 * Format: IDIR-{SEGMENTS}-{YEAR}-{HASH10}
 * Example: IDIR-DIGITALCUBE-AUTOMATION-AI-2026-FE8202CB82
 */

import crypto from 'crypto';

/**
 * * Generate a 10-character hex hash (uppercase)
 */
function generateHash10(): string {
    // 5 bytes => 10 hex chars
    return crypto.randomBytes(5).toString('hex').toUpperCase();
}

/**
 * Convert course title to URL-friendly slug
 * Examples:
 * - "Automation 101" -> "AUTOMATION-101"
 * - "Systems Thinking Advanced" -> "SYSTEMS-THINKING-ADVANCED"
 * - "IA y Automatización" -> "IA"
 */
export function courseToSlug(courseTitle: string): string {
    const normalized = courseTitle
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .toUpperCase()
        .trim();

    const skipWords = new Set(['THE', 'A', 'AN', 'Y', 'E', 'AND', 'OR']);

    const words = normalized
        .split(/\s+/)
        .map(w => w.replace(/[^A-Z0-9]/g, '')) // keep only A-Z0-9 per word
        .filter(w => w.length > 0 && !skipWords.has(w));

    if (words.length === 0) return 'COURSE';

    // Take up to first 3 meaningful words and join with '-'
    // Examples:
    // "Automation 101" -> "AUTOMATION-101"
    // "Dify Agents"    -> "DIFY-AGENTS"
    const slug = words.slice(0, 3).join('-');

    return slug || 'COURSE';
}

function toSegment(input: string): string {
    return input
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase()
            .trim()
            .replace(/[^A-Z0-9]+/g, '-')   // spaces/symbols => dash
            .replace(/^-+|-+$/g, '')       // trim dashes
            .slice(0, 20)                  // segment max length (align with regex)
        || '';
}

/**
 * Generate a new-format certificate ID
 * Format: IDIR-{SEGMENTS}-{YEAR}-{HASH10}
 *
 * @param segments - Array of segments to include in the certificate ID (e.g., course slug)
 * @returns Certificate ID in new format
 *
 * @example
 * generateCertificateId("Automation 101")
 * // Returns: "IDIR-AUTOMATION-101-2026-FE8202CB82"
 *
 * generateCertificateId("Automation 101", ["SYS", "AUTOMATION", "AI"])
 * // Returns: "IDIR-SYS-AUTOMATION-AI-2026-FE8202CB82"
 */
export function generateCertificateId(courseTitle: string, segments: string[] = []): string {
    const year = new Date().getFullYear();
    let segmentsFormatted = segments
        .map(toSegment)
        .filter(Boolean);

    if (segmentsFormatted.length === 0) {
        segmentsFormatted = [toSegment(courseToSlug(courseTitle))].filter(Boolean);
    }

    if (segmentsFormatted.length === 0) {
        segmentsFormatted = ['COURSE'];
    }

    const hash = generateHash10();

    return `IDIR-${segmentsFormatted.join('-')}-${year}-${hash}`;
}

/**
 * Validate certificate ID format
 *
 * @param certificateId - Certificate ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidCertificateId(certificateId: string): boolean {
    if (!certificateId || typeof certificateId !== 'string') {
        return false;
    }

    // Format: IDIR-[CONTEXT]-YYYY-[10-CHAR HASH]
    const pattern = /^IDIR-[A-Z0-9]{1,20}(-[A-Z0-9]{1,20})*-\d{4}-[0-9A-F]{10}$/;

    return pattern.test(certificateId);
}


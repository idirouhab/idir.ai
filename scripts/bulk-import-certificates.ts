/**
 * Bulk Certificate Import Script
 *
 * Import multiple certificates from a CSV file
 *
 * CSV Format:
 *   student_name,student_email,course_title,completed_at,course_id
 *   John Doe,john@example.com,Automation 101,2026-01-20,optional-uuid
 *   Jane Smith,jane@example.com,Automation 101,2026-01-19,
 *
 * Usage:
 *   npx tsx scripts/bulk-import-certificates.ts certificates.csv
 *
 * Options:
 *   --actor "admin@example.com"  Person issuing certificates
 *   --dry-run                     Preview without inserting
 */

import 'dotenv/config';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { issueManualCertificate } from './issue-manual-certificate';

// Suppress server-only warnings for CLI usage
process.env.NEXT_RUNTIME = 'nodejs';

interface CsvRow {
  student_name: string;
  student_email: string;
  course_title: string;
  completed_at: string;
  course_id?: string;
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  results: Array<{
    row: number;
    student: string;
    success: boolean;
    certificate_id?: string;
    error?: string;
  }>;
}

/**
 * Parse and validate CSV file
 */
function parseCsvFile(filePath: string): CsvRow[] {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Validate required columns
    const requiredColumns = [
      'student_name',
      'student_email',
      'course_title',
      'completed_at',
    ];

    if (records.length === 0) {
      throw new Error('CSV file is empty');
    }

    const firstRow = records[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
      throw new Error(
        `Missing required columns: ${missingColumns.join(', ')}\n` +
          `Required: ${requiredColumns.join(', ')}`
      );
    }

    return records;
  } catch (error) {
    console.error('❌ Failed to parse CSV file');
    throw error;
  }
}

/**
 * Validate a single row
 */
function validateRow(row: CsvRow, rowNumber: number): string | null {
  if (!row.student_name?.trim()) {
    return `Row ${rowNumber}: Missing student_name`;
  }
  if (!row.student_email?.trim() || !row.student_email.includes('@')) {
    return `Row ${rowNumber}: Invalid student_email`;
  }
  if (!row.course_title?.trim()) {
    return `Row ${rowNumber}: Missing course_title`;
  }
  if (!row.completed_at?.trim()) {
    return `Row ${rowNumber}: Missing completed_at`;
  }

  // Validate date format
  const date = new Date(row.completed_at);
  if (isNaN(date.getTime())) {
    return `Row ${rowNumber}: Invalid date format for completed_at (use YYYY-MM-DD)`;
  }

  return null;
}

/**
 * Import certificates from CSV file
 */
async function bulkImportCertificates(
  filePath: string,
  actorEmail?: string,
  dryRun: boolean = false
): Promise<ImportResult> {
  console.log(`📂 Reading CSV file: ${filePath}\n`);

  const rows = parseCsvFile(filePath);
  const result: ImportResult = {
    total: rows.length,
    success: 0,
    failed: 0,
    results: [],
  };

  console.log(`Found ${rows.length} rows\n`);

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No certificates will be issued\n');
  }

  // Validate all rows first
  console.log('✅ Validating rows...\n');
  const validationErrors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const error = validateRow(rows[i], i + 1);
    if (error) {
      validationErrors.push(error);
    }
  }

  if (validationErrors.length > 0) {
    console.error('❌ Validation errors:\n');
    validationErrors.forEach(err => console.error(`  ${err}`));
    console.error();
    throw new Error('CSV validation failed');
  }

  console.log('✅ All rows validated successfully\n');

  if (dryRun) {
    console.log('Preview of certificates to be issued:\n');
    rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.student_name} (${row.student_email})`);
      console.log(`   Course: ${row.course_title}`);
      console.log(`   Completed: ${row.completed_at}`);
      console.log();
    });
    return result;
  }

  // Process each row
  console.log('📜 Issuing certificates...\n');

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 1;

    console.log(`[${rowNumber}/${rows.length}] ${row.student_name}...`);

    try {
      const issueResult = await issueManualCertificate({
        student_full_name: row.student_name.trim(),
        student_email: row.student_email.trim(),
        course_title: row.course_title.trim(),
        course_id: row.course_id?.trim() || undefined,
        completed_at: row.completed_at.trim(),
        actor_email: actorEmail,
      });

      if (issueResult.success) {
        result.success++;
        result.results.push({
          row: rowNumber,
          student: row.student_name,
          success: true,
          certificate_id: issueResult.certificate_id,
        });
        console.log(`  ✅ ${issueResult.certificate_id}`);
      } else {
        result.failed++;
        result.results.push({
          row: rowNumber,
          student: row.student_name,
          success: false,
          error: issueResult.error,
        });
        console.log(`  ❌ Failed: ${issueResult.error}`);
      }
    } catch (error) {
      result.failed++;
      result.results.push({
        row: rowNumber,
        student: row.student_name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.log(`  ❌ Error: ${error}`);
    }

    console.log();
  }

  return result;
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log('Bulk Certificate Import\n');
    console.log('Usage:');
    console.log('  npx tsx scripts/bulk-import-certificates.ts <csv-file> [options]\n');
    console.log('Options:');
    console.log('  --actor <email>    Email of person issuing certificates');
    console.log('  --dry-run          Preview without inserting into database');
    console.log('  --help             Show this help message\n');
    console.log('CSV Format:');
    console.log('  student_name,student_email,course_title,completed_at,course_id');
    console.log('  John Doe,john@example.com,Automation 101,2026-01-20,optional-uuid\n');
    console.log('Required Columns:');
    console.log('  - student_name     Full name of student');
    console.log('  - student_email    Student email address');
    console.log('  - course_title     Name of the course');
    console.log('  - completed_at     Completion date (YYYY-MM-DD or ISO)\n');
    console.log('Optional Columns:');
    console.log('  - course_id        Course UUID (generated if not provided)');
    process.exit(0);
  }

  const csvFile = args[0];
  const actorEmail = args.includes('--actor')
    ? args[args.indexOf('--actor') + 1]
    : undefined;
  const dryRun = args.includes('--dry-run');

  if (!fs.existsSync(csvFile)) {
    console.error(`❌ File not found: ${csvFile}`);
    process.exit(1);
  }

  console.log('📜 Bulk Certificate Import\n');
  console.log('═'.repeat(60));
  console.log();

  bulkImportCertificates(csvFile, actorEmail, dryRun)
    .then(result => {
      console.log('═'.repeat(60));
      console.log('\n📊 Import Summary\n');
      console.log(`Total rows: ${result.total}`);
      console.log(`✅ Success: ${result.success}`);
      console.log(`❌ Failed: ${result.failed}`);
      console.log();

      if (result.success > 0 && !dryRun) {
        console.log('✅ Successfully issued certificates:\n');
        result.results
          .filter(r => r.success)
          .forEach(r => {
            console.log(`  ${r.student}: ${r.certificate_id}`);
          });
        console.log();
      }

      if (result.failed > 0) {
        console.log('❌ Failed rows:\n');
        result.results
          .filter(r => !r.success)
          .forEach(r => {
            console.log(`  Row ${r.row} (${r.student}): ${r.error}`);
          });
        console.log();
      }

      if (dryRun) {
        console.log('ℹ️  This was a dry run. No certificates were issued.');
        console.log('   Remove --dry-run to actually issue certificates.');
      }

      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Import failed:', error.message);
      process.exit(1);
    });
}

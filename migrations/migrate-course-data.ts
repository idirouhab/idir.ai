/**
 * Course Data Migration Utility - REQUIRED FOR EXISTING COURSES
 *
 * ⚠️  BREAKING CHANGES: This migration is MANDATORY for all existing courses.
 *     Legacy formats are no longer supported. Courses with old format will fail to display.
 *
 * Migrates existing course_data from localized format to language-agnostic format:
 * - Converts localized duration strings ("4 semanas") → { value: 4, unit: 'weeks' }
 * - Converts localized hours strings ("4 hours en total") → { value: 4, unit: 'hours' }
 * - Converts localized day strings ("Lunes") → { days_of_week: [1] }
 * - Converts localized dates ("15 de Enero de 2025") → "2025-01-15" (ISO format)
 * - Converts form field labels ("Nombre") → "form.firstName" (translation keys)
 *
 * Usage:
 *   npx tsx migrations/migrate-course-data.ts [--dry-run] [--course-id=<id>]
 *
 * Options:
 *   --dry-run       Preview changes without updating (RECOMMENDED FIRST)
 *   --course-id     Only migrate specific course (by ID)
 *
 * ⚠️  IMPORTANT: Run --dry-run first to verify changes before applying!
 */

import postgres from 'postgres';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { CourseData } from '../lib/courses';

// Types for migration
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type CourseDuration = {
  value: number;
  unit: string;
};

// Load environment variables
function loadEnvFile() {
  const envFiles = ['.env.production.local'];
  let loaded = false;

  for (const envFile of envFiles) {
    const envPath = join(process.cwd(), envFile);
    if (existsSync(envPath)) {
      console.log(`✓ Loading environment from ${envFile}`);
      const envContent = readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
      loaded = true;
    }
  }

  if (!loaded) {
    console.error('❌ ERROR: No .env files found');
    process.exit(1);
  }
}

// Spanish day names to day indices
const SPANISH_DAYS: Record<string, DayOfWeek> = {
  'domingo': 0,
  'lunes': 1,
  'martes': 2,
  'miércoles': 3,
  'miercoles': 3, // Without accent
  'jueves': 4,
  'viernes': 5,
  'sábado': 6,
  'sabado': 6, // Without accent
};

// English day names to day indices
const ENGLISH_DAYS: Record<string, DayOfWeek> = {
  'sunday': 0,
  'monday': 1,
  'tuesday': 2,
  'wednesday': 3,
  'thursday': 4,
  'friday': 5,
  'saturday': 6,
};

// Parse duration string to structured format
function parseDuration(durationStr: string): CourseDuration | null {
  if (!durationStr || typeof durationStr !== 'string') return null;

  const trimmed = durationStr.toLowerCase().trim();

  // Match patterns like "4 weeks", "4 semanas", "2 days", "2 días"
  const weekPattern = /(\d+)\s*(week|semana|weeks|semanas)/;
  const dayPattern = /(\d+)\s*(day|día|days|días|dias)/;
  const hourPattern = /(\d+)\s*(hour|hora|hours|horas)/;

  let match;

  if ((match = trimmed.match(weekPattern))) {
    return { value: parseInt(match[1], 10), unit: 'weeks' };
  } else if ((match = trimmed.match(dayPattern))) {
    return { value: parseInt(match[1], 10), unit: 'days' };
  } else if ((match = trimmed.match(hourPattern))) {
    return { value: parseInt(match[1], 10), unit: 'hours' };
  }

  return null;
}

// Parse day string to day index
function parseDayOfWeek(dayStr: string): DayOfWeek | null {
  if (!dayStr || typeof dayStr !== 'string') return null;

  const normalized = dayStr.toLowerCase().trim();

  // Try Spanish first
  if (SPANISH_DAYS[normalized] !== undefined) {
    return SPANISH_DAYS[normalized];
  }

  // Try English
  if (ENGLISH_DAYS[normalized] !== undefined) {
    return ENGLISH_DAYS[normalized];
  }

  return null;
}

// Parse Spanish date string to ISO format
function parseSpanishDate(dateStr: string): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  // Pattern: "15 de Enero de 2025"
  const spanishMonths: Record<string, number> = {
    'enero': 0,
    'febrero': 1,
    'marzo': 2,
    'abril': 3,
    'mayo': 4,
    'junio': 5,
    'julio': 6,
    'agosto': 7,
    'septiembre': 8,
    'setiembre': 8,
    'octubre': 9,
    'noviembre': 10,
    'diciembre': 11,
  };

  const pattern = /(\d+)\s+de\s+(\w+)\s+de\s+(\d{4})/i;
  const match = dateStr.match(pattern);

  if (match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    const year = parseInt(match[3], 10);

    const month = spanishMonths[monthName];
    if (month !== undefined) {
      const date = new Date(year, month, day);
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
    }
  }

  // Try parsing as standard date
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  return null;
}

// Field name to translation key mapping
const FIELD_LABEL_KEYS: Record<string, string> = {
  'Nombre': 'form.firstName',
  'First Name': 'form.firstName',
  'Apellido': 'form.lastName',
  'Last Name': 'form.lastName',
  'Email': 'form.email',
  'Correo electrónico': 'form.email',
  'País': 'form.country',
  'Pais': 'form.country',
  'Country': 'form.country',
  'Año de nacimiento': 'form.birthYear',
  'Birth Year': 'form.birthYear',
};

// Migrate a single course's data
// Note: Input is 'any' because legacy data doesn't conform to strict CourseData type
function migrateCourseData(courseData: any): { migrated: any; changes: string[] } {
  const changes: string[] = [];
  const migrated: any = JSON.parse(JSON.stringify(courseData)); // Deep clone

  // Migrate logistics
  if (migrated.logistics) {
    // Step 1: Migrate duration
    if (migrated.logistics.duration && typeof migrated.logistics.duration === 'string') {
      const parsed = parseDuration(migrated.logistics.duration);
      if (parsed) {
        migrated.logistics.duration = parsed;
        changes.push(`duration: "${courseData.logistics.duration}" → ${JSON.stringify(parsed)}`);
      }
    }

    // Step 2: Migrate schedule (string to structured)
    if (migrated.logistics.schedule && typeof migrated.logistics.schedule === 'string') {
      const dayIndex = parseDayOfWeek(migrated.logistics.schedule);
      if (dayIndex !== null) {
        const oldSchedule = migrated.logistics.schedule;
        migrated.logistics.schedule = {
          days_of_week: [dayIndex],
          time_display: migrated.logistics.scheduleDetail || undefined,
        };
        changes.push(`schedule: "${oldSchedule}" → { days_of_week: [${dayIndex}] }`);

        // Remove legacy scheduleDetail field after migration
        if (migrated.logistics.scheduleDetail) {
          delete migrated.logistics.scheduleDetail;
          changes.push(`Removed legacy scheduleDetail field (value moved to schedule.time_display)`);
        }
      }
    }

    // Step 3: Migrate hours → session_duration_hours (calculate from total)
    if (migrated.logistics.hours && typeof migrated.logistics.hours === 'string') {
      const totalHoursMatch = migrated.logistics.hours.match(/(\d+(?:\.\d+)?)\s*(?:hours?|horas?)/i);
      if (totalHoursMatch) {
        const totalHours = parseFloat(totalHoursMatch[1]);

        // Calculate session_duration_hours from total hours
        let sessionHours = 1.5; // Default fallback

        if (typeof migrated.logistics.duration === 'object' &&
            migrated.logistics.duration.unit === 'weeks' &&
            typeof migrated.logistics.schedule === 'object' &&
            migrated.logistics.schedule.days_of_week?.length > 0) {
          // session_duration_hours = total_hours / (days_per_week × weeks)
          const daysPerWeek = migrated.logistics.schedule.days_of_week.length;
          const weeks = migrated.logistics.duration.value;
          sessionHours = totalHours / (daysPerWeek * weeks);
        }

        migrated.logistics.session_duration_hours = sessionHours;
        changes.push(`hours: "${courseData.logistics.hours}" → session_duration_hours: ${sessionHours} (calculated)`);

        // Remove legacy hours field
        delete migrated.logistics.hours;
      }
    }

    // Step 4: Set default session_duration_hours if not set
    if (!migrated.logistics.session_duration_hours) {
      migrated.logistics.session_duration_hours = 1.5;
      changes.push(`Added default session_duration_hours: 1.5`);
    }

    // Step 5: Migrate startDate
    if (migrated.logistics.startDate && typeof migrated.logistics.startDate === 'string') {
      const isoDate = parseSpanishDate(migrated.logistics.startDate);
      if (isoDate && isoDate !== migrated.logistics.startDate) {
        changes.push(`startDate: "${migrated.logistics.startDate}" → "${isoDate}"`);
        migrated.logistics.startDate = isoDate;
      }
    }

    // Step 6: Ensure schedule is an object (not string)
    if (typeof migrated.logistics.schedule === 'string') {
      // If we couldn't parse it, create default
      migrated.logistics.schedule = {
        days_of_week: [],
        time_display: migrated.logistics.schedule,
      };
      changes.push(`schedule: converted unparseable string to empty days_of_week`);
    }

    // Step 7: Ensure duration is an object (not string)
    if (typeof migrated.logistics.duration === 'string') {
      // If we couldn't parse it, create default
      migrated.logistics.duration = {
        value: 4,
        unit: 'weeks',
      };
      changes.push(`duration: converted unparseable string to default { value: 4, unit: 'weeks' }`);
    }
  }

  // Migrate form fields
  if (migrated.form?.fields) {
    for (const field of migrated.form.fields) {
      if (field.label && !field.label_key) {
        const labelKey = FIELD_LABEL_KEYS[field.label];
        if (labelKey) {
          field.label_key = labelKey;
          changes.push(`form field "${field.name}": label "${field.label}" → label_key "${labelKey}"`);
        }
      }
    }
  }

  return { migrated, changes };
}

async function runMigration() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Course Data Migration - BREAKING CHANGES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  This migration converts course data to new format');
  console.log('⚠️  Legacy formats are NO LONGER SUPPORTED');
  console.log('⚠️  Unmigrated courses will FAIL to display');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const courseIdArg = args.find(arg => arg.startsWith('--course-id='));
  const specificCourseId = courseIdArg ? courseIdArg.split('=')[1] : null;

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be saved\n');
  } else {
    console.log('⚡ LIVE MODE - Changes will be applied to database\n');
  }

  loadEnvFile();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL not found');
    process.exit(1);
  }

  const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
  const sql = postgres(databaseUrl, {
    ssl: isLocal ? false : 'require',
  });

  try {
    // Fetch courses
    let courses;
    if (specificCourseId) {
      console.log(`📚 Fetching course: ${specificCourseId}\n`);
      courses = await sql`SELECT id, slug, title, course_data, language FROM courses WHERE id = ${specificCourseId}`;
    } else {
      console.log('📚 Fetching all courses...\n');
      courses = await sql`SELECT id, slug, title, course_data, language FROM courses`;
    }

    console.log(`Found ${courses.length} course(s)\n`);

    let migratedCount = 0;
    let unchangedCount = 0;

    for (const course of courses) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📖 ${course.title} (${course.slug})`);
      console.log(`   ID: ${course.id} | Language: ${course.language}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      if (!course.course_data) {
        console.log('⚠️  No course_data found, skipping');
        unchangedCount++;
        continue;
      }

      const { migrated, changes } = migrateCourseData(course.course_data);

      if (changes.length === 0) {
        console.log('✓ No migration needed');
        unchangedCount++;
        continue;
      }

      console.log(`\n📝 Changes (${changes.length}):`);
      changes.forEach((change, i) => {
        console.log(`   ${i + 1}. ${change}`);
      });

      if (!dryRun) {
        await sql`
          UPDATE courses
          SET course_data = ${sql.json(migrated)},
              updated_at = NOW()
          WHERE id = ${course.id}
        `;
        console.log('✅ Migrated successfully');
        migratedCount++;
      } else {
        console.log('🔍 Would migrate (dry run)');
        migratedCount++;
      }
    }

    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 Migration Summary`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Migrated: ${migratedCount}`);
    console.log(`⏭️  Unchanged: ${unchangedCount}`);
    console.log(`📚 Total: ${courses.length}`);

    if (dryRun && migratedCount > 0) {
      console.log(`\n💡 Run without --dry-run to apply changes`);
    } else if (migratedCount > 0) {
      console.log(`\n✨ Migration completed successfully!`);
    } else {
      console.log(`\n✓ All courses are already up to date`);
    }

  } catch (error: any) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

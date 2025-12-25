import { cache } from 'react';
import { query } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

// --- SUB-TYPES FOR JSON COURSE_DATA ---

export type CourseBenefit = {
    icon: string;
    title: string;
    description: string;
};

export type CurriculumItem = {
    title: string;
    description: string;
};

export type Section = {
    title: string;
    description: string;
};


export type Curriculum = {
    label: string;
    description: string;
    items: CurriculumItem[];
    sections: Section[];
};

export type CapacityConfig = {
    isLimited: boolean;
    number: string;        // e.g., "12/50 seats"
    reason: string;        // e.g., "To ensure 1:1 mentorship quality"
    waitlistText: string;  // e.g., "Join the waitlist for the next cohort"
};

export type Logistics = {
    startDate: string;
    schedule: string;
    scheduleDetail: string;
    duration: string;
    modality: string;
    hours: number;
    capacity?: CapacityConfig;
};

export type Donation = {
    label: string;
    text: string;
    link: string;
    linkText: string;
};

export type Pricing = {
    isFree: boolean;
    amount: number;
    currency: string;
    discountPrice?: number;
    badge?: string; // e.g., "Early Bird", "Corporate"
};

export type Commitment = {
    title: string;
    checkboxLabel: string;
    amountSuggestion: string;
    note: string;
};

export type FormField = {
    name: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'tel' | 'select' | 'textarea';
    required?: boolean;
    placeholder?: string;
    options?: string[]; // For select fields
};

export type FormConfig = {
    enabled: boolean;
    endpoint: string;
    fields?: FormField[]; // New structured fields
    requiresTerms: boolean;
    requiresCommitment: boolean;
};

export type Instructor = {
    name: string;
    title: string;
    bio: string;
    image?: string; // Optional instructor profile image URL
    linkedin?: string;
    twitter?: string;
    website?: string;
};

export type CourseData = {
    hero: {
        badge: string;
        title: string;
        subtitle: string;
        description: string;
    };
    benefits: CourseBenefit[];
    curriculum: Curriculum;
    logistics: Logistics;
    donation?: Donation;
    outcomes: {
        label: string;
        items: string[];
        description: string;
    };
    pricing: Pricing;
    commitment?: Commitment;
    form: FormConfig;
    instructors?: Instructor[]; // New instructors section
};

// --- DATABASE MAIN TYPE ---

export type Course = {
    id: string;
    slug: string;
    title: string;
    short_description: string;
    language: 'en' | 'es';
    course_data: CourseData;
    meta_title: string | null;
    meta_description: string | null;
    cover_image: string | null;
    status: 'draft' | 'published';
    published_at: string | null;
    course_signups: Array<{ count: number }>;
    view_count: number;
    created_at: string;
    updated_at: string;
};

// --- SUPABASE CLIENTS ---

export function getCourseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }
    return createClient(supabaseUrl, supabaseAnonKey);
}

export function getAdminCourseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Missing Supabase admin environment variables');
    }
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// --- DATA FETCHING (CACHED) ---

export const getPublishedCourses = cache(async (language: 'en' | 'es') => {
    try {
        const result = await query(
            `SELECT * FROM courses
             WHERE status = 'published' AND language = $1
             ORDER BY published_at DESC`,
            [language]
        );
        return result.rows as Course[];
    } catch (error) {
        console.error('Error fetching published courses:', error);
        return [];
    }
});

export const getAllPublishedCourses = cache(async () => {
    try {
        const result = await query(
            `SELECT * FROM courses
             WHERE status = 'published'
             ORDER BY published_at DESC`
        );
        return result.rows as Course[];
    } catch (error) {
        console.error('Error fetching all published courses:', error);
        return [];
    }
});

export const getPublishedCourseBySlug = cache(async (slug: string, language: 'en' | 'es') => {
    try {
        const result = await query(
            `SELECT * FROM courses
             WHERE slug = $1 AND language = $2 AND status = 'published'`,
            [slug, language]
        );
        return result.rows.length > 0 ? result.rows[0] as Course : null;
    } catch (error) {
        console.error('Error fetching course by slug:', error);
        return null;
    }
});

// --- UTILITIES ---

export async function incrementCourseViews(courseId: string) {
    try {
        await query(
            'UPDATE courses SET view_count = view_count + 1 WHERE id = $1',
            [courseId]
        );
    } catch (error) {
        console.error('Error incrementing course views:', error);
    }
}

export function generateCourseSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')                 // split accents from letters
        .replace(/[\u0300-\u036f]/g, '')  // remove the accent marks
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// --- ADMIN CRUD FUNCTIONS ---

export async function getAllCourses() {
    const result = await query(`
        SELECT
            c.*,
            COALESCE(
                json_agg(
                    json_build_object('count', signup_count.count)
                ) FILTER (WHERE signup_count.count IS NOT NULL),
                '[]'::json
            ) as course_signups
        FROM courses c
        LEFT JOIN (
            SELECT course_id, COUNT(*)::int as count
            FROM course_signups
            GROUP BY course_id
        ) signup_count ON c.id = signup_count.course_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
    `);

    return result.rows as Course[];
}

export async function getCourseById(id: string) {
    const result = await query(
        'SELECT * FROM courses WHERE id = $1',
        [id]
    );

    if (result.rows.length === 0) {
        throw new Error('Course not found');
    }

    return result.rows[0] as Course;
}

export async function createCourse(course: Partial<Course>) {
    const fields = Object.keys(course);
    const values = Object.values(course);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const fieldNames = fields.join(', ');

    const result = await query(
        `INSERT INTO courses (${fieldNames}) VALUES (${placeholders}) RETURNING *`,
        values
    );

    return result.rows[0] as Course;
}

export async function updateCourse(id: string, updates: Partial<Course>) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

    const result = await query(
        `UPDATE courses SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
    );

    if (result.rows.length === 0) {
        throw new Error('Course not found');
    }

    return result.rows[0] as Course;
}

export async function deleteCourse(id: string) {
    const result = await query(
        'DELETE FROM courses WHERE id = $1 RETURNING id',
        [id]
    );

    if (result.rows.length === 0) {
        throw new Error('Course not found');
    }
}
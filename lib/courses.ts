import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';

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

export type Curriculum = {
    label: string;
    description: string;
    items: CurriculumItem[];
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
    };
    pricing: Pricing;
    commitment?: Commitment;
    form: FormConfig;
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
    enrollment_count: number;
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
    const supabase = getCourseClient();
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .eq('language', language)
        .order('published_at', { ascending: false });

    if (error) return [];
    return (data || []) as Course[];
});

export const getPublishedCourseBySlug = cache(async (slug: string, language: 'en' | 'es') => {
    const supabase = getCourseClient();
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('language', language)
        .eq('status', 'published')
        .single();

    if (error) return null;
    return data as Course;
});

// --- UTILITIES ---

export async function incrementCourseViews(courseId: string) {
    const supabase = getCourseClient();
    await supabase.rpc('increment_course_views', { course_id: courseId });
}

export function generateCourseSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// --- ADMIN CRUD FUNCTIONS ---

export async function getAllCourses() {
    const supabase = getAdminCourseClient();
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Course[];
}

export async function getCourseById(id: string) {
    const supabase = getAdminCourseClient();
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Course;
}

export async function createCourse(course: Partial<Course>) {
    const supabase = getAdminCourseClient();
    const { data, error } = await supabase.from('courses').insert([course]).select().single();
    if (error) throw error;
    return data as Course;
}

export async function updateCourse(id: string, updates: Partial<Course>) {
    const supabase = getAdminCourseClient();
    const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Course;
}

export async function deleteCourse(id: string) {
    const supabase = getAdminCourseClient();
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
}
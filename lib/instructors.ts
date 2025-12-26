import 'server-only';
import { query } from '@/lib/db';

export type Instructor = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    title?: string;
    date_of_birth?: string;
    country?: string;
    description?: string;
    picture_url?: string;
    preferred_language: string;
    is_active: boolean;
    role: string;
    linkedin_url?: string;
    website_url?: string;
    x_url?: string;
    youtube_url?: string;
    created_at: string;
    updated_at: string;
};

export type CourseInstructor = {
    id: string;
    course_id: string;
    instructor_id: string;
    display_order: number;
    instructor_role: string;
    created_at: string;
    updated_at: string;
    instructor?: Instructor;
};

/**
 * Get all active instructors
 */
export async function getAllInstructors(): Promise<Instructor[]> {
    const sql = `
        SELECT
            id, email, first_name, last_name, title, date_of_birth, country,
            description, picture_url, preferred_language, is_active, role,
            linkedin_url, website_url, x_url, youtube_url,
            created_at, updated_at
        FROM instructors
        WHERE is_active = true
        ORDER BY last_name, first_name
    `;

    const result = await query(sql, []);
    return result.rows;
}

/**
 * Get instructor by ID
 */
export async function getInstructorById(id: string): Promise<Instructor | null> {
    const sql = `
        SELECT
            id, email, first_name, last_name, title, date_of_birth, country,
            description, picture_url, preferred_language, is_active, role,
            linkedin_url, website_url, x_url, youtube_url,
            created_at, updated_at
        FROM instructors
        WHERE id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
}

/**
 * Assign instructors to a course
 */
export async function assignInstructorsToCourse(
    courseId: string,
    instructors: Array<{ instructor_id: string; display_order: number; instructor_role: string }>
): Promise<void> {
    // First, remove existing assignments
    await query('DELETE FROM course_instructors WHERE course_id = $1', [courseId]);

    // Then insert new assignments
    if (instructors.length > 0) {
        const values = instructors.map((_, i) =>
            `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`
        ).join(', ');

        const params = [courseId];
        instructors.forEach(inst => {
            params.push(inst.instructor_id, String(inst.display_order), inst.instructor_role);
        });

        const sql = `
            INSERT INTO course_instructors (course_id, instructor_id, display_order, instructor_role)
            VALUES ${values}
        `;

        await query(sql, params);
    }
}

/**
 * Get instructors assigned to a course
 */
export async function getCourseInstructors(courseId: string): Promise<CourseInstructor[]> {
    const sql = `
        SELECT
            ci.id,
            ci.course_id,
            ci.instructor_id,
            ci.display_order,
            ci.instructor_role,
            ci.created_at,
            ci.updated_at,
            i.id as "instructor.id",
            i.email as "instructor.email",
            i.first_name as "instructor.first_name",
            i.last_name as "instructor.last_name",
            i.title as "instructor.title",
            i.description as "instructor.description",
            i.picture_url as "instructor.picture_url",
            i.linkedin_url as "instructor.linkedin_url",
            i.website_url as "instructor.website_url",
            i.x_url as "instructor.x_url",
            i.youtube_url as "instructor.youtube_url",
            i.role as "instructor.role"
        FROM course_instructors ci
        JOIN instructors i ON ci.instructor_id = i.id
        WHERE ci.course_id = $1
        ORDER BY ci.display_order
    `;

    const result = await query(sql, [courseId]);

    // Transform flat rows into nested structure
    return result.rows.map(row => ({
        id: row.id,
        course_id: row.course_id,
        instructor_id: row.instructor_id,
        display_order: row.display_order,
        instructor_role: row.instructor_role,
        created_at: row.created_at,
        updated_at: row.updated_at,
        instructor: {
            id: row['instructor.id'],
            email: row['instructor.email'],
            first_name: row['instructor.first_name'],
            last_name: row['instructor.last_name'],
            title: row['instructor.title'],
            description: row['instructor.description'],
            picture_url: row['instructor.picture_url'],
            linkedin_url: row['instructor.linkedin_url'],
            website_url: row['instructor.website_url'],
            x_url: row['instructor.x_url'],
            youtube_url: row['instructor.youtube_url'],
            role: row['instructor.role'],
        } as Instructor,
    }));
}

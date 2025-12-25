// Pure utility functions for courses that can be used client-side
// No database or server-only dependencies here

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

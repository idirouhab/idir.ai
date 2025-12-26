import { NextRequest, NextResponse } from 'next/server';
import { getAllCourses, createCourse } from '@/lib/courses';
import { checkAuth } from '@/lib/auth';
import { assignInstructorsToCourse } from '@/lib/instructors';

export async function GET(request: NextRequest) {
  try {
    const payload = await checkAuth(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = await getAllCourses();
    return NextResponse.json({ courses }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await checkAuth(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { instructors, ...courseData } = body;

    // Create the course first
    const course = await createCourse(courseData);

    // Then assign instructors if provided
    if (instructors && Array.isArray(instructors) && instructors.length > 0) {
      await assignInstructorsToCourse(course.id, instructors);
    }

    return NextResponse.json({ course }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create course' },
      { status: 500 }
    );
  }
}

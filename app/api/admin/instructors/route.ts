import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { getAllInstructors } from '@/lib/instructors';

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const authResult = await checkAuth(request);
        if (!authResult) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch all active instructors
        const instructors = await getAllInstructors();

        return NextResponse.json({ instructors });
    } catch (error) {
        console.error('Error fetching instructors:', error);
        return NextResponse.json(
            { error: 'Failed to fetch instructors' },
            { status: 500 }
        );
    }
}

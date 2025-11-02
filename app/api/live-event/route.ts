import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

const dataFilePath = path.join(process.cwd(), 'data', 'liveEvent.json');

// GET: Read the live event data
export async function GET() {
  // Check authentication
  const sessionCookie = cookies().get('admin-session');
  if (!sessionCookie) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading live event data:', error);
    return NextResponse.json(
      { error: 'Failed to read live event data' },
      { status: 500 }
    );
  }
}

// POST: Update the live event data
export async function POST(request: Request) {
  // Check authentication
  const sessionCookie = cookies().get('admin-session');
  if (!sessionCookie) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate the data structure
    if (typeof body.isActive !== 'boolean' || !body.en || !body.es) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // Write to file
    await fs.writeFile(
      dataFilePath,
      JSON.stringify(body, null, 2),
      'utf8'
    );

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('Error updating live event data:', error);
    return NextResponse.json(
      { error: 'Failed to update live event data' },
      { status: 500 }
    );
  }
}

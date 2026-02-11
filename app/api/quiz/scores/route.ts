import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';

const ScoreSchema = z.object({
  username: z.string().min(2).max(64),
  score: z.number().int().min(0),
  total_questions: z.number().int().min(1),
  max_streak: z.number().int().min(0),
  language: z.enum(['en', 'es']),
  total_time_seconds: z.number().int().min(0),
  final_score: z.number().int().min(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') === 'es' ? 'es' : 'en';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50'), 1), 100);

    const result = await query(
      `SELECT username, score, total_questions, max_streak, completed_at, final_score, total_time_seconds
       FROM quiz_scores
       WHERE language = $1
       ORDER BY final_score DESC
       LIMIT $2`,
      [language, limit]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching quiz scores:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch scores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ScoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const data = parsed.data;
    await query(
      `INSERT INTO quiz_scores (
        username, score, total_questions, max_streak, language, total_time_seconds, final_score
       ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        data.username.trim(),
        data.score,
        data.total_questions,
        data.max_streak,
        data.language,
        data.total_time_seconds,
        data.final_score,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving quiz score:', error);
    return NextResponse.json({ success: false, error: 'Failed to save score' }, { status: 500 });
  }
}

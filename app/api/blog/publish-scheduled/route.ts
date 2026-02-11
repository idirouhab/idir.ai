import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * POST /api/blog/publish-scheduled
 *
 * Publishes all blog posts that are scheduled to be published now or earlier.
 * This endpoint should be called by a cron job (n8n workflow) every 10 minutes.
 *
 * Security: Protected by API key (SCHEDULER_POST_API_KEY environment variable)
 *
 * Logic:
 * - Finds all posts with status='draft' AND scheduled_publish_at <= NOW()
 * - Updates them to status='published' and sets published_at to NOW()
 * - Returns count of published posts
 */
export async function POST(request: NextRequest) {
  try {
    // Security: Verify API key from n8n
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.SCHEDULER_POST_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: SCHEDULER_POST_API_KEY not set' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date().toISOString();

    // Find all posts that should be published
    const scheduledResult = await query(
      `SELECT id, title, slug, language, scheduled_publish_at, scheduled_timezone
       FROM blog_posts
       WHERE status = 'draft'
         AND scheduled_publish_at IS NOT NULL
         AND scheduled_publish_at <= $1`,
      [now]
    );
    const scheduledPosts = scheduledResult.rows;

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({
        success: true,
        published_count: 0,
        message: 'No posts to publish',
        checked_at: now,
      });
    }

    // Publish each post
    const publishResults = [];
    for (const post of scheduledPosts) {
      try {
        await query(
          `UPDATE blog_posts
           SET status = 'published',
               published_at = $1,
               scheduled_publish_at = NULL
           WHERE id = $2`,
          [now, post.id]
        );
        console.log(`✅ Published: ${post.title} (${post.language}) - scheduled for ${post.scheduled_publish_at} ${post.scheduled_timezone}`);
        publishResults.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          language: post.language,
          scheduled_for: post.scheduled_publish_at,
          timezone: post.scheduled_timezone,
          success: true,
        });
      } catch (updateError: any) {
        console.error(`Error publishing post ${post.id}:`, updateError);
        publishResults.push({
          id: post.id,
          title: post.title,
          success: false,
          error: updateError?.message || 'Failed to publish',
        });
      }
    }

    const successCount = publishResults.filter(r => r.success).length;
    const failCount = publishResults.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      published_count: successCount,
      failed_count: failCount,
      results: publishResults,
      checked_at: now,
    });

  } catch (error: any) {
    console.error('Error in publish-scheduled endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check status (for testing)
export async function GET(request: NextRequest) {
  try {
    // Security: Verify API key
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.SCHEDULER_POST_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: SCHEDULER_POST_API_KEY not set' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date().toISOString();

    // Count posts that are scheduled
    const scheduledResult = await query(
      `SELECT id, title, slug, language, scheduled_publish_at, scheduled_timezone
       FROM blog_posts
       WHERE status = 'draft'
         AND scheduled_publish_at IS NOT NULL
       ORDER BY scheduled_publish_at ASC`
    );
    const data = scheduledResult.rows;

    const readyToPublish = data?.filter(p => p.scheduled_publish_at && p.scheduled_publish_at <= now) || [];
    const futureScheduled = data?.filter(p => p.scheduled_publish_at && p.scheduled_publish_at > now) || [];

    return NextResponse.json({
      current_time: now,
      ready_to_publish: readyToPublish.length,
      future_scheduled: futureScheduled.length,
      ready_posts: readyToPublish,
      future_posts: futureScheduled,
    });

  } catch (error: any) {
    console.error('Error in publish-scheduled GET endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

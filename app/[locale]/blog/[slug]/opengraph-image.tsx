import { ImageResponse } from 'next/og';
import { getPublishedPostBySlug, categoryColors } from '@/lib/blog';

export const runtime = 'edge';
export const alt = 'Blog Post';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPublishedPostBySlug(slug, locale as 'en' | 'es');

  if (!post) {
    // Fallback image if post not found
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0a',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 900, color: '#fff' }}>
            Post Not Found
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const categoryColor = categoryColors[post.category];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0a0a',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        {/* Corner accents */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 40,
            height: 40,
            background: categoryColor,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 40,
            height: 40,
            background: categoryColor,
          }}
        />

        {/* Category Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              padding: '12px 24px',
              background: `${categoryColor}20`,
              color: categoryColor,
              border: `4px solid ${categoryColor}`,
              fontSize: 28,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: 3,
            }}
          >
            {post.category}
          </div>
          <div
            style={{
              color: '#6b7280',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {post.read_time_minutes || 5} MIN READ
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: post.title.length > 60 ? 56 : 72,
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.2,
              maxHeight: '400px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {post.title}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 40,
            paddingTop: 40,
            borderTop: '4px solid #1f2937',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <img
              src="https://idir.ai/logo-idirai-light-green.png"
              alt="idir.ai"
              width="120"
              height="59"
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                Idir Ouhab Meskine
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: '#6b7280',
                }}
              >
                idir.ai
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: '#00ff88',
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            BLOG
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

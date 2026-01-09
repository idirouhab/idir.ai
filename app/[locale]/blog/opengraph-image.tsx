import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Blog - Idir Ouhab Meskine';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const content = {
    en: {
      title: 'BLOG',
      subtitle: 'Thoughts on AI, Automation & Tech',
      categories: ['INSIGHTS', 'LEARNINGS', 'OPINION'],
    },
    es: {
      title: 'BLOG',
      subtitle: 'Pensamientos sobre IA, Automatización y Tecnología',
      categories: ['PERSPECTIVAS', 'APRENDIZAJES', 'OPINIÓN'],
    },
  };

  const lang = locale === 'es' ? 'es' : 'en';
  const text = content[lang];

  const colors = ['#ff0055', '#00ff88', '#00cfff'];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0a0a',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Decorative line */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 80,
            width: 80,
            height: 8,
            background: '#00ff88',
          }}
        />

        {/* Corner accents */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 40,
            height: 40,
            background: '#00ff88',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 40,
            height: 40,
            background: '#00cfff',
          }}
        />

        {/* Label */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: '#00ff88',
            textTransform: 'uppercase',
            letterSpacing: 4,
            marginBottom: 40,
          }}
        >
          {text.title}
        </div>

        {/* Main Title */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: 30,
            }}
          >
            {text.title}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#6b7280',
              lineHeight: 1.4,
              maxWidth: '900px',
            }}
          >
            {text.subtitle}
          </div>
        </div>

        {/* Categories */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginBottom: 40,
          }}
        >
          {text.categories.map((category, index) => (
            <div
              key={category}
              style={{
                padding: '16px 32px',
                background: `${colors[index]}20`,
                color: colors[index],
                border: `3px solid ${colors[index]}`,
                fontSize: 24,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              {category}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
              src="logo-idirai.png"
              alt="idir.ai"
              width="120"
              height="59"
            />
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              Idir Ouhab Meskine
            </div>
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#6b7280',
            }}
          >
            idir.ai
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

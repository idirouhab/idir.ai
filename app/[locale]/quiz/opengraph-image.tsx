import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AI Quiz Challenge - Test Your AI Knowledge';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const title = locale === 'es' ? 'Desafío Quiz IA' : 'AI Quiz Challenge';
  const subtitle =
    locale === 'es'
      ? 'Pon a prueba tus conocimientos de IA'
      : 'Test Your AI Knowledge';
  const features =
    locale === 'es'
      ? ['🎯 Quiz Interactivo', '⚡ Puntos por Velocidad', '🏆 Ranking Global']
      : ['🎯 Interactive Quiz', '⚡ Speed Bonus Points', '🏆 Global Leaderboard'];

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          position: 'relative',
        }}
      >
        {/* Grid Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            opacity: 0.1,
            display: 'flex',
          }}
        />

        {/* Glowing Orbs */}
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '100px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: '#00ff88',
            filter: 'blur(100px)',
            opacity: 0.3,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '100px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: '#ff0055',
            filter: 'blur(100px)',
            opacity: 0.3,
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10,
            padding: '80px',
          }}
        >
          {/* Main Title */}
          <div
            style={{
              fontSize: '80px',
              fontWeight: 900,
              background: 'linear-gradient(90deg, #00ff88 0%, #00cfff 50%, #ff0055 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
              marginBottom: '20px',
              display: 'flex',
              letterSpacing: '-2px',
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '36px',
              fontWeight: 600,
              color: '#a0a0a0',
              textAlign: 'center',
              marginBottom: '50px',
              display: 'flex',
            }}
          >
            {subtitle}
          </div>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: '30px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '15px 30px',
                  border: '2px solid #00ff88',
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  color: '#00ff88',
                  fontSize: '24px',
                  fontWeight: 700,
                }}
              >
                {feature}
              </div>
            ))}
          </div>

          {/* Bottom Tag */}
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '28px',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            idir.ai
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'es';
    const isSpanish = locale === 'es';

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
            background: 'linear-gradient(135deg, #050505 0%, #0a0a0a 50%, #0f0f0f 100%)',
            position: 'relative',
          }}
        >
          {/* Top Neon Border */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: 'linear-gradient(90deg, #00ff88 0%, #00cfff 25%, #ff0055 50%, #00cfff 75%, #00ff88 100%)',
            }}
          />

          {/* Main Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 100px',
              textAlign: 'center',
            }}
          >
            {/* Main Title */}
            <div
              style={{
                fontSize: '120px',
                fontWeight: 900,
                letterSpacing: '-4px',
                background: 'linear-gradient(135deg, #00ff88 0%, #00cfff 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: '20px',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              AUTOMATIZACIÓN 101
            </div>

            {/* Subtitle with Idir */}
            <div
              style={{
                fontSize: '42px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '60px',
                display: 'flex',
              }}
            >
              con Idir
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: '36px',
                fontWeight: 600,
                color: '#b8b8b8',
                maxWidth: '900px',
                lineHeight: 1.4,
                marginBottom: '60px',
                display: 'flex',
              }}
            >
              {isSpanish
                ? 'Domina la lógica de la automatización aunque empieces desde cero'
                : 'Master automation logic even if you start from scratch'}
            </div>

            {/* Badges */}
            <div
              style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Badge 1 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cfff 100%)',
                  borderRadius: '12px',
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#000000',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {isSpanish ? '4 SESIONES EN VIVO' : '4 LIVE SESSIONS'}
              </div>

              {/* Badge 2 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #ff0055 0%, #9b59d0 100%)',
                  borderRadius: '12px',
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {isSpanish ? 'DONACIÓN €5/$5' : 'DONATION €5/$5'}
              </div>

              {/* Badge 3 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 32px',
                  background: 'rgba(0, 207, 255, 0.2)',
                  border: '3px solid #00cfff',
                  borderRadius: '12px',
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#00cfff',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {isSpanish ? '14 ENERO 2026' : 'JAN 14 2026'}
              </div>
            </div>
          </div>

          {/* Bottom branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 900,
                color: '#00ff88',
                letterSpacing: '2px',
                display: 'flex',
              }}
            >
              idir.ai
            </div>
          </div>

          {/* Bottom Neon Border */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: 'linear-gradient(90deg, #ff0055 0%, #00cfff 25%, #00ff88 50%, #00cfff 75%, #ff0055 100%)',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('OG Image generation error:', e.message);
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    });
  }
}

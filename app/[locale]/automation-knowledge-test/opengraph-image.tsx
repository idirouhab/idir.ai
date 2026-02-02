import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Automation Skills Diagnostic - Find Your Level';
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const fontData = await fetch(
    new URL('../../../public/fonts/Poppins-SemiBold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const accent = '#11b981';
  const secondAccent = '#0055ff';

  const title = locale === 'es' ? 'DIAGNÓSTICO DE AUTOMATIZACIÓN' : 'AUTOMATION DIAGNOSTIC';
  const subtitle = locale === 'es'
    ? 'Determina tu nivel técnico y encuentra tu camino'
    : 'Determine Your Technical Level and Find Your Path';
  const tag = locale === 'es' ? 'Diagnóstico Profesional' : 'Professional Diagnostic';
  const role = locale === 'es' ? 'Ingeniero de Soluciones' : 'Solutions Engineer';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#000000',
          backgroundImage: 'radial-gradient(circle at 50% 0%, #111 0%, #000 100%)',
          padding: '80px',
          position: 'relative',
          fontFamily: 'Poppins',
          overflow: 'hidden',
        }}
      >
        {/* --- BACKGROUND GRID --- */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            opacity: 0.2,
          }}
        />

        {/* --- AMBIENT GLOWS --- */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '600px', height: '600px', background: `${accent}15`, filter: 'blur(120px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', background: `${secondAccent}15`, filter: 'blur(120px)', borderRadius: '50%' }} />

        {/* --- TOP ROW --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-1px' }}>
            idir<span style={{ color: accent }}>.ai</span>
          </div>

          <div style={{
            padding: '10px 24px',
            borderRadius: '50px',
            border: `1px solid ${accent}40`,
            background: `${accent}10`,
            color: accent,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            {tag}
          </div>
        </div>

        {/* --- CENTER SECTION --- */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', width: '100%', flex: 1, zIndex: 10, gap: '30px' }}>
          {/* Title */}
          <div style={{
            fontSize: 100,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: '-6px',
            color: 'transparent',
            backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #999999 100%)',
            backgroundClip: 'text',
            maxWidth: '900px',
          }}>
            {title}
          </div>

          {/* Subtitle */}
          <div style={{ fontSize: 28, color: '#666', letterSpacing: '0.5px', maxWidth: '700px', lineHeight: 1.4 }}>
            {subtitle}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: accent }}>5</span>
              <span style={{ fontSize: 14, color: '#666', textTransform: 'uppercase', letterSpacing: '2px' }}>
                {locale === 'es' ? 'Áreas' : 'Skill Areas'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: secondAccent }}>4</span>
              <span style={{ fontSize: 14, color: '#666', textTransform: 'uppercase', letterSpacing: '2px' }}>
                {locale === 'es' ? 'Niveles' : 'Levels'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: '#f59e0b' }}>50</span>
              <span style={{ fontSize: 14, color: '#666', textTransform: 'uppercase', letterSpacing: '2px' }}>
                {locale === 'es' ? 'Puntos Max' : 'Max Points'}
              </span>
            </div>
          </div>
        </div>

        {/* --- BOTTOM ROW --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1a1a1a', border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontWeight: 700, fontSize: 22 }}>IO</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 22 }}>Idir Ouhab Meskine</span>
              <span style={{ color: '#666', fontSize: 16 }}>{role}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <div key={i} style={{
                width: '10px',
                height: `${30 + Math.random() * 40}px`,
                background: i === 5 ? accent : '#333',
                borderRadius: '5px'
              }} />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Poppins',
          data: fontData,
          style: 'normal',
          weight: 600,
        },
      ],
    }
  );
}

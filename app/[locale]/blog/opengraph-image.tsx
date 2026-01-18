import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    // Load font
    const fontData = await fetch(
        new URL('../../../public/fonts/Poppins-SemiBold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    const content = {
        en: {
            tag: 'AI & AUTOMATION BLOG',
            title: 'THE BLOG',
            subtitle: 'Expert opinions, technical insights, and key learnings to help you build the future of work.',
            cta: 'Read Articles',
            role: 'Solutions Engineer',
        },
        es: {
            tag: 'BLOG DE IA Y AUTOMATIZACIÓN',
            title: 'EL BLOG',
            subtitle: 'Opiniones expertas, insights técnicos y aprendizajes para construir el futuro del trabajo.',
            cta: 'Leer Artículos',
            role: 'Ingeniero de Soluciones',
        },
    };

    const lang = locale === 'es' ? 'es' : 'en';
    const t = content[lang];
    const accent = '#11b981';

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: '#000',
                    backgroundImage: 'radial-gradient(circle at 50% 0%, #111 0%, #000 70%)',
                    padding: '80px',
                    position: 'relative',
                    fontFamily: 'Poppins',
                }}
            >
                {/* BACKGROUND ELEMENTS */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)`, backgroundSize: '60px 60px', opacity: 0.15 }} />

                {/* TOP BAR - zIndex is now a unitless number */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                    <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#fff' }}>
                        idir<span style={{ color: accent }}>.ai</span>
                    </div>
                    <div style={{ display: 'flex', padding: '6px 16px', borderRadius: '50px', border: `1px solid ${accent}30`, color: accent, fontSize: 13, fontWeight: 600, letterSpacing: '1px' }}>
                        {t.tag}
                    </div>
                </div>

                {/* CENTER CONTENT */}
                <div style={{ display: 'flex', flexDirection: 'column', zIndex: 10, marginTop: '-20px' }}>
                    <div style={{
                        display: 'flex',
                        fontSize: 140, fontWeight: 800, lineHeight: 1, letterSpacing: '-6px', marginBottom: '16px', color: 'transparent', backgroundImage: 'linear-gradient(180deg, #fff 0%, #777 100%)', backgroundClip: 'text',
                    }}>
                        {t.title}
                    </div>

                    <div style={{ display: 'flex', fontSize: 30, color: '#999', maxWidth: '800px', lineHeight: 1.4, marginBottom: '32px' }}>
                        {t.subtitle}
                    </div>

                    {/* REFINED COMPACT BUTTON - Removed width: fit-content */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        alignSelf: 'flex-start', // This makes the button only as wide as its content
                        gap: '8px',
                        backgroundColor: accent,
                        padding: '10px 22px',
                        borderRadius: '8px',
                        color: '#000',
                        fontSize: 16,
                        fontWeight: 700,
                        boxShadow: `0 4px 15px ${accent}30`,
                    }}>
                        <span style={{ display: 'flex' }}>{t.cta}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'flex' }}>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', width: '48px', height: '48px', borderRadius: '50%', border: `1.5px solid ${accent}`, alignItems: 'center', justifyContent: 'center', color: accent, fontWeight: 700, fontSize: 18 }}>IO</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>Idir Ouhab Meskine</span>
                            <span style={{ color: '#555', fontSize: 14 }}>{t.role}</span>
                        </div>
                    </div>

                    {/* GRAPHIC */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {[20, 40, 25, 50, 30].map((h, i) => (
                            <div key={i} style={{ display: 'flex', width: '6px', height: `${h}px`, background: i === 4 ? accent : '#222', borderRadius: '3px' }} />
                        ))}
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [{ name: 'Poppins', data: fontData, style: 'normal', weight: 600 }],
        }
    );
}
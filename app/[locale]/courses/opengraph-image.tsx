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

    // --- LOCALIZATION CONFIGURATION ---
    const content = {
        en: {
            tag: 'Premium AI & Automation',
            title: 'COURSES',
            subtitle: 'Master practical AI, workflows, and engineering.',
            role: 'Solutions Engineer',
        },
        es: {
            tag: 'IA y Automatización Premium',
            title: 'CURSOS',
            subtitle: 'Domina la IA práctica, flujos de trabajo e ingeniería.',
            role: 'Ingeniero de Soluciones',
        },
    };

    const lang = locale === 'es' ? 'es' : 'en';
    const t = content[lang];

    const accent = '#11b981'; // Brand Green
    const secondAccent = '#5500ff'; // Course Purple

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
                <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '700px', height: '700px', background: `${accent}15`, filter: 'blur(120px)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '700px', height: '700px', background: `${secondAccent}15`, filter: 'blur(120px)', borderRadius: '50%' }} />

                {/* --- TOP SECTION --- */}
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
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }}>
                        {t.tag}
                    </div>
                </div>

                {/* --- CENTER SECTION --- */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', zIndex: 10 }}>
                    <div style={{
                        fontSize: 160, // Large for impact
                        fontWeight: 800,
                        lineHeight: 0.9,
                        letterSpacing: '-8px',
                        marginBottom: '20px',
                        color: 'transparent',
                        backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #999999 100%)',
                        backgroundClip: 'text',
                    }}>
                        {t.title}
                    </div>
                    <div style={{
                        fontSize: 36,
                        color: '#a3a3a3',
                        maxWidth: '850px',
                        lineHeight: 1.4,
                        fontWeight: 500
                    }}>
                        {t.subtitle}
                    </div>
                </div>

                {/* --- BOTTOM SECTION --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', zIndex: 10 }}>
                    {/* Author Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: '#1a1a1a',
                            border: `2px solid ${accent}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: accent,
                            fontWeight: 700,
                            fontSize: 22
                        }}>IO</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: 22 }}>Idir Ouhab Meskine</span>
                            <span style={{ color: '#666', fontSize: 16 }}>{t.role}</span>
                        </div>
                    </div>

                    {/* Progress / Tech Graphic */}
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
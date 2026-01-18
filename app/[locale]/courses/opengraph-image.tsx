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

    // --- LOCALIZATION CONFIGURATION (UPDATED FOR COURSES) ---
    const content = {
        en: {
            tag: 'Premium AI & Automation', // Updated Tag
            title: 'COURSES', // Updated Title
            subtitle: 'Master practical AI, workflows, and engineering.', // Updated Subtitle
            role: 'Solutions Engineer',
        },
        es: {
            tag: 'IA y Automatización Premium', // Updated Tag
            title: 'CURSOS', // Updated Title
            subtitle: 'Domina la IA práctica, flujos de trabajo e ingeniería.', // Updated Subtitle
            role: 'Ingeniero de Soluciones',
        },
    };

    // Default to English if locale isn't 'es'
    const lang = locale === 'es' ? 'es' : 'en';
    const t = content[lang];

    const accent = '#11b981'; // Brand Green

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000000',
                    backgroundImage: 'radial-gradient(circle at 50% 0%, #111 0%, #000 70%)',
                    position: 'relative',
                    fontFamily: 'Poppins',
                }}
            >
                {/* --- BACKGROUND GRID --- */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        opacity: 0.2,
                    }}
                />

                {/* --- BACKGROUND GLOWS --- */}
                <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: `${accent}20`, filter: 'blur(100px)', borderRadius: '50%' }} />
                {/* Changed bottom glow to a slightly warmer purple/blue for courses vibe, optional */}
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: '#5500ff20', filter: 'blur(100px)', borderRadius: '50%' }} />

                {/* --- THE CARD --- */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        width: '1080px',
                        height: '510px',
                        border: '1px solid #333',
                        borderRadius: '24px',
                        background: 'rgba(20, 20, 20, 0.6)',
                        padding: '60px',
                        position: 'relative',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Top Row: Brand & Tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-1px' }}>
                            idir<span style={{ color: accent }}>.ai</span>
                        </div>

                        <div style={{
                            padding: '8px 20px',
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

                    {/* Center: Main Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                        <div style={{
                            fontSize: 130, // Slightly larger font for shorter word "COURSES"
                            fontWeight: 800,
                            lineHeight: 0.9,
                            letterSpacing: '-4px',
                            marginBottom: '20px',
                            color: 'transparent',
                            backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #888888 100%)',
                            backgroundClip: 'text',
                        }}>
                            {t.title}
                        </div>
                        <div style={{
                            fontSize: 32,
                            color: '#a3a3a3',
                            maxWidth: '700px', // Widen slightly for longer subtitle
                            lineHeight: 1.4
                        }}>
                            {t.subtitle}
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                        {/* Author Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontWeight: 700, fontSize: 18 }}>IO</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>Idir Ouhab Meskine</span>
                                <span style={{ color: '#666', fontSize: 14 }}>{t.role}</span>
                            </div>
                        </div>

                        {/* Tech Graphic (Kept the same bars for consistency as "progress bars") */}
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                            {[1,2,3,4,5].map((_, i) => (
                                <div key={i} style={{
                                    width: '8px',
                                    height: `${20 + Math.random() * 30}px`,
                                    background: i === 4 ? accent : '#333',
                                    borderRadius: '4px'
                                }} />
                            ))}
                        </div>
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
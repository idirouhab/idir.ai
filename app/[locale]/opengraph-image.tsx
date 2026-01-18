import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

export const runtime = 'edge';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });

    // Load font
    const fontData = await fetch(
        new URL('../../public/fonts/Poppins-SemiBold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    const accent = '#11b981'; // Brand Green

    // Content setup
    const name = "Idir Ouhab Meskine";
    const role = t('structuredData.jobTitle');
    const offering = t('hero.offeringShort');
    const badges = [
        { id: '01', val: t('hero.badge1') },
        { id: '02', val: t('hero.badge2') },
        { id: '03', val: t('hero.badge3') }
    ];

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
                <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '700px', height: '700px', background: `${accent}15`, filter: 'blur(120px)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '700px', height: '700px', background: '#0055ff15', filter: 'blur(120px)', borderRadius: '50%' }} />

                {/* --- TOP ROW: Brand & Offering --- */}
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
                        {offering}
                    </div>
                </div>

                {/* --- CENTER SECTION: Name & Role --- */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', zIndex: 10 }}>
                    <div style={{
                        fontSize: 120, // Increased for full screen
                        fontWeight: 800,
                        lineHeight: 1,
                        letterSpacing: '-6px',
                        marginBottom: '10px',
                        backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #999999 100%)',
                        backgroundClip: 'text',
                        color: 'transparent',
                    }}>
                        {name}
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 40, // Increased for visibility
                        color: '#a3a3a3',
                        maxWidth: '900px',
                        lineHeight: 1.4,
                        gap: '16px'
                    }}>
                        {role} <span style={{ color: accent }}>@ n8n</span>
                    </div>
                </div>

                {/* --- BOTTOM ROW: Badges & Tech --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', zIndex: 10 }}>

                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '80px' }}>
                        {badges.map((item, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: 14, color: accent, fontWeight: 700, marginBottom: '6px', letterSpacing: '2px' }}>{item.id}</div>
                                <div style={{ fontSize: 28, color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.val}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tech Graphic */}
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
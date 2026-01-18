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

    // Content setup based on your existing home page data
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
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: '#0055ff20', filter: 'blur(100px)', borderRadius: '50%' }} />

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
                    {/* Top Row: Brand & Offiering */}
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
                            fontSize: 14,
                            fontWeight: 600,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            maxWidth: '400px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex', // Added flex just in case offering text is complex
                            alignItems: 'center'
                        }}>
                            {offering}
                        </div>
                    </div>

                    {/* Center: Main Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                        <div style={{
                            fontSize: 100,
                            fontWeight: 800,
                            lineHeight: 0.9,
                            letterSpacing: '-4px',
                            marginBottom: '20px',
                            // Gradients work best in display:flex containers
                            backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #888888 100%)',
                            backgroundClip: 'text',
                            color: 'transparent',
                        }}>
                            {name}
                        </div>

                        {/* --- FIX APPLIED HERE --- */}
                        {/* This div contained text + span, so it NEEDED display: flex */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 32,
                            color: '#a3a3a3',
                            maxWidth: '900px',
                            lineHeight: 1.4,
                            gap: '12px' // Using gap instead of space character for Flexbox
                        }}>
                            {role} <span style={{ color: accent }}>@ n8n</span>
                        </div>
                    </div>

                    {/* Bottom Row: Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>

                        {/* Badges Container */}
                        <div style={{ display: 'flex', gap: '60px' }}>
                            {badges.map((item, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: 12, color: accent, fontWeight: 700, marginBottom: '4px', letterSpacing: '2px' }}>{item.id}</div>
                                    <div style={{ fontSize: 24, color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.val}</div>
                                </div>
                            ))}
                        </div>

                        {/* Tech Graphic */}
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
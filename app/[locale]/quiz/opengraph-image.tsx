import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Scan to Play - AI Quiz Challenge';
export const size = {
    width: 1200,
    height: 630,
};

function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const fontData = await fetch(
        new URL('../../../public/fonts/Poppins-SemiBold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    const qrRes = await fetch('http://idir.ai/qr.png', { cache: 'force-cache' });
    if (!qrRes.ok) throw new Error(`QR load failed`);
    const qrBuffer = await qrRes.arrayBuffer();
    const qrBase64 = arrayBufferToBase64(qrBuffer);
    const qrDataUrl = `data:image/png;base64,${qrBase64}`;

    const accent = '#11b981';
    const secondAccent = '#0055ff';

    const title = locale === 'es' ? 'QUIZ IA' : 'AI QUIZ';
    const instruction = locale === 'es' ? 'ESCANEA PARA JUGAR' : 'SCAN TO PLAY';
    const tag = locale === 'es' ? 'Desafío Interactivo' : 'Interactive Challenge';
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

                {/* --- CENTER SECTION: Perfect Alignment --- */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flex: 1, zIndex: 10 }}>

                    {/* Left side: Typography */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{
                            fontSize: 140,
                            fontWeight: 800,
                            lineHeight: 0.9,
                            letterSpacing: '-8px',
                            color: 'transparent',
                            backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #999999 100%)',
                            backgroundClip: 'text',
                        }}>
                            {title}
                        </div>
                        <div style={{ fontSize: 28, color: '#666', marginTop: '10px', letterSpacing: '1px' }}>
                            {locale === 'es' ? 'Pon a prueba tus conocimientos' : 'Test your knowledge now'}
                        </div>
                    </div>

                    {/* Right side: QR & Instruction Stack */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        {/* Instruction is now centered above the QR */}
                        <div style={{
                            color: accent,
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: '4px',
                            textTransform: 'uppercase',
                            opacity: 0.9
                        }}>
                            {instruction}
                        </div>

                        <div style={{ display: 'flex', position: 'relative', padding: '16px' }}>
                            {/* Brackets */}
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: `4px solid ${accent}`, borderLeft: `4px solid ${accent}` }} />
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderTop: `4px solid ${accent}`, borderRight: `4px solid ${accent}` }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px', borderBottom: `4px solid ${accent}`, borderLeft: `4px solid ${accent}` }} />
                            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: `4px solid ${accent}`, borderRight: `4px solid ${accent}` }} />

                            <img
                                src={qrDataUrl}
                                width="220"
                                height="220"
                                alt=''
                                style={{
                                    display: 'flex',
                                    borderRadius: '8px',
                                    background: '#fff',
                                    padding: '8px'
                                }}
                            />
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
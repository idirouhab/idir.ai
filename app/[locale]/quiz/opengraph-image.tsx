import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Scan to Play - AI Quiz Challenge';
export const size = {
    width: 1200,
    height: 630,
};

// ✅ Edge-safe base64 helper
function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}

export default async function Image({
                                        params,
                                    }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // 1. Load Local Font (✅ correct)
    const fontData = await fetch(
        new URL('../../../public/fonts/Poppins-SemiBold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    const qrRes = await fetch('http://idir.ai/qr.png', {
        // Optional but recommended: prevent caching issues for OG builds
        cache: 'force-cache',
    });

    if (!qrRes.ok) {
        throw new Error(`Failed to load QR image: ${qrRes.status} ${qrRes.statusText}`);
    }

    const qrBuffer = await qrRes.arrayBuffer();
    const qrBase64 = arrayBufferToBase64(qrBuffer);
    const qrDataUrl = `data:image/png;base64,${qrBase64}`;

    const title = locale === 'es' ? 'QUIZ IA' : 'AI QUIZ';
    const instruction = locale === 'es' ? 'ESCANEA PARA JUGAR' : 'SCAN TO PLAY';

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
                    backgroundColor: '#000000',
                    position: 'relative',
                    fontFamily: 'Poppins',
                }}
            >
                {/* --- BRANDING --- */}
                <div style={{ display: 'flex', position: 'absolute', top: '50px' }}>
                    <span style={{ color: 'white', fontSize: '24px' }}>idir</span>
                    <span style={{ color: '#00ff88', fontSize: '24px' }}>.ai</span>
                </div>

                {/* --- CENTRAL SCANNING ZONE --- */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                    }}
                >
                    {/* Viewfinder Brackets */}
                    <div
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            top: '-30px',
                            left: '-30px',
                            width: '60px',
                            height: '60px',
                            borderTop: '4px solid #00ff88',
                            borderLeft: '4px solid #00ff88',
                        }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            top: '-30px',
                            right: '-30px',
                            width: '60px',
                            height: '60px',
                            borderTop: '4px solid #00ff88',
                            borderRight: '4px solid #00ff88',
                        }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            bottom: '-30px',
                            left: '-30px',
                            width: '60px',
                            height: '60px',
                            borderBottom: '4px solid #00ff88',
                            borderLeft: '4px solid #00ff88',
                        }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            bottom: '-30px',
                            right: '-30px',
                            width: '60px',
                            height: '60px',
                            borderBottom: '4px solid #00ff88',
                            borderRight: '4px solid #00ff88',
                        }}
                    />

                    {/* ✅ QR as Data URL (works in next/og) */}
                    <img
                        src={qrDataUrl}
                        width="280"
                        height="280"
                        style={{ display: 'flex' }}
                    />
                </div>

                {/* --- TEXT CONTENT --- */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginTop: '60px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            color: 'white',
                            fontSize: '90px',
                            letterSpacing: '-4px',
                            lineHeight: 1,
                            marginBottom: '10px',
                        }}
                    >
                        {title}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            color: '#00ff88',
                            fontSize: '18px',
                            letterSpacing: '8px',
                            textTransform: 'uppercase',
                        }}
                    >
                        {instruction}
                    </div>
                </div>

                {/* Bottom decorative idir.ai dots */}
                <div
                    style={{
                        display: 'flex',
                        position: 'absolute',
                        bottom: '40px',
                        gap: '8px',
                        opacity: 0.4,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#00ff88',
                        }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#333',
                        }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#333',
                        }}
                    />
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
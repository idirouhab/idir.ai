import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function getCertificateData(certificateId: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/certificates/verify/${certificateId}`, {
            cache: 'no-store',
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.found ? data : null;
    } catch (error) {
        console.error('[OG Image] Failed to fetch certificate:', error);
        return null;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ certificateId: string }> }
) {
    try {
        const { certificateId } = await params;
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get('locale') || 'en';

        const certData = await getCertificateData(certificateId);

        // Colores y textos de estado
        let statusColor = '#10b981';
        let statusText = locale === 'es' ? 'VÁLIDO' : 'VALID';

        if (certData) {
            if (certData.status === 'revoked') {
                statusColor = '#ef4444';
                statusText = locale === 'es' ? 'REVOCADO' : 'REVOKED';
            } else if (certData.status === 'reissued') {
                statusColor = '#f59e0b';
                statusText = locale === 'es' ? 'REEMITIDO' : 'REISSUED';
            }
        }

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
                        backgroundColor: '#050505',
                        backgroundImage: 'radial-gradient(circle at 50% 50%, #111827 0%, #050505 100%)',
                        fontFamily: 'sans-serif',
                        padding: '80px',
                        position: 'relative',
                    }}
                >
                    {/* Resplandor de fondo dinámico según el estado */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '20%',
                            left: '25%',
                            width: '600px',
                            height: '400px',
                            background: statusColor,
                            filter: 'blur(150px)',
                            opacity: 0.12,
                            borderRadius: '100%',
                        }}
                    />

                    {/* Header con Logo y Badge */}
                    <div style={{
                        position: 'absolute',
                        top: 60,
                        left: 80,
                        right: 80,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '87%'
                    }}>
                        <div style={{ display: 'flex', fontSize: 34, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
                            idir<span style={{ color: '#10b981' }}>.ai</span>
                        </div>
                        <div
                            style={{
                                background: `${statusColor}15`,
                                color: statusColor,
                                border: `1px solid ${statusColor}40`,
                                padding: '8px 22px',
                                borderRadius: '100px',
                                fontSize: 18,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                            }}
                        >
                            {certData ? statusText : (locale === 'es' ? 'ERROR' : 'ERROR')}
                        </div>
                    </div>

                    {/* Cuerpo del Certificado */}
                    {!certData ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: 70, fontWeight: 900, color: 'white' }}>
                                {locale === 'es' ? 'CERTIFICADO' : 'CERTIFICATE'}
                            </div>
                            <div style={{ fontSize: 70, fontWeight: 900, color: '#ef4444' }}>
                                {locale === 'es' ? 'NO ENCONTRADO' : 'NOT FOUND'}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 30 }}>
                            <div style={{
                                fontSize: 22,
                                color: '#9ca3af',
                                marginBottom: 15,
                                textTransform: 'uppercase',
                                letterSpacing: '5px',
                                fontWeight: 500
                            }}>
                                {locale === 'es' ? 'Certificado otorgado a' : 'Certificate awarded to'}
                            </div>

                            <div style={{
                                fontSize: 88,
                                fontWeight: 900,
                                color: 'white',
                                textAlign: 'center',
                                lineHeight: 1,
                                marginBottom: 25,
                                padding: '0 40px'
                            }}>
                                {certData.student_name}
                            </div>

                            <div style={{
                                fontSize: 40,
                                fontWeight: 600,
                                color: '#10b981',
                                textAlign: 'center',
                                maxWidth: '900px',
                                opacity: 0.95
                            }}>
                                {certData.course_title}
                            </div>
                        </div>
                    )}

                    {/* Footer con ID y detalle */}
                    <div style={{
                        position: 'absolute',
                        bottom: 60,
                        left: 80,
                        right: 80,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid #ffffff15',
                        paddingTop: '35px',
                        color: '#6b7280',
                        fontSize: 18,
                        fontFamily: 'monospace'
                    }}>
                        <div style={{ display: 'flex' }}>
                            <span style={{ color: '#4b5563', marginRight: 8 }}>ID:</span>
                            {certData ? certData.certificate_id : '------------------'}
                        </div>
                        <div style={{
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#4b5563'
                        }}>
                            {locale === 'es' ? 'Verificación Oficial' : 'Official Verification'}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (error) {
        console.error('[OG Image] Error generating image:', error);
        return new Response('Failed to generate image', { status: 500 });
    }
}
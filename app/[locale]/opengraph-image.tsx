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

    const fontData = await fetch(
        new URL('../../public/fonts/Poppins-SemiBold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'radial-gradient(circle at 50% 30%, #111111 0%, #000000 80%)',
                    backgroundColor: '#000000',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between', // Distribuye el espacio verticalmente
                    fontFamily: 'Poppins',
                    padding: '60px', // Reducido el padding vertical
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* --- CAPA DE TEXTURA DE FONDO --- */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(rgba(17, 185, 129, 0.5) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                }} />

                {/* --- ACENTO DE LUZ INFERIOR --- */}
                <div style={{
                    position: 'absolute',
                    bottom: '-100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '800px',
                    height: '300px',
                    background: 'radial-gradient(ellipse at center, rgba(17, 185, 129, 0.15) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }} />

                {/* --- MARCO TÉCNICO LATERAL --- */}
                <div style={{ position: 'absolute', top: 0, left: '70px', bottom: 0, width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(17, 185, 129, 0.2), transparent)', display: 'flex' }} />
                <div style={{ position: 'absolute', top: 0, right: '70px', bottom: 0, width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(17, 185, 129, 0.2), transparent)', display: 'flex' }} />

                {/* --- HEADER CENTRADO --- */}
                <div style={{ display: 'flex', zIndex: 10, width: '100%', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#fff', letterSpacing: '-1px' }}>
                        idir<span style={{ color: '#11b981' }}>.ai</span>
                    </div>
                </div>

                {/* --- CONTENIDO PRINCIPAL CENTRADO --- */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    zIndex: 10,
                    marginTop: '-20px' // Sube ligeramente el bloque central
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: 100, // Reducido ligeramente el tamaño del nombre
                        fontWeight: 800,
                        color: '#ffffff',
                        letterSpacing: '-5px',
                        lineHeight: 0.9,
                        textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        <span style={{ display: 'flex' }}>Idir Ouhab</span>
                        <span style={{ display: 'flex' }}>Meskine</span>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginTop: '30px',
                        paddingTop: '25px',
                        background: 'linear-gradient(90deg, transparent, rgba(17, 185, 129, 0.5), transparent)',
                        height: '1px',
                        width: '600px'
                    }} />

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginTop: '25px',
                        width: 'auto',
                        minWidth: '600px'
                    }}>
                        <div style={{ display: 'flex', fontSize: 26, color: '#e5e5e5', fontWeight: 400, lineHeight: 1.4 }}>
                            {t('structuredData.jobTitle')} <span style={{ color: '#11b981', fontWeight: 600, margin: '0 8px' }}>@ n8n</span>
                        </div>
                        <div style={{ display: 'flex', fontSize: 15, color: '#888', marginTop: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            {t('hero.offering')}
                        </div>
                    </div>
                </div>

                {/* --- FOOTER CENTRADO --- */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    zIndex: 10,
                    marginBottom: '10px' // Añade un pequeño margen inferior
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '100px',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        width: '100%'
                    }}>
                        {[
                            { id: '01', val: t('hero.badge1') },
                            { id: '02', val: t('hero.badge2') },
                            { id: '03', val: t('hero.badge3') }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ display: 'flex', fontSize: 11, color: '#11b981', fontWeight: 700, marginBottom: '8px', letterSpacing: '2px' }}>{item.id}</div>
                                <div style={{ display: 'flex', fontSize: 20, color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>{item.val}</div>
                            </div>
                        ))}
                    </div>

                    {/* Firma de diseño */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6, marginTop: '35px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <div style={{ width: '3px', height: '3px', background: '#11b981', borderRadius: '50%' }} />
                            <div style={{ width: '3px', height: '3px', background: '#11b981', borderRadius: '50%' }} />
                            <div style={{ width: '3px', height: '3px', background: '#333', borderRadius: '50%' }} />
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
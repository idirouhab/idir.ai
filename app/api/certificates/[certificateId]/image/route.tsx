import { ImageResponse } from 'next/og';
import { getAdminCourseClient } from '@/lib/courses';

export const runtime = 'edge';

// Helper to format slug to title (e.g., "automation-101" -> "Automation 101")
function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;

    // Fetch signup by certificate_id with course details
    const supabase = getAdminCourseClient();

    const { data: signup, error: signupError } = await supabase
      .from('course_signups')
      .select('id, full_name, email, course_slug, completed_at, certificate_id')
      .eq('certificate_id', certificateId)
      .single();

    if (signupError || !signup) {
      return new Response('Certificate not found', { status: 404 });
    }

    // Fetch course details (optional - fallback to slug if not found)
    const { data: course } = await supabase
      .from('courses')
      .select('title, slug')
      .eq('slug', signup.course_slug)
      .single();

    // Format student name
    const studentName = signup.full_name;

    // Use course title if available, otherwise format the slug
    const courseTitle = course?.title || formatSlugToTitle(signup.course_slug);

    // Format completion date in Spanish
    const completionDate = signup.completed_at
      ? new Date(signup.completed_at).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'N/A';

    // Format certificate ID for display
    const displayCertId = `CERT-${certificateId.substring(0, 8).toUpperCase()}`;

    // Fetch and convert signature to base64 data URL
    const signatureUrl = process.env.NEXT_PUBLIC_INSTRUCTOR_SIGNATURE_URL;
    let signatureDataUrl: string | null = null;

    if (signatureUrl) {
      try {
        const response = await fetch(signatureUrl);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(arrayBuffer))
        );
        signatureDataUrl = `data:image/png;base64,${base64}`;
      } catch (err) {
        console.error('Failed to load signature:', err);
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
            background: '#ffffff',
            position: 'relative',
            padding: '120px 160px',
          }}
        >
          {/* Elegant Border Frame */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              right: '40px',
              bottom: '40px',
              border: '3px solid #1e3a8a',
              borderRadius: '8px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50px',
              left: '50px',
              right: '50px',
              bottom: '50px',
              border: '1px solid #d4af37',
              borderRadius: '6px',
            }}
          />

          {/* Top Accent */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #1e3a8a 100%)',
            }}
          />

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              width: '100%',
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: '68px',
                fontWeight: 700,
                letterSpacing: '3px',
                color: '#1e3a8a',
                marginBottom: '40px',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              CERTIFICADO DE FINALIZACIÓN
            </div>

            {/* Motivational Badge */}
            <div
              style={{
                display: 'flex',
                padding: '10px 26px',
                background: '#d4af37',
                borderRadius: '4px',
                fontSize: '18px',
                fontWeight: 700,
                color: '#1f2937',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '50px',
              }}
            >
              Enhorabuena por tu dedicación
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: '28px',
                fontWeight: 400,
                color: '#4b5563',
                marginBottom: '30px',
                display: 'flex',
              }}
            >
              Se otorga el presente certificado a
            </div>

            {/* Student Name */}
            <div
              style={{
                fontSize: '86px',
                fontWeight: 700,
                letterSpacing: '1px',
                color: '#1e3a8a',
                marginBottom: '35px',
                display: 'flex',
                borderBottom: '3px solid #d4af37',
                paddingBottom: '15px',
              }}
            >
              {studentName}
            </div>

            {/* Praise Text */}
            <div
              style={{
                fontSize: '26px',
                fontWeight: 400,
                color: '#4b5563',
                marginBottom: '15px',
                display: 'flex',
                textAlign: 'center',
                maxWidth: '900px',
              }}
            >
              por completar con éxito y demostrar compromiso excepcional en
            </div>

            <div
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: '#2563eb',
                marginBottom: '35px',
                display: 'flex',
              }}
            >
              {courseTitle}
            </div>

            {/* Additional Praise */}
            <div
              style={{
                fontSize: '22px',
                fontWeight: 400,
                color: '#6b7280',
                fontStyle: 'italic',
                marginBottom: '50px',
                display: 'flex',
                textAlign: 'center',
                maxWidth: '800px',
              }}
            >
              Tu esfuerzo y perseverancia son ejemplares. Este logro refleja tu capacidad para aprender y crecer.
            </div>

            {/* Metadata Row */}
            <div
              style={{
                display: 'flex',
                gap: '80px',
                marginBottom: '60px',
                fontSize: '20px',
                color: '#4b5563',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ color: '#1e3a8a', fontWeight: 600, marginBottom: '8px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Fecha de Finalización
                </div>
                <div style={{ color: '#1f2937', fontWeight: 500 }}>{completionDate}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ color: '#1e3a8a', fontWeight: 600, marginBottom: '8px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  ID del Certificado
                </div>
                <div style={{ fontFamily: 'monospace', color: '#6b7280', fontSize: '18px' }}>{displayCertId}</div>
              </div>
            </div>

            {/* Signature Section */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '60px',
              }}
            >
              {signatureDataUrl && (
                <img
                  src={signatureDataUrl}
                  alt="Signature"
                  width="300"
                  height="180"
                  style={{
                    marginBottom: '20px',
                  }}
                />
              )}
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: 700,
                  color: '#1e3a8a',
                  marginBottom: '8px',
                  display: 'flex',
                }}
              >
                Idir Ouhab Meskine
              </div>
              <div
                style={{
                  fontSize: '20px',
                  color: '#6b7280',
                  display: 'flex',
                  fontWeight: 500,
                }}
              >
                Instructor
              </div>
            </div>
          </div>

          {/* Bottom branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              right: '80px',
              fontSize: '38px',
              fontWeight: 700,
              color: '#1e3a8a',
              letterSpacing: '1px',
              display: 'flex',
            }}
          >
            idir.ai
          </div>

          {/* Bottom Accent */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #1e3a8a 100%)',
            }}
          />
        </div>
      ),
      {
        width: 2000,
        height: 1414,
      }
    );
  } catch (e: any) {
    console.error('Certificate generation error:', e.message);
    return new Response(`Failed to generate certificate: ${e.message}`, {
      status: 500,
    });
  }
}

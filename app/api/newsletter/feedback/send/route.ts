import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { generateFeedbackToken } from '@/lib/feedback-token';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Send feedback survey to subscribers
 * POST /api/newsletter/feedback/send
 * Body: {
 *   testEmail?: string,  // If provided, only sends to this email for testing
 *   selectedEmails?: string[],  // If provided, only sends to these emails
 *   lang?: 'en' | 'es' | 'all',  // Language filter (only used if no selectedEmails)
 *   campaignDate?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionCookie = cookies().get('admin-session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const testEmail = body.testEmail;
    const selectedEmails = body.selectedEmails || [];
    const lang = body.lang || 'all';
    const campaignDate = body.campaignDate || new Date().toISOString().split('T')[0];

    const supabase = createClient(supabaseUrl, supabaseKey);

    let subscribers;

    // Test mode: send to a single test email
    if (testEmail) {
      // For test email, we'll use 'en' as default language
      subscribers = [{ email: testEmail, lang: 'en' }];
    }
    // Selected subscribers mode
    else if (selectedEmails.length > 0) {
      const { data, error: fetchError } = await supabase
        .from('newsletter_subscribers')
        .select('email, lang')
        .eq('is_subscribed', true)
        .in('email', selectedEmails);

      if (fetchError) {
        console.error('Error fetching selected subscribers:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch subscribers' },
          { status: 500 }
        );
      }

      subscribers = data;
    }
    // All subscribers with optional language filter
    else {
      let subscribersQuery = supabase
        .from('newsletter_subscribers')
        .select('email, lang')
        .eq('is_subscribed', true);

      if (lang !== 'all') {
        subscribersQuery = subscribersQuery.eq('lang', lang);
      }

      const { data, error: fetchError } = await subscribersQuery;

      if (fetchError) {
        console.error('Error fetching subscribers:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch subscribers' },
          { status: 500 }
        );
      }

      subscribers = data;
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No subscribers found' },
        { status: 404 }
      );
    }

    // Initialize Mailgun client
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY || '',
      url: process.env.MAILGUN_API_URL || 'https://api.mailgun.net',
    });

    const mailgunDomain = process.env.MAILGUN_DOMAIN || 'idir.ai';

    // Send emails to all subscribers
    const results = {
      total: subscribers.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const subscriber of subscribers) {
      try {
        // Generate feedback token
        const token = await generateFeedbackToken({
          email: subscriber.email,
          campaignDate: campaignDate,
        });

        // Prepare email content based on language
        const isSpanish = subscriber.lang === 'es';

        const subject = isSpanish
          ? 'Calibra tu señal de contenido'
          : 'Calibrate your content signal';

        const title = isSpanish
          ? 'NOTICIAS IA <span style="color: #00ff88;">DIARIAS</span>'
          : 'AI NEWS <span style="color: #00ff88;">DAILY</span>';

        const systemStatusLabel = isSpanish
          ? 'ESTADO DEL SISTEMA'
          : 'SYSTEM STATUS';

        const systemStatusOnline = isSpanish
          ? '⬤ EN LÍNEA'
          : '⬤ ONLINE';

        const terminalLine1 = isSpanish
          ? '> INICIANDO PROTOCOLO DE CALIBRACIÓN...'
          : '> INITIALIZING CALIBRATION PROTOCOL...';

        const terminalLine2 = isSpanish
          ? '> ESTADO: REQUIERE INPUT DEL USUARIO'
          : '> STATUS: REQUIRES USER INPUT';

        const introText = isSpanish
          ? 'Detectamos que has estado recibiendo el feed por un tiempo. <strong>Necesito calibrar la señal</strong> para optimizar el contenido que llega a tu bandeja.'
          : 'We detected you\'ve been receiving the feed for a while. <strong>I need to calibrate the signal</strong> to optimize the content reaching your inbox.';

        const calibrationModuleLabel = isSpanish
          ? '[ MÓDULO DE CALIBRACIÓN DE SEÑAL ]'
          : '[ SIGNAL CALIBRATION MODULE ]';

        const question = isSpanish
          ? '¿Qué intensidad de señal estás recibiendo?'
          : 'What signal strength are you receiving?';

        // Signal options
        const strongSignal = isSpanish
          ? { label: 'Señal Fuerte 😍', subtext: 'Leo casi todo, aprendo cosas nuevas constantemente' }
          : { label: 'Strong Signal 😍', subtext: 'I read almost everything, constantly learning new things' };

        const mediumSignal = isSpanish
          ? { label: 'Señal Media 👍', subtext: 'Leo algunos, encuentro valor de vez en cuando' }
          : { label: 'Medium Signal 👍', subtext: 'I read some, find value from time to time' };

        const weakSignal = isSpanish
          ? { label: 'Señal Débil 👎', subtext: 'Casi no los leo, poco valor para mí' }
          : { label: 'Weak Signal 👎', subtext: 'I barely read them, little value for me' };

        const footerMessage = isSpanish
          ? '→ Tu input = Mejor contenido'
          : '→ Your input = Better content';

        const footerSubtext = isSpanish
          ? '¿Ideas para optimizar? <a href="mailto:contact@idir.ai" style="color: #00cfff; text-decoration: none; font-weight: 700;">Envía tu feedback aquí</a>'
          : 'Ideas to optimize? <a href="mailto:contact@idir.ai" style="color: #00cfff; text-decoration: none; font-weight: 700;">Send your feedback here</a>';

        const footerText = isSpanish
          ? 'Recibes este correo porque te suscribiste a Noticias IA Diarias.'
          : 'You receive this email because you subscribed to AI News Daily.';

        const websiteText = isSpanish ? 'Sitio Web' : 'Website';
        const unsubscribeText = isSpanish ? 'Cancelar suscripción' : 'Unsubscribe';

        // HTML email template matching newsletter design
        const htmlContent = `
<!DOCTYPE html>
<html lang="${isSpanish ? 'es' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
        <td style="padding: 20px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #000000; border: 2px solid #00ff88;">

                <!-- Header -->
                <tr>
                    <td style="padding: 30px 30px 20px 30px; background-color: #000000;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="text-align: center; padding-bottom: 10px;">
                                    <div style="display: inline-block; position: relative;">
                                        <div style="position: absolute; top: -5px; left: -5px; width: 8px; height: 8px; background-color: #00ff88;"></div>
                                        <div style="position: absolute; top: -5px; right: -5px; width: 8px; height: 8px; background-color: #ff0055;"></div>
                                        <h1 style="margin: 0; padding: 15px 30px; color: #ffffff; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border: 1px solid #333333;">
                                            ${title}
                                        </h1>
                                        <div style="position: absolute; bottom: -5px; left: -5px; width: 8px; height: 8px; background-color: #ff0055;"></div>
                                        <div style="position: absolute; bottom: -5px; right: -5px; width: 8px; height: 8px; background-color: #00ff88;"></div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: center; padding-top: 10px;">
                                    <div style="height: 2px; width: 60px; background: linear-gradient(90deg, #00ff88, #ff0055); margin: 0 auto;"></div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- System Status -->
                <tr>
                    <td style="padding: 0 30px 20px 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border: 1px solid #222222;">
                            <tr>
                                <td style="padding: 12px 20px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td style="color: #666666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                                                ${systemStatusLabel}
                                            </td>
                                            <td style="text-align: right; color: #00ff88; font-size: 11px; font-family: 'Courier New', monospace;">
                                                ${systemStatusOnline}
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Calibration Content -->
                <tr>
                    <td style="padding: 0 30px 30px 30px;">

                        <!-- Terminal-style intro -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border-left: 3px solid #00ff88; margin-bottom: 25px;">
                            <tr>
                                <td style="padding: 20px;">
                                    <p style="margin: 0 0 8px 0; color: #00ff88; font-family: 'Courier New', monospace; font-size: 12px;">
                                        ${terminalLine1}
                                    </p>
                                    <p style="margin: 0 0 15px 0; color: #666666; font-family: 'Courier New', monospace; font-size: 12px;">
                                        ${terminalLine2}
                                    </p>
                                    <p style="margin: 0; color: #cccccc; font-size: 14px; line-height: 1.6;">
                                        ${introText}
                                    </p>
                                </td>
                            </tr>
                        </table>

                        <!-- Calibration Interface -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #000000; border: 2px solid #333333; margin-bottom: 25px;">
                            <tr>
                                <td style="padding: 30px 25px;">

                                    <!-- Title -->
                                    <div style="text-align: center; margin-bottom: 25px;">
                                        <p style="margin: 0 0 8px 0; color: #00ff88; font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 2px;">
                                            ${calibrationModuleLabel}
                                        </p>
                                        <h2 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700; line-height: 1.3;">
                                            ${question}
                                        </h2>
                                    </div>

                                    <!-- Signal Meter Visualization -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                                        <tr>
                                            <td style="text-align: center;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                                    <tr>
                                                        <td style="padding: 0 3px; vertical-align: bottom;">
                                                            <div style="width: 20px; height: 15px; background-color: #ff0055;"></div>
                                                        </td>
                                                        <td style="padding: 0 3px; vertical-align: bottom;">
                                                            <div style="width: 20px; height: 30px; background-color: #ff6600;"></div>
                                                        </td>
                                                        <td style="padding: 0 3px; vertical-align: bottom;">
                                                            <div style="width: 20px; height: 45px; background-color: #ffaa00;"></div>
                                                        </td>
                                                        <td style="padding: 0 3px; vertical-align: bottom;">
                                                            <div style="width: 20px; height: 60px; background-color: #00cfff;"></div>
                                                        </td>
                                                        <td style="padding: 0 3px; vertical-align: bottom;">
                                                            <div style="width: 20px; height: 75px; background-color: #00ff88;"></div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Calibration Options -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

                                        <!-- STRONG SIGNAL -->
                                        <tr>
                                            <td style="padding: 8px 0;">
                                                <a href="https://idir.ai/api/newsletter/feedback?token=${token}&type=very_useful" style="display: block; background-color: #0a0a0a; border-left: 4px solid #00ff88; padding: 18px 20px; text-decoration: none;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="width: 100px; vertical-align: top;">
                                                                <div style="font-family: 'Courier New', monospace; color: #00ff88; font-size: 24px; font-weight: 700; line-height: 1;">
                                                                    █████
                                                                </div>
                                                                <div style="font-family: 'Courier New', monospace; color: #00ff88; font-size: 10px; margin-top: 5px;">
                                                                    STRONG
                                                                </div>
                                                            </td>
                                                            <td style="vertical-align: middle;">
                                                                <div style="color: #ffffff; font-size: 15px; font-weight: 700; margin-bottom: 4px;">
                                                                    ${strongSignal.label}
                                                                </div>
                                                                <div style="color: #999999; font-size: 12px; line-height: 1.4;">
                                                                    ${strongSignal.subtext}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </a>
                                            </td>
                                        </tr>

                                        <!-- MEDIUM SIGNAL -->
                                        <tr>
                                            <td style="padding: 8px 0;">
                                                <a href="https://idir.ai/api/newsletter/feedback?token=${token}&type=useful" style="display: block; background-color: #0a0a0a; border-left: 4px solid #00cfff; padding: 18px 20px; text-decoration: none;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="width: 100px; vertical-align: top;">
                                                                <div style="font-family: 'Courier New', monospace; color: #00cfff; font-size: 24px; font-weight: 700; line-height: 1;">
                                                                    ███░░
                                                                </div>
                                                                <div style="font-family: 'Courier New', monospace; color: #00cfff; font-size: 10px; margin-top: 5px;">
                                                                    MEDIUM
                                                                </div>
                                                            </td>
                                                            <td style="vertical-align: middle;">
                                                                <div style="color: #ffffff; font-size: 15px; font-weight: 700; margin-bottom: 4px;">
                                                                    ${mediumSignal.label}
                                                                </div>
                                                                <div style="color: #999999; font-size: 12px; line-height: 1.4;">
                                                                    ${mediumSignal.subtext}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </a>
                                            </td>
                                        </tr>

                                        <!-- WEAK SIGNAL -->
                                        <tr>
                                            <td style="padding: 8px 0;">
                                                <a href="https://idir.ai/api/newsletter/feedback?token=${token}&type=not_useful" style="display: block; background-color: #0a0a0a; border-left: 4px solid #ff0055; padding: 18px 20px; text-decoration: none;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="width: 100px; vertical-align: top;">
                                                                <div style="font-family: 'Courier New', monospace; color: #ff0055; font-size: 24px; font-weight: 700; line-height: 1;">
                                                                    █░░░░
                                                                </div>
                                                                <div style="font-family: 'Courier New', monospace; color: #ff0055; font-size: 10px; margin-top: 5px;">
                                                                    WEAK
                                                                </div>
                                                            </td>
                                                            <td style="vertical-align: middle;">
                                                                <div style="color: #ffffff; font-size: 15px; font-weight: 700; margin-bottom: 4px;">
                                                                    ${weakSignal.label}
                                                                </div>
                                                                <div style="color: #999999; font-size: 12px; line-height: 1.4;">
                                                                    ${weakSignal.subtext}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </a>
                                            </td>
                                        </tr>

                                    </table>

                                </td>
                            </tr>
                        </table>

                        <!-- Footer message -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border: 1px solid #222222;">
                            <tr>
                                <td style="padding: 20px; text-align: center;">
                                    <p style="margin: 0 0 8px 0; color: #00ff88; font-size: 14px; font-weight: 700;">
                                        ${footerMessage}
                                    </p>
                                    <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.5;">
                                        ${footerSubtext}
                                    </p>
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>

                <!-- Divider -->
                <tr>
                    <td style="padding: 0 30px;">
                        <div style="height: 1px; background-color: #222222;"></div>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="padding: 30px; background-color: #000000;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <!-- Signature -->
                            <tr>
                                <td style="text-align: center; padding-bottom: 20px;">
                                    <p style="margin: 0 0 5px 0; color: #00ff88; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                        Idir Ouhab Meskine
                                    </p>
                                    <p style="margin: 0; color: #999999; font-size: 12px;">
                                        Solutions Engineer at n8n
                                    </p>
                                </td>
                            </tr>

                            <!-- Social Links -->
                            <tr>
                                <td style="text-align: center; padding-bottom: 20px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                        <tr>
                                            <td style="padding: 0 10px;">
                                                <a href="https://idir.ai" style="color: #00ff88; text-decoration: none; font-size: 12px; font-weight: 600;">
                                                    ${websiteText}
                                                </a>
                                            </td>
                                            <td style="color: #333333;">|</td>
                                            <td style="padding: 0 10px;">
                                                <a href="https://linkedin.com/in/idirouhab" style="color: #00ff88; text-decoration: none; font-size: 12px; font-weight: 600;">
                                                    LinkedIn
                                                </a>
                                            </td>
                                            <td style="color: #333333;">|</td>
                                            <td style="padding: 0 10px;">
                                                <a href="https://twitter.com/idir_ouhab" style="color: #00ff88; text-decoration: none; font-size: 12px; font-weight: 600;">
                                                    Twitter
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Unsubscribe -->
                            <tr>
                                <td style="text-align: center; padding-top: 20px; border-top: 1px solid #222222;">
                                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 11px; line-height: 1.5;">
                                        ${footerText}
                                    </p>
                                    <p style="margin: 0; color: #666666; font-size: 11px;">
                                        <a href="https://idir.ai/${subscriber.lang}/unsubscribe?email=${encodeURIComponent(subscriber.email)}" style="color: #00ff88; text-decoration: none;">
                                            ${unsubscribeText}
                                        </a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

            </table>
            <!-- End Content Wrapper -->
        </td>
    </tr>
</table>
<!-- End Main Container -->
</body>
</html>
        `;

        // Text version
        const textContent = `
${title.replace(/<[^>]*>/g, '')}

${systemStatusLabel}: ${systemStatusOnline.replace('⬤ ', '')}

---

${terminalLine1}
${terminalLine2}

${introText.replace(/<[^>]*>/g, '')}

---

${calibrationModuleLabel}
${question}

█████ STRONG
${strongSignal.label}
${strongSignal.subtext}
https://idir.ai/api/newsletter/feedback?token=${token}&type=very_useful

███░░ MEDIUM
${mediumSignal.label}
${mediumSignal.subtext}
https://idir.ai/api/newsletter/feedback?token=${token}&type=useful

█░░░░ WEAK
${weakSignal.label}
${weakSignal.subtext}
https://idir.ai/api/newsletter/feedback?token=${token}&type=not_useful

---

${footerMessage}
${footerSubtext.replace(/<[^>]*>/g, '')}

---

Idir Ouhab Meskine
Solutions Engineer at n8n

${websiteText}: https://idir.ai
LinkedIn: https://linkedin.com/in/idirouhab
Twitter: https://twitter.com/idir_ouhab

${footerText}
${unsubscribeText}: https://idir.ai/${subscriber.lang}/unsubscribe?email=${encodeURIComponent(subscriber.email)}
        `;

        // Send email using Mailgun API
        await mg.messages.create(mailgunDomain, {
          from: `Idir from idir.ai <newsletter@idir.ai>`,
          to: [subscriber.email],
          subject: subject,
          text: textContent,
          html: htmlContent,
        });

        results.sent++;
      } catch (error: any) {
        console.error(`Error sending to ${subscriber.email}:`, error);
        results.failed++;
        results.errors.push(`${subscriber.email}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error sending feedback surveys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

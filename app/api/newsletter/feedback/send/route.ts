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
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${subject}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
    <style type="text/css">
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                min-width: 100% !important;
            }
            .mobile-padding {
                padding: 15px !important;
            }
            .mobile-font-small {
                font-size: 11px !important;
            }
            .mobile-font-medium {
                font-size: 14px !important;
            }
            .signal-bar {
                font-size: 18px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
        <td style="padding: 10px;">
            <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px; background-color: #000000; border: 2px solid #00ff88;">

                <!-- Header -->
                <tr>
                    <td class="mobile-padding" style="padding: 30px; background-color: #000000; text-align: center;">
                        <h1 style="margin: 0; padding: 10px 15px; color: #ffffff; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border: 1px solid #333333; display: inline-block;">
                            ${title}
                        </h1>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="text-align: center; padding-top: 15px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                        <tr>
                                            <td style="width: 30px; height: 2px; background-color: #00ff88;"></td>
                                            <td style="width: 30px; height: 2px; background-color: #ff0055;"></td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- System Status -->
                <tr>
                    <td class="mobile-padding" style="padding: 0 30px 20px 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border: 1px solid #222222;">
                            <tr>
                                <td style="padding: 12px 15px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td class="mobile-font-small" style="color: #666666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; width: 50%;">
                                                ${systemStatusLabel}
                                            </td>
                                            <td class="mobile-font-small" style="text-align: right; color: #00ff88; font-size: 10px; font-family: 'Courier New', monospace; width: 50%;">
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
                    <td class="mobile-padding" style="padding: 0 30px 30px 30px;">

                        <!-- Terminal-style intro -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border-left: 3px solid #00ff88;">
                            <tr>
                                <td style="padding: 15px;">
                                    <p class="mobile-font-small" style="margin: 0 0 5px 0; color: #00ff88; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.4;">
                                        ${terminalLine1}
                                    </p>
                                    <p class="mobile-font-small" style="margin: 0 0 12px 0; color: #666666; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.4;">
                                        ${terminalLine2}
                                    </p>
                                    <p class="mobile-font-medium" style="margin: 0; color: #cccccc; font-size: 13px; line-height: 1.5;">
                                        ${introText}
                                    </p>
                                </td>
                            </tr>
                        </table>

                        <!-- Spacing -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="height: 20px; font-size: 1px; line-height: 1px;">&nbsp;</td>
                            </tr>
                        </table>

                        <!-- Calibration Interface -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #000000; border: 2px solid #333333;">
                            <tr>
                                <td style="padding: 20px 15px;">

                                    <!-- Title -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td style="text-align: center; padding-bottom: 20px;">
                                                <p class="mobile-font-small" style="margin: 0 0 8px 0; color: #00ff88; font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 1px;">
                                                    ${calibrationModuleLabel}
                                                </p>
                                                <h2 class="mobile-font-medium" style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 700; line-height: 1.3;">
                                                    ${question}
                                                </h2>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Signal Meter Visualization -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td style="text-align: center; padding-bottom: 25px;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                                    <tr>
                                                        <td style="padding: 0 2px; vertical-align: bottom;">
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                                <tr><td style="width: 15px; height: 12px; background-color: #ff0055; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                                                            </table>
                                                        </td>
                                                        <td style="padding: 0 2px; vertical-align: bottom;">
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                                <tr><td style="width: 15px; height: 25px; background-color: #ff6600; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                                                            </table>
                                                        </td>
                                                        <td style="padding: 0 2px; vertical-align: bottom;">
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                                <tr><td style="width: 15px; height: 38px; background-color: #ffaa00; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                                                            </table>
                                                        </td>
                                                        <td style="padding: 0 2px; vertical-align: bottom;">
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                                <tr><td style="width: 15px; height: 50px; background-color: #00cfff; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                                                            </table>
                                                        </td>
                                                        <td style="padding: 0 2px; vertical-align: bottom;">
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                                <tr><td style="width: 15px; height: 63px; background-color: #00ff88; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                                                            </table>
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
                                            <td style="padding: 0 0 10px 0;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border-left: 4px solid #00ff88;">
                                                    <tr>
                                                        <td style="padding: 15px;">
                                                            <a href="https://idir.ai/api/newsletter/feedback?token=${token}&type=very_useful" style="text-decoration: none; display: block;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 80px; vertical-align: top; padding-right: 10px;">
                                                                            <p class="signal-bar" style="margin: 0 0 3px 0; font-family: 'Courier New', monospace; color: #00ff88; font-size: 20px; font-weight: 700; line-height: 1;">
                                                                                █████
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; font-family: 'Courier New', monospace; color: #00ff88; font-size: 9px;">
                                                                                STRONG
                                                                            </p>
                                                                        </td>
                                                                        <td style="vertical-align: middle;">
                                                                            <p class="mobile-font-medium" style="margin: 0 0 4px 0; color: #ffffff; font-size: 14px; font-weight: 700;">
                                                                                ${strongSignal.label}
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; color: #999999; font-size: 11px; line-height: 1.3;">
                                                                                ${strongSignal.subtext}
                                                                            </p>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>

                                        <!-- MEDIUM SIGNAL -->
                                        <tr>
                                            <td style="padding: 0 0 10px 0;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border-left: 4px solid #00cfff;">
                                                    <tr>
                                                        <td style="padding: 15px;">
                                                            <a href="https://idir.ai/api/newsletter/feedback?token=${token}&type=useful" style="text-decoration: none; display: block;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 80px; vertical-align: top; padding-right: 10px;">
                                                                            <p class="signal-bar" style="margin: 0 0 3px 0; font-family: 'Courier New', monospace; color: #00cfff; font-size: 20px; font-weight: 700; line-height: 1;">
                                                                                ███░░
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; font-family: 'Courier New', monospace; color: #00cfff; font-size: 9px;">
                                                                                MEDIUM
                                                                            </p>
                                                                        </td>
                                                                        <td style="vertical-align: middle;">
                                                                            <p class="mobile-font-medium" style="margin: 0 0 4px 0; color: #ffffff; font-size: 14px; font-weight: 700;">
                                                                                ${mediumSignal.label}
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; color: #999999; font-size: 11px; line-height: 1.3;">
                                                                                ${mediumSignal.subtext}
                                                                            </p>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>

                                        <!-- WEAK SIGNAL -->
                                        <tr>
                                            <td style="padding: 0;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border-left: 4px solid #ff0055;">
                                                    <tr>
                                                        <td style="padding: 15px;">
                                                            <a href="https://idir.ai/api/newsletter/feedback?token=${token}&type=not_useful" style="text-decoration: none; display: block;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 80px; vertical-align: top; padding-right: 10px;">
                                                                            <p class="signal-bar" style="margin: 0 0 3px 0; font-family: 'Courier New', monospace; color: #ff0055; font-size: 20px; font-weight: 700; line-height: 1;">
                                                                                █░░░░
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; font-family: 'Courier New', monospace; color: #ff0055; font-size: 9px;">
                                                                                WEAK
                                                                            </p>
                                                                        </td>
                                                                        <td style="vertical-align: middle;">
                                                                            <p class="mobile-font-medium" style="margin: 0 0 4px 0; color: #ffffff; font-size: 14px; font-weight: 700;">
                                                                                ${weakSignal.label}
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; color: #999999; font-size: 11px; line-height: 1.3;">
                                                                                ${weakSignal.subtext}
                                                                            </p>
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

                                </td>
                            </tr>
                        </table>

                        <!-- Spacing -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="height: 20px; font-size: 1px; line-height: 1px;">&nbsp;</td>
                            </tr>
                        </table>

                        <!-- Footer message -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border: 1px solid #222222;">
                            <tr>
                                <td style="padding: 15px; text-align: center;">
                                    <p class="mobile-font-medium" style="margin: 0 0 8px 0; color: #00ff88; font-size: 13px; font-weight: 700;">
                                        ${footerMessage}
                                    </p>
                                    <p class="mobile-font-small" style="margin: 0; color: #666666; font-size: 11px; line-height: 1.4;">
                                        ${footerSubtext}
                                    </p>
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>

                <!-- Divider -->
                <tr>
                    <td class="mobile-padding" style="padding: 0 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="height: 1px; background-color: #222222; font-size: 1px; line-height: 1px;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td class="mobile-padding" style="padding: 20px; background-color: #000000;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <!-- Signature -->
                            <tr>
                                <td style="text-align: center; padding-bottom: 15px;">
                                    <p class="mobile-font-medium" style="margin: 0 0 5px 0; color: #00ff88; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                        Idir Ouhab Meskine
                                    </p>
                                    <p class="mobile-font-small" style="margin: 0; color: #999999; font-size: 11px;">
                                        Solutions Engineer at n8n
                                    </p>
                                </td>
                            </tr>

                            <!-- Social Links -->
                            <tr>
                                <td style="text-align: center; padding-bottom: 15px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                        <tr>
                                            <td style="padding: 0 8px;">
                                                <a href="https://idir.ai" class="mobile-font-small" style="color: #00ff88; text-decoration: none; font-size: 11px; font-weight: 600;">
                                                    ${websiteText}
                                                </a>
                                            </td>
                                            <td style="color: #333333; font-size: 11px;">|</td>
                                            <td style="padding: 0 8px;">
                                                <a href="https://linkedin.com/in/idirouhab" class="mobile-font-small" style="color: #00ff88; text-decoration: none; font-size: 11px; font-weight: 600;">
                                                    LinkedIn
                                                </a>
                                            </td>
                                            <td style="color: #333333; font-size: 11px;">|</td>
                                            <td style="padding: 0 8px;">
                                                <a href="https://twitter.com/idir_ouhab" class="mobile-font-small" style="color: #00ff88; text-decoration: none; font-size: 11px; font-weight: 600;">
                                                    Twitter
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Unsubscribe -->
                            <tr>
                                <td style="text-align: center; padding-top: 15px; border-top: 1px solid #222222;">
                                    <p class="mobile-font-small" style="margin: 0 0 5px 0; color: #666666; font-size: 10px; line-height: 1.4;">
                                        ${footerText}
                                    </p>
                                    <p class="mobile-font-small" style="margin: 0; color: #666666; font-size: 10px;">
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

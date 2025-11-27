# Mailgun Feedback Survey Template

This document contains the email template for the feedback survey campaign. You need to create **ONE template** in your Mailgun dashboard. All translations are managed in the code and passed as variables.

## Template Setup

### 1. Go to Mailgun Dashboard
1. Navigate to **Sending** > **Templates**
2. Click **Create Template**
3. Template Name: `feedback-survey`
4. Description: `Newsletter feedback calibration survey (multi-language)`

### 2. Template Variables

The template uses these variables (all text content is passed from the API):

```javascript
{
  // System variables
  "token": "feedback_token_here",
  "subscriber_email": "user@example.com",
  "unsubscribe_url": "https://idir.ai/en/unsubscribe?email=user@example.com",

  // Translated text content (all passed from code)
  "title": "AI NEWS <span style=\"color: #00ff88;\">DAILY</span>",
  "systemStatusLabel": "SYSTEM STATUS",
  "systemStatusOnline": "⬤ ONLINE",
  "terminalLine1": "> INITIALIZING CALIBRATION PROTOCOL...",
  "terminalLine2": "> STATUS: REQUIRES USER INPUT",
  "introText": "We detected you've been receiving...",
  "calibrationModuleLabel": "[ SIGNAL CALIBRATION MODULE ]",
  "question": "What signal strength are you receiving?",
  "strongSignalLabel": "Strong Signal 😍",
  "strongSignalSubtext": "I read almost everything...",
  "mediumSignalLabel": "Medium Signal 👍",
  "mediumSignalSubtext": "I read some...",
  "weakSignalLabel": "Weak Signal 👎",
  "weakSignalSubtext": "I barely read them...",
  "footerMessage": "→ Your input = Better content",
  "footerSubtext": "Ideas to optimize? ...",
  "footerText": "You receive this email...",
  "websiteText": "Website",
  "unsubscribeText": "Unsubscribe"
}
```

### 3. Subject Line

The subject is set dynamically in the API (not in template):
- English: "Calibrate your content signal"
- Spanish: "Calibra tu señal de contenido"

### 4. HTML Template

Use the following HTML template. All text uses `{{variables}}` - no conditionals needed:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
    <title>Feedback Survey</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }
        @media only screen and (min-width: 600px) {
            .email-container {
                width: 600px !important;
            }
        }
        @media only screen and (max-width: 599px) {
            .email-container {
                width: 100% !important;
                min-width: 320px !important;
            }
            .mobile-padding {
                padding: 20px !important;
            }
            .mobile-font-small {
                font-size: 12px !important;
            }
            .mobile-font-medium {
                font-size: 15px !important;
            }
            .signal-bar {
                font-size: 20px !important;
            }
            .mobile-hide {
                display: none !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; min-width: 100%;">
    <tr>
        <td align="center" style="padding: 0;">
            <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px; width: 100%; background-color: #000000; border: 2px solid #00ff88;">

                <!-- Header -->
                <tr>
                    <td class="mobile-padding" style="padding: 30px; background-color: #000000; text-align: center;">
                        <h1 style="margin: 0; padding: 12px 20px; color: #ffffff; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border: 1px solid #333333; display: inline-block;">
                            {{#if_eq lang 'es'}}
                            NOTICIAS IA <span style="color: #00ff88;">DIARIAS</span>
                            {{else}}
                            AI NEWS <span style="color: #00ff88;">DAILY</span>
                            {{/if_eq}}
                        </h1>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="text-align: center; padding-top: 15px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                        <tr>
                                            <td style="width: 35px; height: 3px; background-color: #00ff88;"></td>
                                            <td style="width: 35px; height: 3px; background-color: #ff0055;"></td>
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
                                <td style="padding: 14px 18px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td class="mobile-font-small" style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 50%;">
                                                {{#if_eq lang 'es'}}ESTADO DEL SISTEMA{{else}}SYSTEM STATUS{{/if_eq}}
                                            </td>
                                            <td class="mobile-font-small" style="text-align: right; color: #00ff88; font-size: 12px; font-family: 'Courier New', monospace; width: 50%;">
                                                {{#if_eq lang 'es'}}⬤ EN LÍNEA{{else}}⬤ ONLINE{{/if_eq}}
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
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border-left: 4px solid #00ff88;">
                            <tr>
                                <td style="padding: 18px 20px;">
                                    <p class="mobile-font-small" style="margin: 0 0 6px 0; color: #00ff88; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.5;">
                                        {{#if_eq lang 'es'}}
                                        > INICIANDO PROTOCOLO DE CALIBRACIÓN...
                                        {{else}}
                                        > INITIALIZING CALIBRATION PROTOCOL...
                                        {{/if_eq}}
                                    </p>
                                    <p class="mobile-font-small" style="margin: 0 0 14px 0; color: #666666; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.5;">
                                        {{#if_eq lang 'es'}}
                                        > ESTADO: REQUIERE INPUT DEL USUARIO
                                        {{else}}
                                        > STATUS: REQUIRES USER INPUT
                                        {{/if_eq}}
                                    </p>
                                    <p class="mobile-font-medium" style="margin: 0; color: #cccccc; font-size: 15px; line-height: 1.6;">
                                        {{#if_eq lang 'es'}}
                                        Detectamos que has estado recibiendo el feed por un tiempo. <strong>Necesito calibrar la señal</strong> para optimizar el contenido que llega a tu bandeja.
                                        {{else}}
                                        We detected you've been receiving the feed for a while. <strong>I need to calibrate the signal</strong> to optimize the content reaching your inbox.
                                        {{/if_eq}}
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
                                <td style="padding: 25px 20px;">

                                    <!-- Title -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td style="text-align: center; padding-bottom: 22px;">
                                                <p class="mobile-font-small" style="margin: 0 0 10px 0; color: #00ff88; font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 2px;">
                                                    {{#if_eq lang 'es'}}[ MÓDULO DE CALIBRACIÓN DE SEÑAL ]{{else}}[ SIGNAL CALIBRATION MODULE ]{{/if_eq}}
                                                </p>
                                                <h2 class="mobile-font-medium" style="margin: 0; color: #ffffff; font-size: 19px; font-weight: 700; line-height: 1.4;">
                                                    {{#if_eq lang 'es'}}¿Qué intensidad de señal estás recibiendo?{{else}}What signal strength are you receiving?{{/if_eq}}
                                                </h2>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Signal Meter Visualization -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td style="text-align: center; padding-bottom: 28px;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                                    <tr>
                                                        <td style="padding: 0 3px; vertical-align: bottom;">
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                                <tr><td style="width: 18px; height: 15px; background-color: #ff0055; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                                                            </table>
                                                        </td>
                                                        <td style="padding: 0 3px; vertical-align: bottom;">
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                                <tr><td style="width: 18px; height: 30px; background-color: #ff6600; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                                                            </table>
                                                        </td>
                                                        <td style="padding: 0 3px; vertical-align: bottom;">
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                                <tr><td style="width: 18px; height: 45px; background-color: #ffaa00; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                                                            </table>
                                                        </td>
                                                        <td style="padding: 0 3px; vertical-align: bottom;">
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                                <tr><td style="width: 18px; height: 60px; background-color: #00cfff; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                                                            </table>
                                                        </td>
                                                        <td style="padding: 0 3px; vertical-align: bottom;">
                                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                                <tr><td style="width: 18px; height: 75px; background-color: #00ff88; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
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
                                            <td style="padding: 0 0 12px 0;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border-left: 4px solid #00ff88;">
                                                    <tr>
                                                        <td style="padding: 18px;">
                                                            <a href="https://idir.ai/api/newsletter/feedback?token={{token}}&type=very_useful" style="text-decoration: none; display: block;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 85px; vertical-align: top; padding-right: 12px;">
                                                                            <p class="signal-bar" style="margin: 0 0 4px 0; font-family: 'Courier New', monospace; color: #00ff88; font-size: 24px; font-weight: 700; line-height: 1;">
                                                                                █████
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; font-family: 'Courier New', monospace; color: #00ff88; font-size: 11px;">
                                                                                STRONG
                                                                            </p>
                                                                        </td>
                                                                        <td style="vertical-align: middle;">
                                                                            <p class="mobile-font-medium" style="margin: 0 0 5px 0; color: #ffffff; font-size: 16px; font-weight: 700;">
                                                                                {{#if_eq lang 'es'}}Señal Fuerte 😍{{else}}Strong Signal 😍{{/if_eq}}
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; color: #999999; font-size: 13px; line-height: 1.4;">
                                                                                {{#if_eq lang 'es'}}Leo casi todo, aprendo cosas nuevas constantemente{{else}}I read almost everything, constantly learning new things{{/if_eq}}
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
                                            <td style="padding: 0 0 12px 0;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; border-left: 4px solid #00cfff;">
                                                    <tr>
                                                        <td style="padding: 18px;">
                                                            <a href="https://idir.ai/api/newsletter/feedback?token={{token}}&type=useful" style="text-decoration: none; display: block;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 85px; vertical-align: top; padding-right: 12px;">
                                                                            <p class="signal-bar" style="margin: 0 0 4px 0; font-family: 'Courier New', monospace; color: #00cfff; font-size: 24px; font-weight: 700; line-height: 1;">
                                                                                ███░░
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; font-family: 'Courier New', monospace; color: #00cfff; font-size: 11px;">
                                                                                MEDIUM
                                                                            </p>
                                                                        </td>
                                                                        <td style="vertical-align: middle;">
                                                                            <p class="mobile-font-medium" style="margin: 0 0 5px 0; color: #ffffff; font-size: 16px; font-weight: 700;">
                                                                                {{#if_eq lang 'es'}}Señal Media 👍{{else}}Medium Signal 👍{{/if_eq}}
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; color: #999999; font-size: 13px; line-height: 1.4;">
                                                                                {{#if_eq lang 'es'}}Leo algunos, encuentro valor de vez en cuando{{else}}I read some, find value from time to time{{/if_eq}}
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
                                                        <td style="padding: 18px;">
                                                            <a href="https://idir.ai/api/newsletter/feedback?token={{token}}&type=not_useful" style="text-decoration: none; display: block;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 85px; vertical-align: top; padding-right: 12px;">
                                                                            <p class="signal-bar" style="margin: 0 0 4px 0; font-family: 'Courier New', monospace; color: #ff0055; font-size: 24px; font-weight: 700; line-height: 1;">
                                                                                █░░░░
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; font-family: 'Courier New', monospace; color: #ff0055; font-size: 11px;">
                                                                                WEAK
                                                                            </p>
                                                                        </td>
                                                                        <td style="vertical-align: middle;">
                                                                            <p class="mobile-font-medium" style="margin: 0 0 5px 0; color: #ffffff; font-size: 16px; font-weight: 700;">
                                                                                {{#if_eq lang 'es'}}Señal Débil 👎{{else}}Weak Signal 👎{{/if_eq}}
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; color: #999999; font-size: 13px; line-height: 1.4;">
                                                                                {{#if_eq lang 'es'}}Casi no los leo, poco valor para mí{{else}}I barely read them, little value for me{{/if_eq}}
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
                                <td style="padding: 18px; text-align: center;">
                                    <p class="mobile-font-medium" style="margin: 0 0 10px 0; color: #00ff88; font-size: 15px; font-weight: 700;">
                                        {{#if_eq lang 'es'}}→ Tu input = Mejor contenido{{else}}→ Your input = Better content{{/if_eq}}
                                    </p>
                                    <p class="mobile-font-small" style="margin: 0; color: #666666; font-size: 13px; line-height: 1.5;">
                                        {{#if_eq lang 'es'}}
                                        ¿Ideas para optimizar? <a href="mailto:content@idir.ai?subject=Feedback%20sobre%20newsletter%20de%20IA" style="color: #00cfff; text-decoration: none; font-weight: 700;">Envía tu feedback aquí</a>
                                        {{else}}
                                        Ideas to optimize? <a href="mailto:content@idir.ai?subject=Newsletter%20Feedback" style="color: #00cfff; text-decoration: none; font-weight: 700;">Send your feedback here</a>
                                        {{/if_eq}}
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
                    <td class="mobile-padding" style="padding: 25px; background-color: #000000;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <!-- Signature -->
                            <tr>
                                <td style="text-align: center; padding-bottom: 18px;">
                                    <p class="mobile-font-medium" style="margin: 0 0 6px 0; color: #00ff88; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                        Idir Ouhab Meskine
                                    </p>
                                    <p class="mobile-font-small" style="margin: 0; color: #999999; font-size: 13px;">
                                        Solutions Engineer at n8n
                                    </p>
                                </td>
                            </tr>

                            <!-- Social Links -->
                            <tr>
                                <td style="text-align: center; padding-bottom: 18px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                        <tr>
                                            <td style="padding: 0 10px;">
                                                <a href="https://idir.ai" class="mobile-font-small" style="color: #00ff88; text-decoration: none; font-size: 13px; font-weight: 600;">
                                                    {{#if_eq lang 'es'}}Sitio Web{{else}}Website{{/if_eq}}
                                                </a>
                                            </td>
                                            <td style="color: #333333; font-size: 13px;">|</td>
                                            <td style="padding: 0 10px;">
                                                <a href="https://linkedin.com/in/idirouhab" class="mobile-font-small" style="color: #00ff88; text-decoration: none; font-size: 13px; font-weight: 600;">
                                                    LinkedIn
                                                </a>
                                            </td>
                                            <td style="color: #333333; font-size: 13px;">|</td>
                                            <td style="padding: 0 10px;">
                                                <a href="https://twitter.com/idir_ouhab" class="mobile-font-small" style="color: #00ff88; text-decoration: none; font-size: 13px; font-weight: 600;">
                                                    Twitter
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Unsubscribe -->
                            <tr>
                                <td style="text-align: center; padding-top: 18px; border-top: 1px solid #222222;">
                                    <p class="mobile-font-small" style="margin: 0 0 6px 0; color: #666666; font-size: 12px; line-height: 1.5;">
                                        {{#if_eq lang 'es'}}
                                        Recibes este correo porque te suscribiste a Noticias IA Diarias.
                                        {{else}}
                                        You receive this email because you subscribed to AI News Daily.
                                        {{/if_eq}}
                                    </p>
                                    <p class="mobile-font-small" style="margin: 0; color: #666666; font-size: 12px;">
                                        <a href="{{unsubscribe_url}}" style="color: #00ff88; text-decoration: none;">
                                            {{#if_eq lang 'es'}}Cancelar suscripción{{else}}Unsubscribe{{/if_eq}}
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
```

### 5. Text Template (Plain Text Version)

```
{{#if_eq lang 'es'}}NOTICIAS IA DIARIAS{{else}}AI NEWS DAILY{{/if_eq}}

{{#if_eq lang 'es'}}ESTADO DEL SISTEMA: EN LÍNEA{{else}}SYSTEM STATUS: ONLINE{{/if_eq}}

---

{{#if_eq lang 'es'}}
> INICIANDO PROTOCOLO DE CALIBRACIÓN...
> ESTADO: REQUIERE INPUT DEL USUARIO

Detectamos que has estado recibiendo el feed por un tiempo. Necesito calibrar la señal para optimizar el contenido que llega a tu bandeja.
{{else}}
> INITIALIZING CALIBRATION PROTOCOL...
> STATUS: REQUIRES USER INPUT

We detected you've been receiving the feed for a while. I need to calibrate the signal to optimize the content reaching your inbox.
{{/if_eq}}

---

{{#if_eq lang 'es'}}[ MÓDULO DE CALIBRACIÓN DE SEÑAL ]{{else}}[ SIGNAL CALIBRATION MODULE ]{{/if_eq}}
{{#if_eq lang 'es'}}¿Qué intensidad de señal estás recibiendo?{{else}}What signal strength are you receiving?{{/if_eq}}

█████ STRONG
{{#if_eq lang 'es'}}Señal Fuerte 😍{{else}}Strong Signal 😍{{/if_eq}}
{{#if_eq lang 'es'}}Leo casi todo, aprendo cosas nuevas constantemente{{else}}I read almost everything, constantly learning new things{{/if_eq}}
https://idir.ai/api/newsletter/feedback?token={{token}}&type=very_useful

███░░ MEDIUM
{{#if_eq lang 'es'}}Señal Media 👍{{else}}Medium Signal 👍{{/if_eq}}
{{#if_eq lang 'es'}}Leo algunos, encuentro valor de vez en cuando{{else}}I read some, find value from time to time{{/if_eq}}
https://idir.ai/api/newsletter/feedback?token={{token}}&type=useful

█░░░░ WEAK
{{#if_eq lang 'es'}}Señal Débil 👎{{else}}Weak Signal 👎{{/if_eq}}
{{#if_eq lang 'es'}}Casi no los leo, poco valor para mí{{else}}I barely read them, little value for me{{/if_eq}}
https://idir.ai/api/newsletter/feedback?token={{token}}&type=not_useful

---

{{#if_eq lang 'es'}}→ Tu input = Mejor contenido{{else}}→ Your input = Better content{{/if_eq}}
{{#if_eq lang 'es'}}¿Ideas para optimizar? Envía tu feedback a content@idir.ai{{else}}Ideas to optimize? Send your feedback to content@idir.ai{{/if_eq}}

---

Idir Ouhab Meskine
Solutions Engineer at n8n

{{#if_eq lang 'es'}}Sitio Web{{else}}Website{{/if_eq}}: https://idir.ai
LinkedIn: https://linkedin.com/in/idirouhab
Twitter: https://twitter.com/idir_ouhab

{{#if_eq lang 'es'}}Recibes este correo porque te suscribiste a Noticias IA Diarias.{{else}}You receive this email because you subscribed to AI News Daily.{{/if_eq}}
{{#if_eq lang 'es'}}Cancelar suscripción{{else}}Unsubscribe{{/if_eq}}: {{unsubscribe_url}}
```

## Mailgun Template Notes

**Important:** Mailgun uses Handlebars syntax, but the `if_eq` helper may need to be registered. An alternative approach is to create **two separate templates**:

### Option A: Two Templates (Recommended)
- Template 1: `feedback-survey-en` (English version)
- Template 2: `feedback-survey-es` (Spanish version)

This is simpler and avoids Handlebars conditionals.

### Option B: Single Template with Variables
If you want one template, replace all the conditional text with variables:
- `{{title}}`
- `{{system_status_label}}`
- `{{intro_text}}`
- etc.

Then pass all the text as variables from your API.

## Next Steps

After creating the template in Mailgun:
1. Note the template name (e.g., `feedback-survey-en`)
2. Add to your `.env`:
   ```
   MAILGUN_FEEDBACK_TEMPLATE_EN=feedback-survey-en
   MAILGUN_FEEDBACK_TEMPLATE_ES=feedback-survey-es
   ```
3. Update the API route to use templates instead of inline HTML

# Mailgun Feedback Survey Template (Single Template with Variables)

Create **ONE** template in Mailgun that works for all languages. All translations are managed in your codebase (`lib/email-translations.ts`) and passed as variables.

## Setup Instructions

### 1. Create Template in Mailgun Dashboard
1. Go to **Sending** > **Templates**
2. Click **Create Template**
3. Name: `feedback-survey`
4. Description: `Newsletter feedback survey - multi-language`

### 2. Template Variables

All these variables are passed from your API:

| Variable | Example (English) | Example (Spanish) |
|----------|------------------|-------------------|
| `token` | `abc123...` | `abc123...` |
| `subscriber_email` | `user@example.com` | `usuario@example.com` |
| `unsubscribe_url` | `https://idir.ai/en/unsubscribe?email=...` | `https://idir.ai/es/unsubscribe?email=...` |
| `title` | `AI NEWS <span>DAILY</span>` | `NOTICIAS IA <span>DIARIAS</span>` |
| `systemStatusLabel` | `SYSTEM STATUS` | `ESTADO DEL SISTEMA` |
| `systemStatusOnline` | `⬤ ONLINE` | `⬤ EN LÍNEA` |
| `terminalLine1` | `> INITIALIZING...` | `> INICIANDO...` |
| `terminalLine2` | `> STATUS: REQUIRES...` | `> ESTADO: REQUIERE...` |
| `introText` | `We detected you've...` | `Detectamos que...` |
| `calibrationModuleLabel` | `[ SIGNAL CALIBRATION MODULE ]` | `[ MÓDULO DE CALIBRACIÓN... ]` |
| `question` | `What signal strength...` | `¿Qué intensidad...` |
| `strongSignalLabel` | `Strong Signal 😍` | `Señal Fuerte 😍` |
| `strongSignalSubtext` | `I read almost...` | `Leo casi todo...` |
| `mediumSignalLabel` | `Medium Signal 👍` | `Señal Media 👍` |
| `mediumSignalSubtext` | `I read some...` | `Leo algunos...` |
| `weakSignalLabel` | `Weak Signal 👎` | `Señal Débil 👎` |
| `weakSignalSubtext` | `I barely read...` | `Casi no los leo...` |
| `footerMessage` | `→ Your input = Better...` | `→ Tu input = Mejor...` |
| `footerSubtext` | `Ideas to optimize?...` | `¿Ideas para optimizar?...` |
| `footerText` | `You receive this email...` | `Recibes este correo...` |
| `websiteText` | `Website` | `Sitio Web` |
| `unsubscribeText` | `Unsubscribe` | `Cancelar suscripción` |

### 3. HTML Template

Copy this HTML into Mailgun's template editor:

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
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a; min-width: 100%;">
    <tr>
        <td align="center" style="padding: 0;">
            <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px; width: 100%; background-color: #000000; border: 2px solid #00ff88;">

                <!-- Header -->
                <tr>
                    <td class="mobile-padding" style="padding: 30px; background-color: #000000; text-align: center;">
                        <h1 style="margin: 0; padding: 12px 20px; color: #ffffff; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border: 1px solid #333333; display: inline-block;">
                            {{{title}}}
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
                                                {{systemStatusLabel}}
                                            </td>
                                            <td class="mobile-font-small" style="text-align: right; color: #00ff88; font-size: 12px; font-family: 'Courier New', monospace; width: 50%;">
                                                {{systemStatusOnline}}
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
                                        {{terminalLine1}}
                                    </p>
                                    <p class="mobile-font-small" style="margin: 0 0 14px 0; color: #666666; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.5;">
                                        {{terminalLine2}}
                                    </p>
                                    <p class="mobile-font-medium" style="margin: 0; color: #cccccc; font-size: 15px; line-height: 1.6;">
                                        {{{introText}}}
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
                                                    {{calibrationModuleLabel}}
                                                </p>
                                                <h2 class="mobile-font-medium" style="margin: 0; color: #ffffff; font-size: 19px; font-weight: 700; line-height: 1.4;">
                                                    {{question}}
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
                                                                                {{strongSignalLabel}}
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; color: #999999; font-size: 13px; line-height: 1.4;">
                                                                                {{strongSignalSubtext}}
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
                                                                                {{mediumSignalLabel}}
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; color: #999999; font-size: 13px; line-height: 1.4;">
                                                                                {{mediumSignalSubtext}}
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
                                                                                {{weakSignalLabel}}
                                                                            </p>
                                                                            <p class="mobile-font-small" style="margin: 0; color: #999999; font-size: 13px; line-height: 1.4;">
                                                                                {{weakSignalSubtext}}
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
                                        {{footerMessage}}
                                    </p>
                                    <p class="mobile-font-small" style="margin: 0; color: #666666; font-size: 13px; line-height: 1.5;">
                                        {{{footerSubtext}}}
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
                                                    {{websiteText}}
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
                                        {{footerText}}
                                    </p>
                                    <p class="mobile-font-small" style="margin: 0; color: #666666; font-size: 12px;">
                                        <a href="{{unsubscribe_url}}" style="color: #00ff88; text-decoration: none;">
                                            {{unsubscribeText}}
                                        </a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
```

### 4. Text Template (Plain Text Version)

```
{{title}}

{{systemStatusLabel}}: {{systemStatusOnline}}

---

{{terminalLine1}}
{{terminalLine2}}

{{introText}}

---

{{calibrationModuleLabel}}
{{question}}

█████ STRONG
{{strongSignalLabel}}
{{strongSignalSubtext}}
https://idir.ai/api/newsletter/feedback?token={{token}}&type=very_useful

███░░ MEDIUM
{{mediumSignalLabel}}
{{mediumSignalSubtext}}
https://idir.ai/api/newsletter/feedback?token={{token}}&type=useful

█░░░░ WEAK
{{weakSignalLabel}}
{{weakSignalSubtext}}
https://idir.ai/api/newsletter/feedback?token={{token}}&type=not_useful

---

{{footerMessage}}
{{footerSubtext}}

---

Idir Ouhab Meskine
Solutions Engineer at n8n

{{websiteText}}: https://idir.ai
LinkedIn: https://linkedin.com/in/idirouhab
Twitter: https://twitter.com/idir_ouhab

{{footerText}}
{{unsubscribeText}}: {{unsubscribe_url}}
```

## Notes

1. **Triple braces `{{{variable}}}`**: Used for HTML content that should NOT be escaped (like `title` and `footerSubtext` which contain HTML tags)
2. **Double braces `{{variable}}`**: Used for plain text that should be HTML-escaped
3. **All translations managed in code**: Edit `lib/email-translations.ts` to update translations
4. **Single template**: Works for all languages automatically

## Testing

Test in Mailgun dashboard with sample variables:

```json
{
  "token": "test-123",
  "subscriber_email": "test@example.com",
  "unsubscribe_url": "https://idir.ai/en/unsubscribe?email=test@example.com",
  "title": "AI NEWS <span style=\"color: #00ff88;\">DAILY</span>",
  "systemStatusLabel": "SYSTEM STATUS",
  "systemStatusOnline": "⬤ ONLINE",
  "terminalLine1": "> INITIALIZING CALIBRATION PROTOCOL...",
  "terminalLine2": "> STATUS: REQUIRES USER INPUT",
  "introText": "We detected you've been receiving the feed for a while. <strong>I need to calibrate the signal</strong> to optimize the content reaching your inbox.",
  "calibrationModuleLabel": "[ SIGNAL CALIBRATION MODULE ]",
  "question": "What signal strength are you receiving?",
  "strongSignalLabel": "Strong Signal 😍",
  "strongSignalSubtext": "I read almost everything, constantly learning new things",
  "mediumSignalLabel": "Medium Signal 👍",
  "mediumSignalSubtext": "I read some, find value from time to time",
  "weakSignalLabel": "Weak Signal 👎",
  "weakSignalSubtext": "I barely read them, little value for me",
  "footerMessage": "→ Your input = Better content",
  "footerSubtext": "Ideas to optimize? <a href=\"mailto:content@idir.ai?subject=Newsletter%20Feedback\" style=\"color: #00cfff; text-decoration: none; font-weight: 700;\">Send your feedback here</a>",
  "footerText": "You receive this email because you subscribed to AI News Daily.",
  "websiteText": "Website",
  "unsubscribeText": "Unsubscribe"
}
```

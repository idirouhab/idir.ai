/**
 * Certificate API Localization
 *
 * Provides translations for API responses in English and Spanish
 */

import 'server-only';

export type Locale = 'en' | 'es';

const translations = {
  en: {
    // Issue endpoint
    'issue.success': 'Certificate issued successfully',
    'issue.error.notFound': 'Course signup not found',
    'issue.error.notCompleted': 'Course signup is not completed. Cannot issue certificate.',
    'issue.error.invalidBody': 'Invalid request body',
    'issue.error.invalidSignupId': 'Invalid course_signup_id format',
    'issue.error.internal': 'Internal server error',

    // Revoke endpoint
    'revoke.success': 'Certificate revoked successfully',
    'revoke.error.notFound': 'Certificate not found',
    'revoke.error.alreadyRevoked': 'Certificate is already revoked',
    'revoke.error.invalidFormat': 'Invalid certificate ID format',
    'revoke.error.invalidReason': 'Reason must be at least 10 characters',
    'revoke.error.invalidBody': 'Invalid request body',
    'revoke.error.internal': 'Internal server error',

    // Reissue endpoint
    'reissue.success': 'Certificate reissued successfully',
    'reissue.error.notFound': 'Certificate not found',
    'reissue.error.invalidFormat': 'Invalid certificate ID format',
    'reissue.error.invalidBody': 'Invalid request body',
    'reissue.error.internal': 'Internal server error',

    // Verify endpoint
    'verify.valid': 'This certificate is valid and authentic.',
    'verify.revoked': 'This certificate has been revoked.',
    'verify.reissued': 'This certificate has been reissued. A new certificate was generated.',
    'verify.notFound': 'Certificate not found. Please verify the certificate ID is correct.',
    'verify.invalidFormat': 'Invalid certificate ID format',
    'verify.formatHint': 'The certificate ID should be in the format: CERT-YYYY-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    'verify.error.internal': 'An error occurred while verifying the certificate. Please try again later.',

    // Common
    'common.certificateId': 'Certificate ID',
    'common.status': 'Status',
    'common.issuedAt': 'Issued at',
    'common.studentName': 'Student name',
    'common.courseTitle': 'Course title',
    'common.completedAt': 'Completed at',
    'common.revokedAt': 'Revoked at',
    'common.reason': 'Reason',
  },
  es: {
    // Issue endpoint
    'issue.success': 'Certificado emitido exitosamente',
    'issue.error.notFound': 'Inscripción al curso no encontrada',
    'issue.error.notCompleted': 'La inscripción al curso no está completada. No se puede emitir el certificado.',
    'issue.error.invalidBody': 'Cuerpo de solicitud inválido',
    'issue.error.invalidSignupId': 'Formato de course_signup_id inválido',
    'issue.error.internal': 'Error interno del servidor',

    // Revoke endpoint
    'revoke.success': 'Certificado revocado exitosamente',
    'revoke.error.notFound': 'Certificado no encontrado',
    'revoke.error.alreadyRevoked': 'El certificado ya está revocado',
    'revoke.error.invalidFormat': 'Formato de ID de certificado inválido',
    'revoke.error.invalidReason': 'La razón debe tener al menos 10 caracteres',
    'revoke.error.invalidBody': 'Cuerpo de solicitud inválido',
    'revoke.error.internal': 'Error interno del servidor',

    // Reissue endpoint
    'reissue.success': 'Certificado reemitido exitosamente',
    'reissue.error.notFound': 'Certificado no encontrado',
    'reissue.error.invalidFormat': 'Formato de ID de certificado inválido',
    'reissue.error.invalidBody': 'Cuerpo de solicitud inválido',
    'reissue.error.internal': 'Error interno del servidor',

    // Verify endpoint
    'verify.valid': 'Este certificado es válido y auténtico.',
    'verify.revoked': 'Este certificado ha sido revocado.',
    'verify.reissued': 'Este certificado ha sido reemitido. Se generó un nuevo certificado.',
    'verify.notFound': 'Certificado no encontrado. Por favor verifica que el ID sea correcto.',
    'verify.invalidFormat': 'Formato de ID de certificado inválido',
    'verify.formatHint': 'El ID del certificado debe tener el formato: CERT-YYYY-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    'verify.error.internal': 'Ocurrió un error al verificar el certificado. Por favor intenta nuevamente.',

    // Common
    'common.certificateId': 'ID del certificado',
    'common.status': 'Estado',
    'common.issuedAt': 'Emitido el',
    'common.studentName': 'Nombre del estudiante',
    'common.courseTitle': 'Título del curso',
    'common.completedAt': 'Completado el',
    'common.revokedAt': 'Revocado el',
    'common.reason': 'Razón',
  },
};

/**
 * Get translation for a given key and locale
 */
export function t(key: string, locale: Locale = 'en'): string {
  const translation = translations[locale]?.[key as keyof typeof translations.en];

  if (!translation) {
    console.warn(`[i18n] Missing translation for key: ${key} (locale: ${locale})`);
    return translations.en[key as keyof typeof translations.en] || key;
  }

  return translation;
}

/**
 * Detect locale from request headers
 * Checks Accept-Language header and query parameters
 */
export function detectLocale(request: Request): Locale {
  // 1. Check query parameter (?lang=es or ?locale=es)
  const url = new URL(request.url);
  const langParam = url.searchParams.get('lang') || url.searchParams.get('locale');

  if (langParam === 'es' || langParam === 'español' || langParam === 'spanish') {
    return 'es';
  }

  if (langParam === 'en' || langParam === 'english' || langParam === 'inglés') {
    return 'en';
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || '';

  // Parse Accept-Language header (e.g., "es-ES,es;q=0.9,en;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(),
        priority: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  // Find first supported language
  for (const lang of languages) {
    if (lang.code === 'es') return 'es';
    if (lang.code === 'en') return 'en';
  }

  // 3. Default to English
  return 'en';
}

/**
 * Create a localized translator function for a specific request
 */
export function createTranslator(request: Request) {
  const locale = detectLocale(request);

  return {
    t: (key: string) => t(key, locale),
    locale,
  };
}

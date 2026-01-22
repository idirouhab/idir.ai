'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Check, X, AlertCircle, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type VerificationStatus = 'idle' | 'loading' | 'valid' | 'revoked' | 'reissued' | 'not-found' | 'error';

interface VerificationResult {
  found: boolean;
  certificate_id: string;
  status: 'valid' | 'revoked' | 'reissued';
  student_name: string;
  course_title: string;
  issued_at: string;
  completed_at: string;
  revoked_at?: string;
  revoked_reason?: string;
  message?: string;
}

export default function CertificateVerifyPage() {
  const locale = useLocale();
  const [certificateId, setCertificateId] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const isSpanish = locale === 'es';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateId.trim()) {
      setStatus('error');
      setErrorMessage(isSpanish
        ? 'Por favor, ingresa un ID de certificado'
        : 'Please enter a certificate ID'
      );
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    setResult(null);

    try {
      const response = await fetch(`/api/certificates/verify/${certificateId.trim()}`);
      const data = await response.json();

      if (response.ok && data.found) {
        setResult(data);

        // Set status based on certificate status
        if (data.status === 'valid') {
          setStatus('valid');
        } else if (data.status === 'revoked') {
          setStatus('revoked');
        } else if (data.status === 'reissued') {
          setStatus('reissued');
        }
      } else {
        setStatus('not-found');
        setErrorMessage(data.message || (isSpanish
          ? 'Certificado no encontrado. Verifica que el ID sea correcto.'
          : 'Certificate not found. Please verify the ID is correct.'
        ));
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(isSpanish
        ? 'Error al verificar el certificado. Por favor, intenta nuevamente.'
        : 'Error verifying certificate. Please try again.'
      );
      console.error('[Certificate Verify] Error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReset = () => {
    setCertificateId('');
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-4xl">
        {/* Main Card */}
        <div className="bg-[#111827] border border-[#1f2937] border-l-[3px] border-l-[#10b981] rounded-lg p-8 sm:p-12 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5" aria-hidden="true">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}></div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-1 w-12 bg-[#10b981]"></div>
                <span className="text-[#10b981] font-bold uppercase tracking-wider text-sm">
                  {isSpanish ? 'Verificación' : 'Verification'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                {isSpanish ? 'Verifica tu' : 'Verify Your'}
                <br />
                <span className="text-[#10b981]">
                  {isSpanish ? 'Certificado' : 'Certificate'}
                </span>
              </h1>

              <p className="text-base text-[#d1d5db] leading-relaxed max-w-2xl">
                {isSpanish
                  ? 'Ingresa el ID del certificado para verificar su autenticidad y validez. El ID tiene el formato: CERT-2026-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
                  : 'Enter the certificate ID to verify its authenticity and validity. The ID format is: CERT-2026-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
                }
              </p>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="space-y-6 mb-8">
              <div>
                <label htmlFor="certificateId" className="block text-white font-bold mb-2 uppercase text-sm">
                  {isSpanish ? 'ID del Certificado' : 'Certificate ID'}
                </label>
                <div className="flex gap-3">
                  <input
                    id="certificateId"
                    type="text"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                    placeholder="CERT-2026-..."
                    className="flex-1 px-4 py-3 bg-[#0a0a0a] text-white border border-[#1f2937] rounded focus:border-[#10b981] focus:outline-none transition-colors font-mono text-sm"
                    disabled={status === 'loading'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-8 py-3 bg-[#10b981] text-black font-black uppercase tracking-wide rounded hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    <span className="hidden sm:inline">
                      {status === 'loading'
                        ? (isSpanish ? 'Verificando...' : 'Verifying...')
                        : (isSpanish ? 'Verificar' : 'Verify')
                      }
                    </span>
                  </button>
                </div>
              </div>
            </form>

            {/* Loading State */}
            {status === 'loading' && (
              <div className="p-8 border border-[#1f2937] rounded bg-[#0a0a0a] text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mb-4"></div>
                <p className="text-[#d1d5db]">
                  {isSpanish ? 'Verificando certificado...' : 'Verifying certificate...'}
                </p>
              </div>
            )}

            {/* Valid Certificate */}
            {status === 'valid' && result && (
              <div className="border border-[#10b981] border-l-[3px] border-l-[#10b981] rounded bg-[#10b981]/10 overflow-hidden">
                <div className="p-6">
                  {/* Success Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center">
                      <Check className="w-7 h-7 text-black" strokeWidth={3} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-[#10b981] mb-2 uppercase">
                        {isSpanish ? 'Certificado Válido' : 'Valid Certificate'}
                      </h2>
                      <p className="text-[#10b981] text-sm">
                        {result.message || (isSpanish
                          ? 'Este certificado es válido y auténtico.'
                          : 'This certificate is valid and authentic.'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-[#0a0a0a] p-4 rounded border border-[#1f2937]">
                        <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                          {isSpanish ? 'Estudiante' : 'Student'}
                        </p>
                        <p className="text-white font-bold text-lg">{result.student_name}</p>
                      </div>

                      <div className="bg-[#0a0a0a] p-4 rounded border border-[#1f2937]">
                        <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                          {isSpanish ? 'Curso' : 'Course'}
                        </p>
                        <p className="text-white font-bold text-lg">{result.course_title}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-[#0a0a0a] p-4 rounded border border-[#1f2937]">
                        <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                          {isSpanish ? 'Completado el' : 'Completed on'}
                        </p>
                        <p className="text-white font-semibold">{formatDate(result.completed_at)}</p>
                      </div>

                      <div className="bg-[#0a0a0a] p-4 rounded border border-[#1f2937]">
                        <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                          {isSpanish ? 'Emitido el' : 'Issued on'}
                        </p>
                        <p className="text-white font-semibold">{formatDate(result.issued_at)}</p>
                      </div>
                    </div>

                    <div className="bg-[#0a0a0a] p-4 rounded border border-[#1f2937]">
                      <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                        {isSpanish ? 'ID del Certificado' : 'Certificate ID'}
                      </p>
                      <p className="text-white font-mono text-sm break-all">{result.certificate_id}</p>
                    </div>
                  </div>

                  {/* Share Info */}
                  <div className="mt-6 p-4 bg-[#0a0a0a] rounded border border-[#1f2937]">
                    <p className="text-xs text-[#9ca3af] mb-2">
                      {isSpanish
                        ? '✓ Este certificado puede ser verificado públicamente en cualquier momento usando este ID.'
                        : '✓ This certificate can be publicly verified at any time using this ID.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Revoked Certificate */}
            {status === 'revoked' && result && (
              <div className="border border-[#ef4444] border-l-[3px] border-l-[#ef4444] rounded bg-[#ef4444]/10 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ef4444] flex items-center justify-center">
                      <X className="w-7 h-7 text-white" strokeWidth={3} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-[#ef4444] mb-2 uppercase">
                        {isSpanish ? 'Certificado Revocado' : 'Certificate Revoked'}
                      </h2>
                      <p className="text-[#ef4444] text-sm">
                        {result.message || (isSpanish
                          ? 'Este certificado ha sido revocado y ya no es válido.'
                          : 'This certificate has been revoked and is no longer valid.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#0a0a0a] p-4 rounded border border-[#1f2937]">
                      <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                        {isSpanish ? 'Estudiante' : 'Student'}
                      </p>
                      <p className="text-white font-bold">{result.student_name}</p>
                    </div>

                    {result.revoked_at && (
                      <div className="bg-[#0a0a0a] p-4 rounded border border-[#1f2937]">
                        <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                          {isSpanish ? 'Revocado el' : 'Revoked on'}
                        </p>
                        <p className="text-white font-semibold">{formatDate(result.revoked_at)}</p>
                      </div>
                    )}

                    {result.revoked_reason && (
                      <div className="bg-[#0a0a0a] p-4 rounded border border-[#1f2937]">
                        <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                          {isSpanish ? 'Razón' : 'Reason'}
                        </p>
                        <p className="text-[#ef4444] font-semibold">{result.revoked_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reissued Certificate */}
            {status === 'reissued' && result && (
              <div className="border border-[#f59e0b] border-l-[3px] border-l-[#f59e0b] rounded bg-[#f59e0b]/10 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#f59e0b] flex items-center justify-center">
                      <AlertCircle className="w-7 h-7 text-black" strokeWidth={3} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-[#f59e0b] mb-2 uppercase">
                        {isSpanish ? 'Certificado Reemitido' : 'Certificate Reissued'}
                      </h2>
                      <p className="text-[#f59e0b] text-sm">
                        {result.message || (isSpanish
                          ? 'Este certificado ha sido reemitido. Se generó un nuevo certificado.'
                          : 'This certificate has been reissued. A new certificate was generated.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#0a0a0a] p-4 rounded border border-[#1f2937]">
                      <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                        {isSpanish ? 'Estudiante' : 'Student'}
                      </p>
                      <p className="text-white font-bold">{result.student_name}</p>
                    </div>

                    <div className="bg-[#0a0a0a] p-4 rounded border border-[#1f2937]">
                      <p className="text-[#f59e0b] text-sm">
                        {isSpanish
                          ? '⚠️ Por favor, contacta al emisor del certificado para obtener el nuevo ID de certificado.'
                          : '⚠️ Please contact the certificate issuer to obtain the new certificate ID.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Not Found */}
            {status === 'not-found' && (
              <div className="border border-[#6b7280] border-l-[3px] border-l-[#6b7280] rounded bg-[#6b7280]/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6b7280] flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-[#6b7280] mb-2 uppercase">
                      {isSpanish ? 'Certificado No Encontrado' : 'Certificate Not Found'}
                    </h2>
                    <p className="text-[#9ca3af] text-sm">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="border border-[#ef4444] border-l-[3px] border-l-[#ef4444] rounded bg-[#ef4444]/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ef4444] flex items-center justify-center">
                    <X className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-[#ef4444] mb-2 uppercase">
                      {isSpanish ? 'Error' : 'Error'}
                    </h2>
                    <p className="text-[#ef4444] text-sm">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Verify Another Button */}
            {status !== 'idle' && status !== 'loading' && (
              <div className="mt-6">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-[#1f2937] text-[#d1d5db] font-bold uppercase tracking-wide rounded hover:border-[#10b981] hover:text-[#10b981] transition-colors"
                >
                  {isSpanish ? 'Verificar Otro Certificado' : 'Verify Another Certificate'}
                </button>
              </div>
            )}

            {/* Info Section */}
            <div className="border-t border-[#1f2937] pt-8 mt-10">
              <p className="text-sm text-[#9ca3af] uppercase tracking-wider font-bold mb-4">
                {isSpanish ? '¿Cómo funciona?' : 'How it works'}
              </p>
              <ul className="space-y-3 text-[#d1d5db] text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-[#10b981] mt-1">→</span>
                  <span>
                    {isSpanish
                      ? 'Cada certificado tiene un ID único que comienza con CERT-YYYY-'
                      : 'Each certificate has a unique ID that starts with CERT-YYYY-'
                    }
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#10b981] mt-1">→</span>
                  <span>
                    {isSpanish
                      ? 'La verificación es pública y puede realizarse en cualquier momento'
                      : 'Verification is public and can be performed at any time'
                    }
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#10b981] mt-1">→</span>
                  <span>
                    {isSpanish
                      ? 'Cada verificación queda registrada para auditoría'
                      : 'Each verification is logged for audit purposes'
                    }
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href={`/${locale}`}
            className="text-sm text-[#9ca3af] hover:text-[#10b981] transition-colors uppercase tracking-wide font-bold inline-flex items-center gap-2"
          >
            {isSpanish ? 'Volver al inicio' : 'Back to home'}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

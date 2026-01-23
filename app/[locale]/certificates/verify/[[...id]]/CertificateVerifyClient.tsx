'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, X, AlertCircle, Search, FileText, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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
    pdf_url?: string;
    jpg_url?: string;
}

interface CertificateVerifyClientProps {
    initialCertificateId?: string;
}

export default function CertificateVerifyClient({ initialCertificateId }: CertificateVerifyClientProps) {
    const locale = useLocale();
    const t = useTranslations('certificates.verify');
    const [certificateId, setCertificateId] = useState(initialCertificateId || '');
    const [status, setStatus] = useState<VerificationStatus>('idle');
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const verifyInternal = useCallback(async (certId: string) => {
        setStatus('loading');
        setErrorMessage('');
        setResult(null);

        try {
            const response = await fetch(`/api/certificates/verify/${certId}?lang=${locale}`);
            const data = await response.json();

            if (response.ok && data.found) {
                setResult(data);
                if (data.status === 'valid') {
                    setStatus('valid');
                } else if (data.status === 'revoked') {
                    setStatus('revoked');
                } else if (data.status === 'reissued') {
                    setStatus('reissued');
                }
            } else {
                setStatus('not-found');
                setErrorMessage(data.message || t('notFoundMessage'));
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage(t('errorMessage'));
            console.error('[Certificate Verify] Error:', error);
        }
    }, [locale, t]);

    useEffect(() => {
        if (initialCertificateId && initialCertificateId.trim()) {
            verifyInternal(initialCertificateId.trim());
        }
    }, [initialCertificateId, verifyInternal]);

    const handleVerify = () => {
        if (!certificateId.trim()) {
            setStatus('error');
            setErrorMessage(t('errorEnterID'));
            return;
        }
        verifyInternal(certificateId.trim());
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleVerify();
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
        window.history.pushState({}, '', `/${locale}/certificates/verify`);
    };

    return (
        <>
            <a href="#main-content" className="skip-to-content">
                Skip to main content
            </a>

            <Navigation />

            <main id="main-content" role="main" className="min-h-screen bg-black">
                <section className="py-12 md:py-24 px-4 md:px-6">
                    <div className="max-w-3xl mx-auto">

                        {/* Page Header - mismo estilo que cursos */}
                        <div className="mb-8 md:mb-16">
                            <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6">
                                {t('title')}{' '}
                                <span className="text-[#11B981]">{t('titleHighlight')}</span>
                            </h1>
                            <p className="font-[family-name:var(--font-inter)] text-base md:text-xl text-gray-400 max-w-2xl">
                                {t('description')}
                            </p>
                            <p className="font-[family-name:var(--font-inter)] text-sm text-gray-500 mt-2">
                                {t('format')}
                            </p>
                        </div>

                        {/* Formulario de verificación */}
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 md:p-8 mb-8">
                            <label
                                htmlFor="certificateId"
                                className="font-[family-name:var(--font-inter)] block text-sm font-semibold text-gray-300 mb-3"
                            >
                                {t('certificateIdLabel')}
                            </label>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    id="certificateId"
                                    type="text"
                                    value={certificateId}
                                    onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                                    onKeyDown={handleKeyPress}
                                    placeholder={t('certificateIdPlaceholder')}
                                    disabled={status === 'loading'}
                                    className="font-[family-name:var(--font-inter)] flex-1 px-4 py-3.5 bg-black border border-gray-700 rounded-lg text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-[#11B981] focus:ring-1 focus:ring-[#11B981] transition-colors disabled:opacity-50"
                                />

                                <button
                                    onClick={handleVerify}
                                    disabled={status === 'loading'}
                                    className="font-[family-name:var(--font-space-grotesk)] px-6 py-3.5 bg-[#11B981] text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#0ea472] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Search className="w-5 h-5" />
                                    <span>{status === 'loading' ? t('verifyingButton') : t('verifyButton')}</span>
                                </button>
                            </div>
                        </div>

                        {/* Estado: Cargando */}
                        {status === 'loading' && (
                            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
                                <div className="inline-block w-10 h-10 rounded-full border-2 border-gray-700 border-t-[#11B981] animate-spin mb-4" />
                                <p className="font-[family-name:var(--font-inter)] text-gray-400">{t('loading')}</p>
                            </div>
                        )}

                        {/* Estado: Válido */}
                        {status === 'valid' && result && (
                            <div className="bg-[#11B981]/10 border border-[#11B981]/30 rounded-xl overflow-hidden">
                                <div className="p-6 md:p-8">
                                    {/* Header de éxito */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#11B981] flex items-center justify-center">
                                            <Check className="w-6 h-6 text-black" strokeWidth={3} />
                                        </div>
                                        <div>
                                            <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-2xl font-bold text-[#11B981] mb-1">
                                                {t('validTitle')}
                                            </h2>
                                            <p className="font-[family-name:var(--font-inter)] text-[#11B981]/80 text-sm">
                                                {result.message || t('validMessage')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detalles del certificado */}
                                    <div className="space-y-3">
                                        <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                                            <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 mb-1">{t('studentLabel')}</p>
                                            <p className="font-[family-name:var(--font-inter)] text-white font-semibold">{result.student_name}</p>
                                        </div>

                                        <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                                            <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 mb-1">{t('courseLabel')}</p>
                                            <p className="font-[family-name:var(--font-inter)] text-white font-semibold">{result.course_title}</p>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                                                <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 mb-1">{t('completedLabel')}</p>
                                                <p className="font-[family-name:var(--font-inter)] text-gray-300">{formatDate(result.completed_at)}</p>
                                            </div>
                                            <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                                                <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 mb-1">{t('issuedLabel')}</p>
                                                <p className="font-[family-name:var(--font-inter)] text-gray-300">{formatDate(result.issued_at)}</p>
                                            </div>
                                        </div>

                                        <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                                            <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 mb-1">{t('certificateIdLabel')}</p>
                                            <p className="font-mono text-sm text-gray-300 break-all">{result.certificate_id}</p>
                                        </div>
                                    </div>

                                    {/* Botones de descarga */}
                                    {(result.pdf_url || result.jpg_url) && (
                                        <div className="mt-6 pt-6 border-t border-[#11B981]/20">
                                            <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 font-semibold mb-3">{t('downloadTitle')}</p>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                {result.pdf_url && (
                                                    <a
                                                        href={result.pdf_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="font-[family-name:var(--font-space-grotesk)] flex items-center justify-center gap-2 px-4 py-3 bg-[#11B981] text-black font-bold rounded-lg hover:bg-[#0ea472] transition-colors"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        <span>{t('downloadPDF')}</span>
                                                    </a>
                                                )}
                                                {result.jpg_url && (
                                                    <a
                                                        href={result.jpg_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="font-[family-name:var(--font-space-grotesk)] flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
                                                    >
                                                        <ImageIcon className="w-4 h-4" />
                                                        <span>{t('downloadJPG')}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Compartir */}
                                    <div className="mt-6 bg-black/50 border border-gray-800 rounded-lg p-4">
                                        <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 mb-2">{t('shareInfo')}</p>
                                        <p className="font-mono text-xs text-[#11B981] break-all">
                                            {typeof window !== 'undefined' ? window.location.href : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estado: Revocado */}
                        {status === 'revoked' && result && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl overflow-hidden">
                                <div className="p-6 md:p-8">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                            <X className="w-6 h-6 text-white" strokeWidth={3} />
                                        </div>
                                        <div>
                                            <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-2xl font-bold text-red-400 mb-1">
                                                {t('revokedTitle')}
                                            </h2>
                                            <p className="font-[family-name:var(--font-inter)] text-red-400/80 text-sm">
                                                {result.message || t('revokedMessage')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                                            <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 mb-1">{t('studentLabel')}</p>
                                            <p className="font-[family-name:var(--font-inter)] text-white font-semibold">{result.student_name}</p>
                                        </div>

                                        {result.revoked_at && (
                                            <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                                                <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 mb-1">{t('revokedLabel')}</p>
                                                <p className="font-[family-name:var(--font-inter)] text-gray-300">{formatDate(result.revoked_at)}</p>
                                            </div>
                                        )}

                                        {result.revoked_reason && (
                                            <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                                                <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 mb-1">{t('reasonLabel')}</p>
                                                <p className="font-[family-name:var(--font-inter)] text-red-400">{result.revoked_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estado: Reemitido */}
                        {status === 'reissued' && result && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl overflow-hidden">
                                <div className="p-6 md:p-8">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                                            <AlertCircle className="w-6 h-6 text-black" strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-2xl font-bold text-amber-400 mb-1">
                                                {t('reissuedTitle')}
                                            </h2>
                                            <p className="font-[family-name:var(--font-inter)] text-amber-400/80 text-sm">
                                                {result.message || t('reissuedMessage')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                                            <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 mb-1">{t('studentLabel')}</p>
                                            <p className="font-[family-name:var(--font-inter)] text-white font-semibold">{result.student_name}</p>
                                        </div>

                                        <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                                            <p className="font-[family-name:var(--font-inter)] text-amber-400 text-sm">{t('reissuedContact')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estado: No encontrado */}
                        {status === 'not-found' && (
                            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 md:p-8">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-gray-300 mb-1">
                                            {t('notFoundTitle')}
                                        </h2>
                                        <p className="font-[family-name:var(--font-inter)] text-gray-500 text-sm">{errorMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estado: Error */}
                        {status === 'error' && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 md:p-8">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                        <X className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-red-400 mb-1">
                                            {t('errorTitle')}
                                        </h2>
                                        <p className="font-[family-name:var(--font-inter)] text-red-400/80 text-sm">{errorMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botón para verificar otro */}
                        {status !== 'idle' && status !== 'loading' && (
                            <button
                                onClick={handleReset}
                                className="font-[family-name:var(--font-inter)] mt-6 px-5 py-3 border border-gray-700 text-gray-400 font-semibold rounded-lg flex items-center gap-2 hover:border-[#11B981] hover:text-[#11B981] transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t('verifyAnotherButton')}
                            </button>
                        )}

                        {/* Información de ayuda */}
                        <div className="mt-12 pt-8 border-t border-gray-800">
                            <p className="font-[family-name:var(--font-inter)] text-sm font-semibold text-gray-400 mb-4">
                                {t('howItWorksTitle')}
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="text-[#11B981]">→</span>
                                    <span className="font-[family-name:var(--font-inter)] text-gray-500 text-sm">{t('howItWorksPoint1')}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-[#11B981]">→</span>
                                    <span className="font-[family-name:var(--font-inter)] text-gray-500 text-sm">{t('howItWorksPoint2')}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-[#11B981]">→</span>
                                    <span className="font-[family-name:var(--font-inter)] text-gray-500 text-sm">{t('howItWorksPoint3')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Back Link */}
                        <div className="text-center mt-8">
                            <Link
                                href={`/${locale}`}
                                className="font-[family-name:var(--font-inter)] text-sm text-gray-500 hover:text-[#11B981] transition-colors"
                            >
                                ← {t('backToHome')}
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
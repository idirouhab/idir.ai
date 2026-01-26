'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, X, AlertCircle, Search, FileText, Image as ImageIcon, ArrowLeft, Linkedin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo-idirai-dark.png';
import { usePathname } from 'next/navigation';
import {
  trackCertificateView,
  trackCertificateDownload,
  trackCertificateShareLinkedIn
} from '@/lib/analytics';

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
    const pathname = usePathname();
    const t = useTranslations('certificates.verify');
    const nav = useTranslations('nav');
    const footer = useTranslations('footer');
    const contact = useTranslations('contact');
    const tCommon = useTranslations('common');
    const tAria = useTranslations('aria');
    const [certificateId, setCertificateId] = useState(initialCertificateId || '');
    const [status, setStatus] = useState<VerificationStatus>(
        initialCertificateId && initialCertificateId.trim() ? 'loading' : 'idle'
    );
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);

    const handleLanguageChange = (newLocale: string) => {
        const pathWithoutLocale = pathname.replace(`/${locale}`, '');
        const targetUrl = `/${newLocale}${pathWithoutLocale}`;
        window.location.href = targetUrl;
    };

    const navItems = [
        { href: `/${locale}/#about`, label: nav('about') },
        { href: `/${locale}/#services`, label: nav('services') },
        { href: `/${locale}/#podcast`, label: nav('podcast') },
        { href: `/${locale}/blog`, label: nav('blog') },
        { href: `/${locale}/subscribe`, label: nav('newsletter') },
        { href: `/${locale}/courses`, label: nav('courses') },
        { href: `/${locale}/#contact`, label: nav('contact') },
    ];

    const verifyInternal = useCallback(async (certId: string) => {
        setStatus('loading');
        setErrorMessage('');
        setResult(null);

        try {
            const response = await fetch(`/api/certificates/verify/${certId}?lang=${locale}`);
            const data = await response.json();

            if (response.ok && data.found) {
                setResult(data);

                // Track certificate view with first-visit detection
                const viewKey = `cert_viewed_${certId}`;
                const hasViewedBefore = localStorage.getItem(viewKey);
                const isFirstVisit = !hasViewedBefore;

                // Mark as viewed
                if (isFirstVisit) {
                    localStorage.setItem(viewKey, new Date().toISOString());
                }

                // Track in Google Analytics
                trackCertificateView(certId, data.course_title, isFirstVisit);

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

    // Detect LinkedIn share completion
    useEffect(() => {
        if (!result) return;

        // Check if user came from LinkedIn (UTM parameters)
        const params = new URLSearchParams(window.location.search);
        if (params.get('utm_source') === 'linkedin' && params.get('shared_cert')) {
            trackCertificateShareLinkedIn(result.certificate_id, result.course_title, 'completed');
        }

        // Detect when user returns to tab after opening LinkedIn
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const linkedInOpened = sessionStorage.getItem('linkedin_share_opened');
                if (linkedInOpened) {
                    const timeSinceOpened = Date.now() - parseInt(linkedInOpened);
                    // If they return after 5+ seconds, likely they shared
                    if (timeSinceOpened > 5000) {
                        trackCertificateShareLinkedIn(result.certificate_id, result.course_title, 'completed');
                        sessionStorage.removeItem('linkedin_share_opened');
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [result]);

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

    const handleDownload = (format: 'pdf' | 'jpg') => {
        if (!result) return;

        // Track download in Google Analytics
        trackCertificateDownload(result.certificate_id, result.course_title, format);

        // Open download URL
        const url = format === 'pdf' ? result.pdf_url : result.jpg_url;
        if (url) {
            window.open(url, '_blank');
        }
    };

    const handleShareLinkedIn = async () => {
        if (!result) return;

        const baseUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';

        // Add UTM parameters to track completed shares
        const certificateUrl = `${baseUrl}?utm_source=linkedin&utm_medium=social&utm_campaign=certificate_share&shared_cert=${result.certificate_id}`;

        const message = t('shareLinkedInMessage', { courseTitle: result.course_title });
        const fullText = `${message}\n\n${certificateUrl}`;

        // Track LinkedIn share click in Google Analytics
        trackCertificateShareLinkedIn(result.certificate_id, result.course_title, 'click');

        // Mark that LinkedIn was opened (for return detection)
        sessionStorage.setItem('linkedin_share_opened', Date.now().toString());

        // Copy suggested text to clipboard
        try {
            await navigator.clipboard.writeText(fullText);
            setShowCopiedMessage(true);
            setTimeout(() => setShowCopiedMessage(false), 3000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }

        // Open LinkedIn share dialog
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&text=${encodeURIComponent(fullText)}`;
        window.open(linkedInUrl, '_blank', 'width=600,height=600');
    };

    return (
        <>
            <a href="#main-content" className="skip-to-content">
                Skip to main content
            </a>

            {/* Light Mode Navigation */}
            <nav
                className="fixed w-full z-50 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200"
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex-shrink-0">
                            <a
                                href={`/${locale}`}
                                className="flex items-center hover:opacity-80 transition-opacity"
                                aria-label={tAria('logoHome')}
                            >
                                <Image
                                    src={logo}
                                    alt="idir.ai"
                                    className="h-8 w-auto"
                                    priority
                                />
                            </a>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1" role="menubar">
                            {navItems.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="px-4 py-2 text-sm font-bold transition-all uppercase tracking-wide text-gray-700 hover:text-[#10b981]"
                                    role="menuitem"
                                >
                                    {item.label}
                                </a>
                            ))}
                            <div className="ml-6 flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" x2="22" y1="12" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                <button
                                    onClick={() => handleLanguageChange('en')}
                                    className={`text-sm font-medium transition-colors ${
                                        locale === 'en'
                                            ? 'text-gray-900 font-bold'
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                    aria-label="Switch to English"
                                >
                                    EN
                                </button>
                                <span className="text-gray-400">/</span>
                                <button
                                    onClick={() => handleLanguageChange('es')}
                                    className={`text-sm font-medium transition-colors ${
                                        locale === 'es'
                                            ? 'text-gray-900 font-bold'
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                    aria-label="Cambiar a Español"
                                >
                                    ES
                                </button>
                            </div>
                        </div>

                        {/* Mobile - Just Language Switcher */}
                        <div className="md:hidden flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" x2="22" y1="12" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            <button
                                onClick={() => handleLanguageChange('en')}
                                className={`text-sm font-medium transition-colors ${
                                    locale === 'en'
                                        ? 'text-gray-900 font-bold'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                                aria-label="Switch to English"
                            >
                                EN
                            </button>
                            <span className="text-gray-400">/</span>
                            <button
                                onClick={() => handleLanguageChange('es')}
                                className={`text-sm font-medium transition-colors ${
                                    locale === 'es'
                                        ? 'text-gray-900 font-bold'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                                aria-label="Cambiar a Español"
                            >
                                ES
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main id="main-content" role="main" className="min-h-screen bg-gray-100">
                <section className="pt-32 pb-12 md:pt-24 md:pb-24 px-4 md:px-6">
                    <div className="max-w-3xl mx-auto">

                        {/* Page Header */}
                        <div className="mb-8 md:mb-16">
                            <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 md:mb-6">
                                {t('title')}{' '}
                                <span className="text-[#11B981]">{t('titleHighlight')}</span>
                            </h1>
                            <p className="font-[family-name:var(--font-inter)] text-base md:text-xl text-gray-700 max-w-2xl">
                                {t('description')}
                            </p>
                            <p className="font-[family-name:var(--font-inter)] text-sm text-gray-600 mt-2">
                                {t('format')}
                            </p>
                        </div>

                        {/* Formulario de verificación */}
                        <div className="bg-white/80 border border-gray-200 rounded-xl p-6 md:p-8 mb-8 shadow-sm">
                            <label
                                htmlFor="certificateId"
                                className="font-[family-name:var(--font-inter)] block text-sm font-semibold text-gray-700 mb-3"
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
                                    className="font-[family-name:var(--font-inter)] flex-1 px-4 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono text-sm placeholder-gray-400 focus:outline-none focus:border-[#11B981] focus:ring-1 focus:ring-[#11B981] transition-colors disabled:opacity-50"
                                />

                                <button
                                    onClick={handleVerify}
                                    disabled={status === 'loading'}
                                    className="font-[family-name:var(--font-space-grotesk)] px-6 py-3.5 bg-[#11B981] text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#0ea472] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Search className="w-5 h-5" />
                                    <span>{status === 'loading' ? t('verifyingButton') : t('verifyButton')}</span>
                                </button>
                            </div>
                        </div>

                        {/* Estado: Cargando */}
                        {status === 'loading' && (
                            <div className="bg-white/80 border border-gray-200 rounded-xl p-8 text-center shadow-sm">
                                <div className="inline-block w-10 h-10 rounded-full border-2 border-gray-300 border-t-[#11B981] animate-spin mb-4" />
                                <p className="font-[family-name:var(--font-inter)] text-gray-600">{t('loading')}</p>
                            </div>
                        )}

                        {/* Estado: Válido */}
                        {status === 'valid' && result && (
                            <div className="bg-green-50/70 border border-green-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-6 md:p-8">
                                    {/* Header de éxito */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#11B981] flex items-center justify-center">
                                            <Check className="w-6 h-6 text-white" strokeWidth={3} />
                                        </div>
                                        <div>
                                            <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-2xl font-bold text-[#11B981] mb-1">
                                                {t('validTitle')}
                                            </h2>
                                            <p className="font-[family-name:var(--font-inter)] text-green-700 text-sm">
                                                {result.message || t('validMessage')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detalles del certificado */}
                                    <div className="space-y-3">
                                        <div className="bg-white/90 border border-gray-200 rounded-lg p-4">
                                            <p className="font-[family-name:var(--font-inter)] text-xs text-gray-600 mb-1">{t('studentLabel')}</p>
                                            <p className="font-[family-name:var(--font-inter)] text-gray-900 font-semibold">{result.student_name}</p>
                                        </div>

                                        <div className="bg-white/90 border border-gray-200 rounded-lg p-4">
                                            <p className="font-[family-name:var(--font-inter)] text-xs text-gray-600 mb-1">{t('courseLabel')}</p>
                                            <p className="font-[family-name:var(--font-inter)] text-gray-900 font-semibold">{result.course_title}</p>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <div className="bg-white/90 border border-gray-200 rounded-lg p-4">
                                                <p className="font-[family-name:var(--font-inter)] text-xs text-gray-600 mb-1">{t('completedLabel')}</p>
                                                <p className="font-[family-name:var(--font-inter)] text-gray-700">{formatDate(result.completed_at)}</p>
                                            </div>
                                            <div className="bg-white/90 border border-gray-200 rounded-lg p-4">
                                                <p className="font-[family-name:var(--font-inter)] text-xs text-gray-600 mb-1">{t('issuedLabel')}</p>
                                                <p className="font-[family-name:var(--font-inter)] text-gray-700">{formatDate(result.issued_at)}</p>
                                            </div>
                                        </div>

                                        <div className="bg-white/90 border border-gray-200 rounded-lg p-4">
                                            <p className="font-[family-name:var(--font-inter)] text-xs text-gray-600 mb-1">{t('certificateIdLabel')}</p>
                                            <p className="font-mono text-sm text-gray-700 break-all">{result.certificate_id}</p>
                                        </div>
                                    </div>

                                    {/* Botones de descarga */}
                                    {(result.pdf_url || result.jpg_url) && (
                                        <div className="mt-6 pt-6 border-t border-green-200">
                                            <p className="font-[family-name:var(--font-inter)] text-xs text-gray-700 font-semibold mb-3">{t('downloadTitle')}</p>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                {result.pdf_url && (
                                                    <button
                                                        onClick={() => handleDownload('pdf')}
                                                        className="font-[family-name:var(--font-space-grotesk)] flex items-center justify-center gap-2 px-4 py-3 bg-[#11B981] text-white font-bold rounded-lg hover:bg-[#0ea472] transition-colors"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        <span>{t('downloadPDF')}</span>
                                                    </button>
                                                )}
                                                {result.jpg_url && (
                                                    <button
                                                        onClick={() => handleDownload('jpg')}
                                                        className="font-[family-name:var(--font-space-grotesk)] flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
                                                    >
                                                        <ImageIcon className="w-4 h-4" />
                                                        <span>{t('downloadJPG')}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Share on LinkedIn */}
                                    <div className="mt-6 pt-6 border-t border-green-200">
                                        <button
                                            onClick={handleShareLinkedIn}
                                            className="font-[family-name:var(--font-space-grotesk)] w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#0077B5] text-white font-bold rounded-lg hover:bg-[#006399] transition-colors shadow-md"
                                        >
                                            <Linkedin className="w-5 h-5" />
                                            <span>{t('shareLinkedIn')}</span>
                                        </button>
                                        {showCopiedMessage && (
                                            <div className="mt-3 bg-[#0077B5]/10 border border-[#0077B5]/30 rounded-lg p-3 text-center">
                                                <p className="font-[family-name:var(--font-inter)] text-sm text-[#0077B5] font-medium">
                                                    ✓ {t('shareLinkedInTooltip')}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Compartir */}
                                    <div className="mt-6 bg-white/90 border border-gray-200 rounded-lg p-4">
                                        <p className="font-[family-name:var(--font-inter)] text-xs text-gray-600 mb-2">{t('shareInfo')}</p>
                                        <p className="font-mono text-xs text-[#11B981] break-all">
                                            {typeof window !== 'undefined' ? window.location.href : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estado: Revocado */}
                        {status === 'revoked' && result && (
                            <div className="bg-red-50/70 border border-red-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-6 md:p-8">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                            <X className="w-6 h-6 text-white" strokeWidth={3} />
                                        </div>
                                        <div>
                                            <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-2xl font-bold text-red-600 mb-1">
                                                {t('revokedTitle')}
                                            </h2>
                                            <p className="font-[family-name:var(--font-inter)] text-red-700 text-sm">
                                                {result.message || t('revokedMessage')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-white/90 border border-gray-200 rounded-lg p-4">
                                            <p className="font-[family-name:var(--font-inter)] text-xs text-gray-600 mb-1">{t('studentLabel')}</p>
                                            <p className="font-[family-name:var(--font-inter)] text-gray-900 font-semibold">{result.student_name}</p>
                                        </div>

                                        {result.revoked_at && (
                                            <div className="bg-white/90 border border-gray-200 rounded-lg p-4">
                                                <p className="font-[family-name:var(--font-inter)] text-xs text-gray-600 mb-1">{t('revokedLabel')}</p>
                                                <p className="font-[family-name:var(--font-inter)] text-gray-700">{formatDate(result.revoked_at)}</p>
                                            </div>
                                        )}

                                        {result.revoked_reason && (
                                            <div className="bg-white/90 border border-gray-200 rounded-lg p-4">
                                                <p className="font-[family-name:var(--font-inter)] text-xs text-gray-600 mb-1">{t('reasonLabel')}</p>
                                                <p className="font-[family-name:var(--font-inter)] text-red-600">{result.revoked_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estado: Reemitido */}
                        {status === 'reissued' && result && (
                            <div className="bg-amber-50/70 border border-amber-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-6 md:p-8">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                                            <AlertCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-2xl font-bold text-amber-700 mb-1">
                                                {t('reissuedTitle')}
                                            </h2>
                                            <p className="font-[family-name:var(--font-inter)] text-amber-800 text-sm">
                                                {result.message || t('reissuedMessage')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-white/90 border border-gray-200 rounded-lg p-4">
                                            <p className="font-[family-name:var(--font-inter)] text-xs text-gray-600 mb-1">{t('studentLabel')}</p>
                                            <p className="font-[family-name:var(--font-inter)] text-gray-900 font-semibold">{result.student_name}</p>
                                        </div>

                                        <div className="bg-white/90 border border-gray-200 rounded-lg p-4">
                                            <p className="font-[family-name:var(--font-inter)] text-amber-700 text-sm">{t('reissuedContact')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estado: No encontrado */}
                        {status === 'not-found' && (
                            <div className="bg-white/80 border border-gray-300 rounded-xl p-6 md:p-8 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-gray-700 mb-1">
                                            {t('notFoundTitle')}
                                        </h2>
                                        <p className="font-[family-name:var(--font-inter)] text-gray-600 text-sm">{errorMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estado: Error */}
                        {status === 'error' && (
                            <div className="bg-red-50/70 border border-red-200 rounded-xl p-6 md:p-8 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                        <X className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-red-600 mb-1">
                                            {t('errorTitle')}
                                        </h2>
                                        <p className="font-[family-name:var(--font-inter)] text-red-700 text-sm">{errorMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botón para verificar otro */}
                        {status !== 'idle' && status !== 'loading' && (
                            <button
                                onClick={handleReset}
                                className="font-[family-name:var(--font-inter)] mt-6 px-5 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg flex items-center gap-2 hover:border-[#11B981] hover:text-[#11B981] transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t('verifyAnotherButton')}
                            </button>
                        )}

                        {/* Información de ayuda */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <p className="font-[family-name:var(--font-inter)] text-sm font-semibold text-gray-700 mb-4">
                                {t('howItWorksTitle')}
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="text-[#11B981]">→</span>
                                    <span className="font-[family-name:var(--font-inter)] text-gray-600 text-sm">{t('howItWorksPoint1')}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-[#11B981]">→</span>
                                    <span className="font-[family-name:var(--font-inter)] text-gray-600 text-sm">{t('howItWorksPoint2')}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-[#11B981]">→</span>
                                    <span className="font-[family-name:var(--font-inter)] text-gray-600 text-sm">{t('howItWorksPoint3')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Back Link */}
                        <div className="text-center mt-8">
                            <Link
                                href={`/${locale}`}
                                className="font-[family-name:var(--font-inter)] text-sm text-gray-600 hover:text-[#11B981] transition-colors"
                            >
                                ← {t('backToHome')}
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Light Mode Footer */}
            <footer className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gray-100 border-t border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">
                                Idir Ouhab Meskine
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                {footer('descriptionStart')}
                                <span className="text-[#10b981] font-bold">{footer('descriptionN8n')}</span>
                                {footer('descriptionMiddle')}
                                <span className="italic font-bold text-[#10b981]">{footer('descriptionPodcast')}</span>
                                {footer('descriptionEnd')}
                            </p>
                            <div className="flex gap-3">
                                <div className="px-3 py-1 border border-[#10b981] text-[#10b981] text-xs font-bold uppercase rounded">
                                    {tCommon('badges.aiExpert')}
                                </div>
                                <div className="px-3 py-1 border border-[#10b981] text-[#10b981] text-xs font-bold uppercase rounded">
                                    {tCommon('badges.speaker')}
                                </div>
                                <div className="px-3 py-1 border border-[#10b981] text-[#10b981] text-xs font-bold uppercase rounded">
                                    {tCommon('badges.podcaster')}
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div>
                            <h4 className="font-black text-gray-900 mb-4 uppercase text-sm tracking-wider">{footer('nav')}</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a href={`/${locale}/#about`} className="text-gray-700 hover:text-[#10b981] transition-colors font-medium">
                                        → {nav('about')}
                                    </a>
                                </li>
                                <li>
                                    <a href={`/${locale}/#services`} className="text-gray-700 hover:text-[#10b981] transition-colors font-medium">
                                        → {nav('services')}
                                    </a>
                                </li>
                                <li>
                                    <a href={`/${locale}/#podcast`} className="text-gray-700 hover:text-[#10b981] transition-colors font-medium">
                                        → {nav('podcast')}
                                    </a>
                                </li>
                                <li>
                                    <a href={`/${locale}/#contact`} className="text-gray-700 hover:text-[#10b981] transition-colors font-medium">
                                        → {nav('contact')}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Social */}
                        <div>
                            <h4 className="font-black text-gray-900 mb-4 uppercase text-sm tracking-wider">{footer('connect')}</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a href="https://www.linkedin.com/in/idirouhab/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#10b981] transition-colors font-medium">
                                        → {contact('platforms.linkedin')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://x.com/idir_ouhab" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#10b981] transition-colors font-medium">
                                        → {contact('platforms.x')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.github.com/idirouhab" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#10b981] transition-colors font-medium">
                                        → {contact('platforms.github')}
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:hello@idir.ai" className="text-gray-700 hover:text-[#10b981] transition-colors font-medium">
                                        → {tCommon('email')}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                        <div>&copy; {new Date().getFullYear()} Idir Ouhab Meskine. {footer('copyright')}</div>
                        <div>
                            {footer('builtStart')}
                            <span className="text-[#10b981]">{footer('builtNextjs')}</span>
                            {footer('builtComma1')}
                            <span className="text-[#10b981]">{footer('builtTypescript')}</span>
                            {footer('builtAnd')}
                            <span className="text-[#10b981]">{footer('builtTailwind')}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
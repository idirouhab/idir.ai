'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Course } from '@/lib/courses';
import {
    CheckCircle,
    Users,
    Calendar,
    Globe,
    ShieldCheck,
    ChevronRight,
    Clock,
    ArrowLeft
} from 'lucide-react';

type Props = {
    course: Course;
    locale: 'en' | 'es';
};

export default function DynamicCoursePage({ course, locale }: Props) {
    const t = useTranslations('courses.dynamic');
    const formRef = useRef<HTMLDivElement>(null);

    // Form state - initialize dynamically based on form fields
    // Safely destructure with defaults for optional fields
    const {
        hero,
        benefits,
        curriculum,
        logistics,
        donation,
        outcomes,
        pricing,
        commitment,
        form,
        instructors
    } = course.course_data || {};

    const initialFormData = form?.fields
        ? form.fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {} as Record<string, string>)
        : { firstName: '', lastName: '', email: '', country: '', birthYear: '' };

    const [formData, setFormData] = useState<Record<string, string>>(initialFormData);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [donationCommitment, setDonationCommitment] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const handleConfirmedSubmit = async () => {
        setShowConfirmModal(false);
        setStatus('sending');
        setErrorMessage(null);

        try {
            if (!form?.endpoint) {
                throw new Error('Form endpoint not configured');
            }

            const response = await fetch(form.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    language: locale,
                    termsAccepted,
                    donationCommitment,
                }),
            });

            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage(response.status === 409
                    ? t('errors.duplicate')
                    : t('errors.processing')
                );
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage(t('errors.connection'));
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-[#00ff88]/30">
            {/* Navigation */}
            <nav className="sticky top-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href={`/${locale}`} className="flex items-center gap-2 text-sm font-medium hover:text-[#00ff88] transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        {t('nav.back')}
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                            idir.ai / {t('nav.education')}
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
                <div className="grid lg:grid-cols-12 gap-16">

                    {/* LEFT COLUMN: Narrative & Details */}
                    <div className="lg:col-span-7 space-y-24">

                        {/* Hero Section */}
                        {hero && (
                            <>
                                <header>
                                    {hero.badge && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-xs font-bold uppercase tracking-widest mb-6">
                                            <span className="relative flex h-2 w-2">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
                                            </span>
                                            {hero.badge}
                                        </div>
                                    )}
                                    <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-8">
                                        {hero.title}
                                    </h1>
                                    {hero.subtitle && (
                                        <p className="text-xl lg:text-2xl text-slate-400 font-light leading-relaxed">
                                            {hero.subtitle}
                                        </p>
                                    )}
                                </header>

                                {/* Why this course exists (Problem/Solution) */}
                                {hero.description && (
                                    <section className="relative">
                                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00ff88] to-transparent opacity-20" />
                                        <h2 className="text-sm uppercase tracking-[0.3em] text-[#00ff88] font-bold mb-6">{t('section.objective')}</h2>
                                        <p className="text-xl text-slate-300 leading-relaxed italic">
                                            {hero.description}
                                        </p>
                                    </section>
                                )}
                            </>
                        )}

                        {/* Curriculum */}
                        {curriculum && curriculum.items && curriculum.items.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                    <ShieldCheck className="text-[#00ff88]" />
                                    {curriculum.label || t('curriculum.fallback')}
                                </h2>
                                <div className="grid gap-4">
                                    {curriculum.items.map((item, index) => (
                                        <div key={index} className="group p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-white group-hover:text-[#00ff88] transition-colors">
                                                    {item.title}
                                                </h3>
                                                <span className="text-xs font-mono text-slate-600">MOD_{index + 1}</span>
                                            </div>
                                            <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Benefits */}
                        {benefits && benefits.length > 0 && (
                            <section className="grid sm:grid-cols-2 gap-8">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="space-y-4">
                                        <div className="text-3xl">{benefit.icon}</div>
                                        <h3 className="text-xl font-bold text-white">{benefit.title}</h3>
                                        <p className="text-slate-400 leading-relaxed">{benefit.description}</p>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Outcomes / Learning Objectives */}
                        {outcomes && outcomes.items && outcomes.items.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <CheckCircle className="text-[#00ff88]" />
                                    {outcomes.label}
                                </h2>
                                {outcomes.description && (
                                    <p className="text-slate-400 mb-6">{outcomes.description}</p>
                                )}
                                <div className="space-y-3">
                                    {outcomes.items.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-start">
                                            <span className="text-[#00ff88] mt-1">✓</span>
                                            <p className="text-slate-300">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Instructors */}
                        {instructors && instructors.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                    <Users className="text-[#00ff88]" />
                                    {instructors.length === 1 ? 'Instructor' : 'Instructors'}
                                </h2>
                                <div className="space-y-6">
                                    {instructors.map((instructor, index) => (
                                        <div key={index} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <div className="flex gap-4 items-start">
                                                {instructor.image && (
                                                    <img
                                                        src={instructor.image}
                                                        alt={instructor.name}
                                                        className="w-20 h-20 rounded-full object-cover border-2 border-[#00ff88]/30"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-white mb-1">{instructor.name}</h3>
                                                    <p className="text-[#00ff88] text-sm font-medium mb-3">{instructor.title}</p>
                                                    <p className="text-slate-400 text-sm leading-relaxed mb-3">{instructor.bio}</p>
                                                    {(instructor.linkedin || instructor.twitter || instructor.website) && (
                                                        <div className="flex gap-3">
                                                            {instructor.linkedin && (
                                                                <a
                                                                    href={instructor.linkedin.startsWith('http') ? instructor.linkedin : `https://${instructor.linkedin}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-slate-500 hover:text-[#00ff88] transition-colors text-xs"
                                                                >
                                                                    LinkedIn →
                                                                </a>
                                                            )}
                                                            {instructor.twitter && (
                                                                <a
                                                                    href={instructor.twitter.startsWith('http') ? instructor.twitter : `https://${instructor.twitter}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-slate-500 hover:text-[#00ff88] transition-colors text-xs"
                                                                >
                                                                    Twitter/X →
                                                                </a>
                                                            )}
                                                            {instructor.website && (
                                                                <a
                                                                    href={instructor.website.startsWith('http') ? instructor.website : `https://${instructor.website}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-slate-500 hover:text-[#00ff88] transition-colors text-xs"
                                                                >
                                                                    Website →
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sticky Conversion Card */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-28 space-y-6">

                            {/* Main Pricing/Action Card */}
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black">
                                {pricing && (
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                                {t('pricing.label')}
                                            </span>
                                            {logistics?.capacity && (
                                                <span className="text-[#00ff88] text-[10px] font-bold bg-[#00ff88]/10 px-2 py-0.5 rounded">
                             {logistics.capacity.number}
                          </span>
                                            )}
                                        </div>
                                        <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">
                          {pricing.isFree ? t('pricing.free') : `${pricing.currency === 'EUR' ? '€' : '$'}${pricing.amount}`}
                        </span>
                                            {pricing.discountPrice && (
                                                <span className="text-xl text-slate-600 line-through">
                                                    {pricing.currency === 'EUR' ? '€' : '$'}{pricing.amount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {logistics && (
                                    <div className="space-y-4 mb-8">
                                        {logistics.startDate && (
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <Calendar className="w-4 h-4 text-[#00ff88]" />
                                                <span>{logistics.startDate}</span>
                                            </div>
                                        )}
                                        {logistics.schedule && (
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <Clock className="w-4 h-4 text-[#00ff88]" />
                                                <span>{logistics.schedule}</span>
                                            </div>
                                        )}
                                        {logistics.scheduleDetail && (
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <Globe className="w-4 h-4 text-[#00ff88]" />
                                                <span>{logistics.scheduleDetail}</span>
                                            </div>
                                        )}
                                        {logistics.duration && (
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                                                <span>{logistics.duration}</span>
                                            </div>
                                        )}
                                        {logistics.hours && (
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <Clock className="w-4 h-4 text-[#00ff88]" />
                                                <span>{logistics.hours}</span>
                                            </div>
                                        )}
                                        {logistics.modality && (
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <Users className="w-4 h-4 text-[#00ff88]" />
                                                <span>{logistics.modality}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {form?.enabled && status !== 'success' ? (
                                    <button
                                        onClick={scrollToForm}
                                        className="w-full py-5 bg-[#00ff88] text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                                    >
                                        {t('registration.button')}
                                    </button>
                                ) : status === 'success' ? (
                                    <div className="text-center p-4 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-2xl">
                                        <p className="text-[#00ff88] font-bold">✓ {t('registration.registered')}</p>
                                    </div>
                                ) : null}

                                {logistics?.capacity?.waitlistText && (
                                    <p className="text-center text-[10px] text-slate-500 mt-6 uppercase tracking-widest">
                                        {logistics.capacity.waitlistText}
                                    </p>
                                )}
                            </div>

                            {/* Donation/Commitment info */}
                            {donation && (
                                <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/5 rounded-2xl p-6">
                                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                        <span className="text-lg">💚</span> {donation.label}
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                                        {donation.text}
                                    </p>
                                    <a href={donation.link} target="_blank" className="text-[10px] text-[#00ff88] font-bold hover:underline">
                                        {donation.linkText} →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* REGISTRATION FORM SECTION */}
                {form?.enabled && status !== 'success' && (
                    <div ref={formRef} className="mt-32 max-w-3xl mx-auto scroll-mt-32">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 lg:p-12">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-white mb-4">
                                    {t('form.title')}
                                </h2>
                                <p className="text-slate-400">{t('form.description')}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {form.fields ? (
                                    // Dynamic form fields
                                    form.fields.map((field, index) => (
                                        <div key={field.name} className={field.type === 'textarea' ? 'space-y-2' : ''}>
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                                                {field.label}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    name={field.name}
                                                    required={field.required ?? true}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 focus:border-[#00ff88] focus:outline-none transition-all"
                                                >
                                                    <option value="">{t('form.selectOption')}</option>
                                                    {field.options?.map((option) => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            ) : field.type === 'textarea' ? (
                                                <textarea
                                                    name={field.name}
                                                    required={field.required ?? true}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleInputChange}
                                                    placeholder={field.placeholder}
                                                    rows={4}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 focus:border-[#00ff88] focus:outline-none transition-all"
                                                />
                                            ) : (
                                                <input
                                                    name={field.name}
                                                    type={field.type}
                                                    required={field.required ?? true}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleInputChange}
                                                    placeholder={field.placeholder}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 focus:border-[#00ff88] focus:outline-none transition-all"
                                                />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    // Fallback to default fields for backwards compatibility
                                    <>
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t('form.fields.firstName')}</label>
                                                <input
                                                    name="firstName"
                                                    required
                                                    value={formData.firstName || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 focus:border-[#00ff88] focus:outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t('form.fields.lastName')}</label>
                                                <input
                                                    name="lastName"
                                                    required
                                                    value={formData.lastName || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 focus:border-[#00ff88] focus:outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t('form.fields.email')}</label>
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email || ''}
                                                onChange={handleInputChange}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 focus:border-[#00ff88] focus:outline-none transition-all"
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t('form.fields.country')}</label>
                                                <input
                                                    name="country"
                                                    required
                                                    value={formData.country || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 focus:border-[#00ff88] focus:outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t('form.fields.birthYear')}</label>
                                                <input
                                                    name="birthYear"
                                                    placeholder="YYYY"
                                                    value={formData.birthYear || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 focus:border-[#00ff88] focus:outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {form?.requiresCommitment && commitment && (
                                    <div className="p-6 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-2xl space-y-4">
                                        <label className="flex gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                required
                                                checked={donationCommitment}
                                                onChange={e => setDonationCommitment(e.target.checked)}
                                                className="mt-1 accent-[#00ff88]"
                                            />
                                            <span className="text-sm text-slate-300">{commitment.checkboxLabel}</span>
                                        </label>
                                        <div className="ml-7">
                                            <p className="text-xs text-[#00ff88] font-bold">{commitment.amountSuggestion}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">{commitment.note}</p>
                                        </div>
                                    </div>
                                )}

                                {form?.requiresTerms && (
                                    <label className="flex gap-3 cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            required
                                            checked={termsAccepted}
                                            onChange={e => setTermsAccepted(e.target.checked)}
                                            className="accent-[#00ff88]"
                                        />
                                        <span className="text-xs text-slate-500">
                                            {t('form.terms.prefix')}{' '}
                                            <Link href={`/${locale}/terms`} className="text-[#00ff88] hover:underline" target="_blank">
                                                {t('form.terms.termsLink')}
                                            </Link>
                                            {' '}{t('form.terms.and')}{' '}
                                            <Link href={`/${locale}/privacy`} className="text-[#00ff88] hover:underline" target="_blank">
                                                {t('form.terms.privacyLink')}
                                            </Link>
                                        </span>
                                    </label>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-[#00ff88] transition-all disabled:opacity-50"
                                >
                                    {status === 'sending' ? t('form.submitting') : t('form.submit')}
                                </button>

                                {status === 'error' && (
                                    <p className="text-center text-red-400 text-sm font-bold">{errorMessage}</p>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* SUCCESS STATE */}
                {status === 'success' && (
                    <div className="mt-20 text-center animate-in fade-in zoom-in duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#00ff88]/10 text-[#00ff88] text-4xl mb-6">🎉</div>
                        <h2 className="text-4xl font-bold text-white mb-4">
                            {t('success.title')}
                        </h2>
                        <p className="text-slate-400 max-w-md mx-auto">
                            {t('success.message')}
                        </p>
                    </div>
                )}
            </main>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
                    <div className="relative bg-[#111] border border-white/10 p-8 rounded-[2rem] max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {t('modal.title')}
                        </h3>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            {t('modal.message')}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                {t('modal.cancel')}
                            </button>
                            <button
                                onClick={handleConfirmedSubmit}
                                className="flex-1 py-3 bg-[#00ff88] text-black rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                            >
                                {t('modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Branding */}
            <footer className="py-20 border-t border-white/5 text-center">
                <p className="text-[10px] uppercase tracking-[0.5em] text-slate-700 font-bold">
                    idir.ai / {t('footer.tagline')}
                </p>
            </footer>
        </div>
    );
}
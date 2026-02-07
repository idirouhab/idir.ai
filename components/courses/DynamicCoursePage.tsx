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
    Clock,
    ArrowLeft,
    Award,
    Briefcase,
    BookOpen,
    Target,
    Zap,
    Heart,
    Star,
    TrendingUp,
    Lightbulb,
    Rocket,
    Code,
    GraduationCap,
    Coffee,
    Trophy,
    Sparkles,
    Brain,
    MessageSquare,
    Lock,
    Unlock,
    FileText,
    Video,
    Headphones,
    Smile,
    ThumbsUp,
    Download,
    Upload,
    Database,
    Server,
    Wifi,
    Settings,
    Wrench,
    Palette,
    Camera,
    Music,
    Film,
    Monitor,
    Smartphone,
    Tablet,
    Watch,
    Cpu,
    HardDrive,
    Network,
    Share2,
    Send,
    Mail,
    Phone,
    MapPin,
    Home,
    Building,
    Store,
    ShoppingCart,
    CreditCard,
    DollarSign,
    TrendingDown,
    BarChart,
    PieChart,
    Activity,
    AlertCircle,
    Info,
    HelpCircle,
    LucideIcon
} from 'lucide-react';
import Image from "next/image";
import CourseBreadcrumbs from './CourseBreadcrumbs';
import { LinkedInIcon, YouTubeIcon, XIcon, WebsiteIcon } from '@/components/icons/SocialIcons';

// Map of icon names to lucide-react components
const iconMap: Record<string, LucideIcon> = {
    CheckCircle,
    Users,
    Calendar,
    Globe,
    ShieldCheck,
    Clock,
    Award,
    Briefcase,
    BookOpen,
    Target,
    Zap,
    Heart,
    Star,
    TrendingUp,
    Lightbulb,
    Rocket,
    Code,
    GraduationCap,
    Coffee,
    Trophy,
    Sparkles,
    Brain,
    MessageSquare,
    Lock,
    Unlock,
    FileText,
    Video,
    Headphones,
    Smile,
    ThumbsUp,
    Download,
    Upload,
    Database,
    Server,
    Wifi,
    Settings,
    Wrench,
    Palette,
    Camera,
    Music,
    Film,
    Monitor,
    Smartphone,
    Tablet,
    Watch,
    Cpu,
    HardDrive,
    Network,
    Share2,
    Send,
    Mail,
    Phone,
    MapPin,
    Home,
    Building,
    Store,
    ShoppingCart,
    CreditCard,
    DollarSign,
    TrendingDown,
    BarChart,
    PieChart,
    Activity,
    AlertCircle,
    Info,
    HelpCircle,
};

// Helper component to render icon from string name
const DynamicIcon = ({ iconName, className = "w-8 h-8" }: { iconName: string; className?: string }) => {
    const Icon = iconMap[iconName];
    if (!Icon) {
        return <span className="text-2xl md:text-3xl">{iconName}</span>; // Fallback to emoji if not found
    }
    return <Icon className={className} />;
};

type Props = {
    course: Course;
    locale: 'en' | 'es';
};

export default function DynamicCoursePage({ course, locale }: Props) {
    const t = useTranslations('courses.dynamic');
    const formRef = useRef<HTMLDivElement>(null);

    // Helper function to translate duration units
    const translateUnit = (unit: string, value: number): string => {
        const unitLower = unit.toLowerCase();
        // If value is 1, use singular form; otherwise plural
        const key = value === 1 ? unitLower.replace(/s$/, '') : unitLower;
        return t(`units.${key}`) || unit;
    };

    // Helper function to format dates according to locale
    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch {
            return dateString;
        }
    };

    const getStartDateFromSessions = (): string | null => {
        const sessions = logistics?.sessions ?? [];
        if (sessions.length === 0) return null;
        const sorted = [...sessions].sort((a, b) => {
            const aParts = (a.date || '').split('/').map((v) => parseInt(v, 10));
            const bParts = (b.date || '').split('/').map((v) => parseInt(v, 10));
            if (aParts.length !== 3 || bParts.length !== 3) return 0;
            const aDate = new Date(aParts[2], (aParts[1] || 1) - 1, aParts[0] || 1);
            const bDate = new Date(bParts[2], (bParts[1] || 1) - 1, bParts[0] || 1);
            return aDate.getTime() - bDate.getTime();
        });
        return sorted[0]?.date || null;
    };

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
        form
    } = course.course_data || {};
    const sessions = logistics?.sessions ?? [];
    const timezoneLabel = logistics?.timezone || 'UTC';

    // Use relational instructors from course_instructors table
    const instructors = course.instructors && course.instructors.length > 0
        ? course.instructors.map(ci => ({
            name: `${ci.instructor.first_name} ${ci.instructor.last_name}`,
            // Priority: instructor's title > course-specific role > system role
            title: ci.instructor.title || ci.instructor_role || ci.instructor.role,
            bio: ci.instructor.description || '',
            image: ci.instructor.picture_url,
            linkedin: ci.instructor.linkedin_url,
            twitter: ci.instructor.x_url,
            website: ci.instructor.website_url,
            youtube: ci.instructor.youtube_url,
        }))
        : [];

    const initialFormData = form?.fields
        ? form.fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {} as Record<string, string>)
        : { firstName: '', lastName: '', email: '', country: '', birthYear: '' };

    const [formData, setFormData] = useState<Record<string, string>>(initialFormData);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [donationCommitment, setDonationCommitment] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showFullSchedule, setShowFullSchedule] = useState(false);
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

            const response = await fetch('/api/course-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: form.endpoint,
                    payload: {
                        ...formData,
                        courseId: course.id,
                        language: locale,
                        termsAccepted,
                        donationCommitment,
                    },
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
            <nav className="sticky top-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-3 md:py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href={`/${locale}`} className="flex items-center gap-2 text-xs md:text-sm font-medium hover:text-[#00ff88] transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">{t('nav.back')}</span>
                        <span className="sm:hidden">Back</span>
                    </Link>
                    <div className="flex items-center gap-2 md:gap-4">
                        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-slate-500 font-bold">
                            <span className="hidden sm:inline">idir.ai / </span>{t('nav.education')}
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 lg:py-20">
                {/* Breadcrumbs for Navigation and SEO */}
                <CourseBreadcrumbs
                    locale={locale}
                    courseTitle={course.title}
                    translations={{
                        home: t('nav.home'),
                        courses: t('nav.courses'),
                    }}
                />

                <div className="grid lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16">

                    {/* LEFT COLUMN: Narrative & Details */}
                    <div className="lg:col-span-7 space-y-12 md:space-y-16 lg:space-y-24">

                        {/* Hero Section */}
                        {hero && (
                            <>
                                <header>
                                    {hero.badge && (
                                        <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest mb-4 md:mb-6">
                                            <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-[#00ff88]"></span>
                                            </span>
                                            {hero.badge}
                                        </div>
                                    )}
                                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-4 md:mb-6 lg:mb-8">
                                        {hero.title}
                                    </h1>
                                    {hero.subtitle && (
                                        <p className="text-base md:text-xl lg:text-2xl text-slate-400 font-light leading-relaxed">
                                            {hero.subtitle}
                                        </p>
                                    )}
                                </header>

                                {/* Why this course exists (Problem/Solution) */}
                                {hero.description && (
                                    <section className="relative">
                                        <div className="absolute -left-4 md:-left-6 top-0 bottom-0 w-0.5 md:w-1 bg-gradient-to-b from-[#00ff88] to-transparent opacity-20" />
                                        <h2 className="text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#00ff88] font-bold mb-3 md:mb-6">{t('section.objective')}</h2>
                                        <p className="text-base md:text-xl text-slate-300 leading-relaxed italic">
                                            {hero.description}
                                        </p>
                                    </section>
                                )}
                            </>
                        )}

                        {/* Curriculum */}
                        {curriculum && curriculum.items && curriculum.items.length > 0 && (
                            <section>
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-8 flex items-center gap-2 md:gap-3">
                                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-[#00ff88]" />
                                    {curriculum.label || t('curriculum.fallback')}
                                </h2>
                                <div className="grid gap-3 md:gap-4">
                                    {curriculum.items.map((item, index) => (
                                        <div key={index} className="group p-4 md:p-6 bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl hover:bg-white/[0.04] transition-all">
                                            <div className="flex justify-between items-start mb-1.5 md:mb-2">
                                                <h3 className="text-base md:text-lg font-bold text-white group-hover:text-[#00ff88] transition-colors">
                                                    {item.title}
                                                </h3>
                                                <span className="text-[10px] md:text-xs font-mono text-slate-600">MOD_{index + 1}</span>
                                            </div>
                                            <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Benefits */}
                        {benefits && benefits.length > 0 && (
                            <section className="grid sm:grid-cols-2 gap-6 md:gap-8">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="space-y-3 md:space-y-4">
                                        <DynamicIcon iconName={benefit.icon} className="w-8 h-8 md:w-10 md:h-10 text-[#00ff88]" />
                                        <h3 className="text-lg md:text-xl font-bold text-white">{benefit.title}</h3>
                                        <p className="text-sm md:text-base text-slate-400 leading-relaxed">{benefit.description}</p>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Outcomes / Learning Objectives */}
                        {outcomes && outcomes.items && outcomes.items.length > 0 && (
                            <section>
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2 md:gap-3">
                                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-[#00ff88]" />
                                    {outcomes.label}
                                </h2>
                                {outcomes.description && (
                                    <p className="text-sm md:text-base text-slate-400 mb-4 md:mb-6">{outcomes.description}</p>
                                )}
                                <div className="space-y-2.5 md:space-y-3">
                                    {outcomes.items.map((item, index) => (
                                        <div key={index} className="flex gap-2 md:gap-3 items-start">
                                            <span className="text-[#00ff88] mt-0.5 md:mt-1">✓</span>
                                            <p className="text-sm md:text-base text-slate-300">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Instructors */}
                        {instructors && instructors.length > 0 && (
                            <section>
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-8 flex items-center gap-2 md:gap-3">
                                    <Users className="w-5 h-5 md:w-6 md:h-6 text-[#00ff88]" />
                                    {instructors.length === 1 ? 'Instructor' : 'Instructors'}
                                </h2>
                                <div className="space-y-4 md:space-y-6">
                                    {instructors.map((instructor, index) => (
                                        <div key={index} className="p-4 md:p-6 bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl">
                                            <div className="flex gap-3 md:gap-4 items-start">
                                                {instructor.image && (
                                                    <Image
                                                        src={instructor.image}
                                                        alt={instructor.name}
                                                        width={80}
                                                        height={80}
                                                        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-[#00ff88]/30"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">{instructor.name}</h3>
                                                    <p className="text-[#00ff88] text-xs md:text-sm font-medium mb-2 md:mb-3">{instructor.title}</p>
                                                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-2 md:mb-3">{instructor.bio}</p>
                                                    {(() => {
                                                        // Build array of available social links with icons
                                                        type SocialLink = { url: string; label: string; icon: React.ReactElement };
                                                        const socialLinks = [
                                                            instructor.linkedin && {
                                                                url: instructor.linkedin,
                                                                label: 'LinkedIn',
                                                                icon: <LinkedInIcon size={20} />
                                                            },
                                                            instructor.twitter && {
                                                                url: instructor.twitter,
                                                                label: 'X',
                                                                icon: <XIcon size={20} />
                                                            },
                                                            instructor.youtube && {
                                                                url: instructor.youtube,
                                                                label: 'YouTube',
                                                                icon: <YouTubeIcon size={20} />
                                                            },
                                                            instructor.website && {
                                                                url: instructor.website,
                                                                label: 'Website',
                                                                icon: <WebsiteIcon size={20} />
                                                            },
                                                        ].filter((link): link is SocialLink => Boolean(link)).slice(0, 3); // Take first 3 available links

                                                        return socialLinks.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2 md:gap-3">
                                                                {socialLinks.map((link, idx) => (
                                                                    <a
                                                                        key={idx}
                                                                        href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1.5 rounded-lg hover:bg-white/5 transition-all hover:scale-110"
                                                                        title={link.label}
                                                                    >
                                                                        {link.icon}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        ) : null;
                                                    })()}
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
                        <div className="lg:sticky lg:top-28 space-y-4 md:space-y-6">

                            {/* Main Pricing/Action Card */}
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl shadow-black">
                                {pricing && (
                                    <div className="mb-6 md:mb-8">
                                        <div className="flex justify-between items-center mb-1.5 md:mb-2">
                                            <span className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest">
                                                {t('pricing.label')}
                                            </span>
                                            {logistics?.capacity && (
                                                <span className="text-[#00ff88] text-[9px] md:text-[10px] font-bold bg-[#00ff88]/10 px-1.5 md:px-2 py-0.5 rounded">
                             {logistics.capacity.number}
                          </span>
                                            )}
                                        </div>
                                        <div className="flex items-baseline gap-2">
                        <span className="text-4xl md:text-5xl font-bold text-white">
                          {pricing.isFree ? t('pricing.free') : `${pricing.currency === 'EUR' ? '€' : '$'}${pricing.amount}`}
                        </span>
                                            {pricing.discountPrice && (
                                                <span className="text-lg md:text-xl text-slate-600 line-through">
                                                    {pricing.currency === 'EUR' ? '€' : '$'}{pricing.amount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {logistics && (
                                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                                        {(() => {
                                            const sessionStart = getStartDateFromSessions();
                                            const start = sessionStart || logistics.startDate;
                                            if (!start) return null;
                                            return (
                                                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-300">
                                                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00ff88] flex-shrink-0" />
                                                    <span className="truncate">{formatDate(start)}</span>
                                                </div>
                                            );
                                        })()}
                                        {logistics.schedule && sessions.length === 0 && (
                                            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-300">
                                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00ff88] flex-shrink-0" />
                                                <span className="truncate">
                                                    {typeof logistics.schedule === 'string'
                                                        ? logistics.schedule
                                                        : logistics.schedule.time_display}
                                                </span>
                                            </div>
                                        )}
                                        {logistics.total_hours && (
                                            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-300">
                                                <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00ff88] flex-shrink-0" />
                                                <span className="truncate">
                                                    {logistics.session_duration_hours || 0}h/session • {sessions.length} days • {sessions.length} sessions
                                                </span>
                                            </div>
                                        )}
                                        {sessions.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowFullSchedule(true)}
                                                className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-[#00ff88] font-bold uppercase tracking-wider md:tracking-widest hover:text-[#7dffbd] transition-colors"
                                            >
                                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00ff88] flex-shrink-0" />
                                                <span>View full schedule</span>
                                            </button>
                                        )}
                                        {logistics.duration && !logistics.total_hours && (
                                            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-300">
                                                <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00ff88] flex-shrink-0" />
                                                <span className="truncate">
                                                    {logistics.duration.value} {translateUnit(logistics.duration.unit, logistics.duration.value)}
                                                </span>
                                            </div>
                                        )}
                                        {logistics.modality && (
                                            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-300">
                                                <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00ff88] flex-shrink-0" />
                                                <span className="truncate">{logistics.modality}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {form?.enabled && status !== 'success' ? (
                                    <button
                                        onClick={scrollToForm}
                                        className="w-full py-4 md:py-5 bg-[#00ff88] text-black font-black rounded-xl md:rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] text-sm md:text-base"
                                    >
                                        {t('registration.button')}
                                    </button>
                                ) : status === 'success' ? (
                                    <div className="text-center p-3 md:p-4 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-xl md:rounded-2xl">
                                        <p className="text-[#00ff88] font-bold text-sm md:text-base">✓ {t('registration.registered')}</p>
                                    </div>
                                ) : null}

                                {logistics?.capacity?.waitlistText && (
                                    <p className="text-center text-[9px] md:text-[10px] text-slate-500 mt-4 md:mt-6 uppercase tracking-wider md:tracking-widest">
                                        {logistics.capacity.waitlistText}
                                    </p>
                                )}
                            </div>

                            {/* Donation/Commitment info */}
                            {donation && (
                                <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-6">
                                    <h4 className="text-xs md:text-sm font-bold text-white mb-2 flex items-center gap-2">
                                        <span className="text-base md:text-lg">💚</span> {donation.label}
                                    </h4>
                                    <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed mb-2 md:mb-3">
                                        {donation.text}
                                    </p>
                                    <a href={donation.link} target="_blank" className="text-[9px] md:text-[10px] text-[#00ff88] font-bold hover:underline">
                                        {donation.linkText} →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* REGISTRATION FORM SECTION */}
                {form?.enabled && status !== 'success' && (
                    <div ref={formRef} className="mt-16 md:mt-24 lg:mt-32 max-w-3xl mx-auto scroll-mt-24 md:scroll-mt-32">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-[2rem] lg:rounded-[2.5rem] p-5 md:p-8 lg:p-12">
                            <div className="text-center mb-8 md:mb-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
                                    {t('form.title')}
                                </h2>
                                <p className="text-sm md:text-base text-slate-400">{t('form.description')}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                                {form.fields ? (
                                    // Dynamic form fields
                                    form.fields.map((field, index) => (
                                        <div key={field.name} className={field.type === 'textarea' ? 'space-y-2' : ''}>
                                            <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest text-slate-500 ml-1">
                                                {field.label}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    name={field.name}
                                                    required={field.required ?? true}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-[#00ff88] focus:outline-none transition-all text-sm md:text-base"
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
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-[#00ff88] focus:outline-none transition-all text-sm md:text-base"
                                                />
                                            ) : (
                                                <input
                                                    name={field.name}
                                                    type={field.type}
                                                    required={field.required ?? true}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleInputChange}
                                                    placeholder={field.placeholder}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-[#00ff88] focus:outline-none transition-all text-sm md:text-base"
                                                />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    // Fallback to default fields for backwards compatibility
                                    <>
                                        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest text-slate-500 ml-1">{t('form.fields.firstName')}</label>
                                                <input
                                                    name="firstName"
                                                    required
                                                    value={formData.firstName || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-[#00ff88] focus:outline-none transition-all text-sm md:text-base"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest text-slate-500 ml-1">{t('form.fields.lastName')}</label>
                                                <input
                                                    name="lastName"
                                                    required
                                                    value={formData.lastName || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-[#00ff88] focus:outline-none transition-all text-sm md:text-base"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest text-slate-500 ml-1">{t('form.fields.email')}</label>
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email || ''}
                                                onChange={handleInputChange}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-[#00ff88] focus:outline-none transition-all text-sm md:text-base"
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest text-slate-500 ml-1">{t('form.fields.country')}</label>
                                                <input
                                                    name="country"
                                                    required
                                                    value={formData.country || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-[#00ff88] focus:outline-none transition-all text-sm md:text-base"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest text-slate-500 ml-1">{t('form.fields.birthYear')}</label>
                                                <input
                                                    name="birthYear"
                                                    placeholder="YYYY"
                                                    value={formData.birthYear || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4 focus:border-[#00ff88] focus:outline-none transition-all text-sm md:text-base"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {form?.requiresCommitment && commitment && (
                                    <div className="p-4 md:p-6 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-xl md:rounded-2xl space-y-3 md:space-y-4">
                                        <label className="flex gap-2 md:gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                required
                                                checked={donationCommitment}
                                                onChange={e => setDonationCommitment(e.target.checked)}
                                                className="mt-0.5 md:mt-1 accent-[#00ff88]"
                                            />
                                            <span className="text-xs md:text-sm text-slate-300">{commitment.checkboxLabel}</span>
                                        </label>
                                        <div className="ml-6 md:ml-7">
                                            <p className="text-[10px] md:text-xs text-[#00ff88] font-bold">{commitment.amountSuggestion}</p>
                                            <p className="text-[9px] md:text-[10px] text-slate-500 mt-1">{commitment.note}</p>
                                        </div>
                                    </div>
                                )}

                                {form?.requiresTerms && (
                                    <label className="flex gap-2 md:gap-3 cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            required
                                            checked={termsAccepted}
                                            onChange={e => setTermsAccepted(e.target.checked)}
                                            className="accent-[#00ff88] flex-shrink-0"
                                        />
                                        <span className="text-[10px] md:text-xs text-slate-500">
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
                                    className="w-full py-4 md:py-5 bg-white text-black font-black rounded-xl md:rounded-2xl hover:bg-[#00ff88] transition-all disabled:opacity-50 text-sm md:text-base"
                                >
                                    {status === 'sending' ? t('form.submitting') : t('form.submit')}
                                </button>

                                {status === 'error' && (
                                    <p className="text-center text-red-400 text-xs md:text-sm font-bold">{errorMessage}</p>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* SUCCESS STATE */}
                {status === 'success' && (
                    <div className="mt-12 md:mt-16 lg:mt-20 text-center animate-in fade-in zoom-in duration-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#00ff88]/10 text-[#00ff88] text-3xl md:text-4xl mb-4 md:mb-6">🎉</div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
                            {t('success.title')}
                        </h2>
                        <p className="text-sm md:text-base text-slate-400 max-w-md mx-auto px-4">
                            {t('success.message')}
                        </p>
                    </div>
                )}
            </main>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 md:px-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
                    <div className="relative bg-[#111] border border-white/10 p-5 md:p-8 rounded-xl md:rounded-[2rem] max-w-md w-full shadow-2xl">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">
                            {t('modal.title')}
                        </h3>
                        <p className="text-slate-400 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed">
                            {t('modal.message')}
                        </p>
                        <div className="flex gap-2 md:gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 md:py-3 text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest">
                                {t('modal.cancel')}
                            </button>
                            <button
                                onClick={handleConfirmedSubmit}
                                className="flex-1 py-2.5 md:py-3 bg-[#00ff88] text-black rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                            >
                                {t('modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Course Structured Data for SEO and LLMs */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Course",
                        name: course.title,
                        description: hero?.description || course.short_description,
                        abstract: course.short_description,
                        provider: {
                            "@type": "Person",
                            name: instructors && instructors.length > 0 ? instructors[0].name : "Idir Ouhab Meskine",
                            url: "https://idir.ai",
                            ...(instructors && instructors.length > 0 && instructors[0].bio && {
                                description: instructors[0].bio
                            })
                        },
                        ...(instructors && instructors.length > 0 && {
                            instructor: instructors.map((instructor: any) => {
                                const socialLinks = [
                                    instructor.linkedin,
                                    instructor.twitter,
                                    instructor.youtube,
                                    instructor.website
                                ].filter(Boolean);

                                return {
                                    "@type": "Person",
                                    name: instructor.name,
                                    ...(instructor.bio && { description: instructor.bio }),
                                    ...(instructor.title && { jobTitle: instructor.title }),
                                    ...(socialLinks.length > 0 && { sameAs: socialLinks })
                                };
                            })
                        }),
                        ...(course.cover_image && {
                            image: course.cover_image,
                            thumbnailUrl: course.cover_image
                        }),
                        ...(pricing && {
                            offers: {
                                "@type": "Offer",
                                category: pricing.isFree ? "Free" : "Paid",
                                price: pricing.isFree ? "0" : pricing.amount || "0",
                                priceCurrency: pricing.currency || "USD",
                                availability: "https://schema.org/InStock",
                                url: `https://idir.ai/${locale}/courses/${course.slug}`
                            }
                        }),
                        ...(logistics && {
                            ...(logistics.duration && {
                                timeRequired: `PT${logistics.duration.value}${logistics.duration.unit.charAt(0).toUpperCase()}`
                            }),
                            ...(logistics.startDate && {
                                startDate: logistics.startDate,
                                eventStatus: "https://schema.org/EventScheduled",
                                eventAttendanceMode: logistics.modality?.includes('online') || logistics.modality?.includes('virtual')
                                    ? "https://schema.org/OnlineEventAttendanceMode"
                                    : "https://schema.org/MixedEventAttendanceMode"
                            }),
                            ...(logistics.modality && { courseMode: logistics.modality }),
                            ...(logistics.capacity && {
                                maximumAttendeeCapacity: parseInt(logistics.capacity.number) || 30
                            })
                        }),
                        ...(outcomes?.items && outcomes.items.length > 0 && {
                            educationalLevel: "Beginner to Intermediate",
                            learningResourceType: "Course",
                            teaches: outcomes.items,
                            coursePrerequisites: hero?.subtitle || "No prerequisites required",
                            educationalCredentialAwarded: outcomes.label || "Course Completion"
                        }),
                        ...(curriculum?.items && curriculum.items.length > 0 && {
                            syllabusSections: curriculum.items.map((item: any, index: number) => ({
                                "@type": "Syllabus",
                                name: item.title,
                                description: item.description,
                                position: index + 1
                            })),
                            numberOfSections: curriculum.items.length
                        }),
                        inLanguage: locale,
                        availableLanguage: [locale],
                        url: `https://idir.ai/${locale}/courses/${course.slug}`,
                        datePublished: course.created_at,
                        dateModified: course.updated_at,
                        isAccessibleForFree: pricing?.isFree || false,
                        ...(benefits && benefits.length > 0 && {
                            about: benefits.map((benefit: any) => benefit.title).join(", ")
                        })
                    })
                }}
            />

            {/* Additional Organization/Person Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Person",
                        name: "Idir Ouhab Meskine",
                        url: "https://idir.ai",
                        jobTitle: "Senior Solutions Engineer",
                        worksFor: {
                            "@type": "Organization",
                            name: "n8n"
                        },
                        teaches: {
                            "@type": "Course",
                            name: course.title
                        }
                    })
                }}
            />

            {/* Footer Branding */}
            <footer className="py-12 md:py-16 lg:py-20 border-t border-white/5 text-center px-4">
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-700 font-bold">
                    idir.ai / {t('footer.tagline')}
                </p>
            </footer>

            {showFullSchedule && sessions.length > 0 && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Full schedule"
                    onClick={() => setShowFullSchedule(false)}
                >
                    <div
                        className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-xl w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-xl font-bold text-white">Full Schedule</h3>
                                <p className="text-xs text-slate-400">
                                    {sessions.length} sessions • {logistics.session_duration_hours || 0}h per session
                                </p>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Timezone: {timezoneLabel}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFullSchedule(false)}
                                className="text-slate-400 hover:text-white text-lg leading-none px-2 py-1"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="mt-4 divide-y divide-white/10">
                            {sessions.map((s, idx) => (
                                <div key={`${s.date}-${s.start_time}-${idx}`} className="py-3 flex items-center justify-between gap-4">
                                    <div className="text-base text-white/90">{s.date}</div>
                                    <div className="text-sm text-slate-300 font-mono">
                                        {s.start_time}–{s.end_time}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowFullSchedule(false)}
                                className="px-4 py-2 text-xs font-bold rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

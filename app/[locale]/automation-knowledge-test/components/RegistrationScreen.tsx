import { useState } from 'react';
import { Mail, User, Shield, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface RegistrationScreenProps {
  onContinue: (userData: { name: string; email: string }) => void;
  locale: string;
  t: any;
}

export default function RegistrationScreen({ onContinue, locale, t }: RegistrationScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; gdpr?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; gdpr?: string } = {};

    if (!name.trim()) {
      newErrors.name = t('registration.errors.nameRequired');
    }

    if (!email.trim()) {
      newErrors.email = t('registration.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('registration.errors.emailInvalid');
    }

    if (!gdprConsent) {
      newErrors.gdpr = t('registration.errors.gdprRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onContinue({ name: name.trim(), email: email.trim() });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name && email && gdprConsent) {
      handleContinue();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#11b981] mb-6">
            <Shield size={32} className="text-black" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            {t('registration.title')}
          </h1>
          <p className="text-base text-gray-400 leading-relaxed">
            {t('registration.subtitle')}
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-3xl p-8 mb-6">
          {/* Name Field */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-bold text-white mb-3 uppercase tracking-wider">
              {t('registration.nameLabel')} <span className="text-[#ef4444]">*</span>
            </label>
            <div className="relative">
              <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                onKeyPress={handleKeyPress}
                placeholder={t('registration.namePlaceholder')}
                className={`w-full bg-black border-2 rounded-xl pl-12 pr-4 py-4 text-white text-base outline-none transition-all placeholder:text-gray-600 ${
                  errors.name ? 'border-[#ef4444]' : 'border-gray-800 focus:border-[#11b981]'
                }`}
                autoFocus
              />
            </div>
            {errors.name && (
              <p className="text-sm text-[#ef4444] mt-2 flex items-center gap-1">
                <span className="text-lg">•</span> {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-bold text-white mb-3 uppercase tracking-wider">
              {t('registration.emailLabel')} <span className="text-[#ef4444]">*</span>
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                onKeyPress={handleKeyPress}
                placeholder={t('registration.emailPlaceholder')}
                className={`w-full bg-black border-2 rounded-xl pl-12 pr-4 py-4 text-white text-base outline-none transition-all placeholder:text-gray-600 ${
                  errors.email ? 'border-[#ef4444]' : 'border-gray-800 focus:border-[#11b981]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-[#ef4444] mt-2 flex items-center gap-1">
                <span className="text-lg">•</span> {errors.email}
              </p>
            )}
          </div>

          {/* GDPR Consent */}
          <div className="border-t border-gray-800 pt-6">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={gdprConsent}
                  onChange={(e) => {
                    setGdprConsent(e.target.checked);
                    if (errors.gdpr) setErrors({ ...errors, gdpr: undefined });
                  }}
                  className="sr-only peer"
                />
                <div className={`w-6 h-6 rounded border-2 transition-all ${
                  errors.gdpr
                    ? 'border-[#ef4444]'
                    : gdprConsent
                      ? 'border-[#11b981] bg-[#11b981]'
                      : 'border-gray-700 group-hover:border-gray-600'
                }`}>
                  {gdprConsent && (
                    <svg className="w-full h-full text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-400 leading-relaxed flex-1">
                {t('registration.gdprConsentPart1')}{' '}
                <Link
                  href={`/${locale}/privacy`}
                  target="_blank"
                  className="text-[#11b981] hover:underline inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('registration.privacyPolicy')}
                  <ExternalLink size={12} />
                </Link>
                {' '}{t('registration.gdprConsentPart2')}{' '}
                <Link
                  href={`/${locale}/terms`}
                  target="_blank"
                  className="text-[#11b981] hover:underline inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('registration.termsConditions')}
                  <ExternalLink size={12} />
                </Link>
                . <span className="text-[#ef4444]">*</span>
              </span>
            </label>
            {errors.gdpr && (
              <p className="text-sm text-[#ef4444] mt-3 ml-10 flex items-center gap-1">
                <span className="text-lg">•</span> {errors.gdpr}
              </p>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!name || !email || !gdprConsent}
          className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-[#11b981] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
        >
          {t('registration.continueButton')}
          <ArrowRight size={20} />
        </button>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600 flex items-center justify-center gap-2">
            <Shield size={12} />
            {t('registration.securityNote')}
          </p>
        </div>
      </div>
    </div>
  );
}

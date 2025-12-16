'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import CourseStructuredData from './CourseStructuredData';

export default function Automation101() {
  const t = useTranslations('courses.automation101');
  const locale = useLocale();
  const formRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    birthYear: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [donationCommitment, setDonationCommitment] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show confirmation modal instead of submitting directly
    setShowConfirmModal(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmModal(false);
    setStatus('sending');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/courses/automation-101/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          country: formData.country,
          birthYear: formData.birthYear,
          language: locale,
          termsAccepted: termsAccepted,
          donationCommitment: donationCommitment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', country: '', birthYear: '' });
        setTermsAccepted(false);
        setDonationCommitment(false);
      } else {
        setStatus('error');
        if (response.status === 409) {
          setErrorMessage(t('form.errorDuplicate'));
        } else {
          setErrorMessage(t('form.error'));
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setStatus('error');
      setErrorMessage(t('form.error'));
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <CourseStructuredData locale={locale} />
      <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#0f0f0f]">
        {/* Nav */}
        <nav className="px-4 sm:px-8 py-6 bg-black/30 backdrop-blur-sm border-b border-[#00ff88]/20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="text-sm text-gray-300 hover:text-[#00ff88] transition-colors font-medium"
          >
            ← {t('backLink')}
          </Link>
          <span className="px-4 py-2 bg-[#00ff88] text-black font-bold text-xs rounded-full uppercase tracking-wider">
            {t('hero.badge')}
          </span>
        </div>
      </nav>

      {status !== 'success' ? (
        // Main Content View
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          {/* Hero Section */}
          <div className="mb-20 text-center">
            <div className="inline-block mb-4">
              <div className="h-1 w-20 bg-gradient-to-r from-[#00ff88] to-[#00cfff] rounded-full"></div>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
              {t('hero.title')}
            </h1>

            <p className="text-2xl sm:text-3xl text-gray-200 mb-10 leading-snug max-w-3xl mx-auto font-light">
              {t('hero.subtitle')}
            </p>

            <button
              onClick={scrollToForm}
              className="group px-10 py-5 bg-gradient-to-r from-[#00ff88] to-[#00cfff] text-black font-bold text-xl rounded-xl hover:shadow-[0_0_30px_rgba(0,255,136,0.5)] transition-all duration-300 hover:scale-105"
            >
              {t('form.submit')}
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Course intro */}
          <div className="mb-20 max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
              <p className="text-xl text-gray-100 leading-relaxed text-center">
                {t('overview.intro')}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-2 border-[#00ff88]/30 rounded-2xl p-8 hover:border-[#00ff88] transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,255,136,0.2)]">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t('overview.reason1.title')}
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {t('overview.reason1.description')}
              </p>
            </div>

            <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-2 border-[#00cfff]/30 rounded-2xl p-8 hover:border-[#00cfff] transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,207,255,0.2)]">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t('overview.reason3.title')}
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {t('overview.reason3.description')}
              </p>
            </div>
          </div>

          {/* FreeCodeCamp Support */}
          <div className="bg-gradient-to-br from-[#00ff88]/10 to-[#00cfff]/5 border-2 border-[#00ff88]/40 rounded-2xl p-8 mb-20">
            <div className="flex items-start gap-5">
              <div className="text-4xl">💚</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#00ff88] mb-3">
                  {t('overview.donationLabel')}
                </h3>
                <p className="text-lg text-gray-200 leading-relaxed mb-4">
                  {t('overview.donationText')}
                </p>
                <p className="text-base text-gray-300">
                  <a
                    href={t('overview.donationLink')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00ff88] hover:text-[#00cfff] underline font-semibold transition-colors"
                  >
                    {t('overview.donationCTA')} →
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">{t('logistics.label')}</h2>

            {/* Date & Schedule */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-[#00cfff]/30 rounded-2xl p-8 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">📅</div>
                <div>
                  <p className="text-xl text-white font-bold mb-2">{t('logistics.startDate')}</p>
                  <p className="text-lg text-gray-300">{t('logistics.schedule')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-6 border-t border-gray-700">
                <div className="text-4xl">🌎</div>
                <div>
                  <p className="text-xl text-white font-bold mb-2">Horarios LATAM</p>
                  <p className="text-lg text-gray-300">{t('logistics.scheduleDetail')}</p>
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div className="bg-gradient-to-br from-red-900/20 to-orange-900/10 border-2 border-red-500/30 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl">👥</div>
                <div>
                  <p className="text-2xl text-white font-bold mb-2">{t('logistics.capacityNumber')}</p>
                  <p className="text-lg text-gray-300 mb-3">{t('logistics.capacityReason')}</p>
                  <p className="text-base text-gray-400">{t('logistics.waitlistText')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Curriculum */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-white mb-3 text-center">{t('curriculum.label')}</h2>
            <p className="text-xl text-gray-300 mb-10 text-center">{t('curriculum.description')}</p>

            <div className="space-y-5">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-l-4 border-[#00ff88] rounded-xl p-6 hover:shadow-[0_0_30px_rgba(0,255,136,0.15)] transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-2">
                  {t('curriculum.items.item1.title')}
                </h3>
                <p className="text-lg text-gray-300">
                  {t('curriculum.items.item1.description')}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-l-4 border-[#00cfff] rounded-xl p-6 hover:shadow-[0_0_30px_rgba(0,207,255,0.15)] transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-2">
                  {t('curriculum.items.item2.title')}
                </h3>
                <p className="text-lg text-gray-300">
                  {t('curriculum.items.item2.description')}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-l-4 border-purple-500 rounded-xl p-6 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-2">
                  {t('curriculum.items.item3.title')}
                </h3>
                <p className="text-lg text-gray-300">
                  {t('curriculum.items.item3.description')}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-l-4 border-orange-500 rounded-xl p-6 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-2">
                  {t('curriculum.items.item4.title')}
                </h3>
                <p className="text-lg text-gray-300">
                  {t('curriculum.items.item4.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Sign-up Form */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-2 border-[#00ff88]/40 rounded-2xl p-10" ref={formRef}>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{t('form.label')}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-white font-semibold mb-2 text-lg">
                    {t('form.firstName')}
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    minLength={2}
                    placeholder={t('form.firstNamePlaceholder')}
                    className="w-full px-5 py-4 bg-black/50 text-white text-lg border-2 border-gray-700 rounded-xl focus:border-[#00ff88] focus:outline-none transition-colors"
                    disabled={status === 'sending'}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-white font-semibold mb-2 text-lg">
                    {t('form.lastName')}
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    minLength={2}
                    placeholder={t('form.lastNamePlaceholder')}
                    className="w-full px-5 py-4 bg-black/50 text-white text-lg border-2 border-gray-700 rounded-xl focus:border-[#00ff88] focus:outline-none transition-colors"
                    disabled={status === 'sending'}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-white font-semibold mb-2 text-lg">
                  {t('form.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder={t('form.emailPlaceholder')}
                  className="w-full px-5 py-4 bg-black/50 text-white text-lg border-2 border-gray-700 rounded-xl focus:border-[#00ff88] focus:outline-none transition-colors"
                  disabled={status === 'sending'}
                />
              </div>

              {/* Statistical Information */}
              <div className="border-t border-gray-700 pt-6">
                <p className="text-sm text-gray-400 mb-4 italic">{t('form.statisticsNote')}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-white font-semibold mb-2 text-lg">
                      {t('form.country')}
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-5 py-4 bg-black/50 text-white text-lg border-2 border-gray-700 rounded-xl focus:border-[#00ff88] focus:outline-none transition-colors"
                      disabled={status === 'sending'}
                    >
                      <option value="">{t('form.countryPlaceholder')}</option>
                      <option value="ES">España</option>
                      <option value="MX">México</option>
                      <option value="AR">Argentina</option>
                      <option value="CO">Colombia</option>
                      <option value="CL">Chile</option>
                      <option value="PE">Perú</option>
                      <option value="VE">Venezuela</option>
                      <option value="EC">Ecuador</option>
                      <option value="GT">Guatemala</option>
                      <option value="CU">Cuba</option>
                      <option value="BO">Bolivia</option>
                      <option value="DO">República Dominicana</option>
                      <option value="HN">Honduras</option>
                      <option value="PY">Paraguay</option>
                      <option value="SV">El Salvador</option>
                      <option value="NI">Nicaragua</option>
                      <option value="CR">Costa Rica</option>
                      <option value="PA">Panamá</option>
                      <option value="UY">Uruguay</option>
                      <option value="US">Estados Unidos</option>
                      <option value="BR">Brasil</option>
                      <option value="PT">Portugal</option>
                      <option value="OTHER">Otro</option>
                    </select>
                  </div>

                  {/* Birth Year */}
                  <div>
                    <label htmlFor="birthYear" className="block text-white font-semibold mb-2 text-lg">
                      {t('form.birthYear')}
                    </label>
                    <input
                      id="birthYear"
                      name="birthYear"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      value={formData.birthYear}
                      onChange={handleInputChange}
                      required
                      placeholder={t('form.birthYearPlaceholder')}
                      className="w-full px-5 py-4 bg-black/50 text-white text-lg border-2 border-gray-700 rounded-xl focus:border-[#00ff88] focus:outline-none transition-colors"
                      disabled={status === 'sending'}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              {/* Donation Commitment Section */}
              <div className="border-t-2 border-gray-700 pt-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {t('form.commitment.title')}
                </h3>
                <p className="text-[#00ff88] text-lg font-bold mb-3">
                  {t('form.commitment.amountSuggestion')}
                </p>
                <p className="text-sm text-gray-400 mb-5 italic">
                  {t('form.commitment.note')}
                </p>

                <label className="flex items-start gap-3 cursor-pointer bg-gradient-to-r from-[#00ff88]/10 to-[#00cfff]/10 border-2 border-[#00ff88]/40 rounded-xl p-5 hover:border-[#00ff88]/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={donationCommitment}
                    onChange={(e) => setDonationCommitment(e.target.checked)}
                    required
                    className="mt-1 w-6 h-6 rounded border-gray-700 text-[#00ff88] focus:ring-2 focus:ring-[#00ff88] cursor-pointer"
                  />
                  <span className="text-base text-white font-medium leading-relaxed">
                    {t('form.commitment.checkboxLabel')}
                  </span>
                </label>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="mt-1 w-6 h-6 rounded border-gray-700 text-[#00ff88] focus:ring-2 focus:ring-[#00ff88] cursor-pointer"
                />
                <span className="text-base text-gray-300">
                  {t('form.terms.label')}{' '}
                  <Link href={`/${locale}/terms`} className="text-[#00ff88] hover:underline font-medium" target="_blank">
                    {t('form.terms.termsLink')}
                  </Link>
                  {' '}{t('form.terms.and')}{' '}
                  <Link href={`/${locale}/privacy`} className="text-[#00ff88] hover:underline font-medium" target="_blank">
                    {t('form.terms.privacyLink')}
                  </Link>.
                </span>
              </label>

              {/* Error Message */}
              {status === 'error' && errorMessage && (
                <div className="p-5 border-2 border-red-500 bg-red-500/10 text-red-400 rounded-xl text-base">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'sending' || !termsAccepted || !donationCommitment}
                className="w-full px-10 py-5 bg-gradient-to-r from-[#00ff88] to-[#00cfff] text-black font-bold text-xl rounded-xl hover:shadow-[0_0_30px_rgba(0,255,136,0.5)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {status === 'sending' ? t('form.sending') : t('form.submit')}
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Success View
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-2 border-[#00ff88] rounded-2xl p-10 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-[#00ff88] to-[#00cfff] rounded-full mb-8 shadow-[0_0_40px_rgba(0,255,136,0.4)]">
              <svg className="w-14 h-14 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('form.success.title')}
            </h2>
            <p className="text-xl text-gray-200 mb-10">
              {t('form.success.message')}
            </p>

            <Link href={`/${locale}`} className="text-gray-300 hover:text-[#00ff88] transition-colors font-semibold text-lg">
              ← {t('backLink')}
            </Link>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-[#00ff88] rounded-2xl p-8 max-w-2xl w-full shadow-[0_0_60px_rgba(0,255,136,0.3)]">
            <h3 className="text-3xl font-bold text-white mb-4">
              {t('form.confirmModal.title')}
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              {t('form.confirmModal.intro')}
            </p>

            <div className="space-y-5 mb-8">
              {/* Point 1 */}
              <div className="bg-black/30 border-l-4 border-[#00ff88] p-5 rounded-r-lg">
                <h4 className="text-xl font-bold text-[#00ff88] mb-2">
                  {t('form.confirmModal.point1.title')}
                </h4>
                <p className="text-gray-300">
                  {t('form.confirmModal.point1.description')}
                </p>
              </div>

              {/* Point 2 */}
              <div className="bg-black/30 border-l-4 border-[#ff0055] p-5 rounded-r-lg">
                <h4 className="text-xl font-bold text-[#ff0055] mb-2">
                  {t('form.confirmModal.point2.title')}
                </h4>
                <p className="text-gray-300">
                  {t('form.confirmModal.point2.description')}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg rounded-xl transition-colors"
              >
                {t('form.confirmModal.cancel')}
              </button>
              <button
                onClick={handleConfirmedSubmit}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-[#00ff88] to-[#00cfff] text-black font-bold text-lg rounded-xl hover:shadow-[0_0_30px_rgba(0,255,136,0.5)] transition-all duration-300"
              >
                {t('form.confirmModal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

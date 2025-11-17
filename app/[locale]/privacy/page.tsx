import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'privacy' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#050505] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black border-2 border-gray-700 p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-1 w-12 bg-[#ff006e]"></div>
              <span className="text-[#ff006e] font-bold uppercase tracking-wider text-sm">Legal</span>
              <div className="h-1 flex-1 bg-[#ff006e]"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-gray-400 text-sm">
              Last Updated: November 17, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-gray max-w-none">
            <div className="space-y-8 text-gray-300">

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                <p className="mb-4">
                  At idir.ai ("we," "our," or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, including our newsletter and podcast subscriptions.
                </p>
                <p className="mb-4">
                  By using our website, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this Privacy Policy, please do not access the site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>

                <h3 className="text-xl font-bold text-white mb-3 mt-4">2.1 Personal Information</h3>
                <p className="mb-4">
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Subscribe to our newsletter or podcast notifications</li>
                  <li>Contact us through forms on our website</li>
                  <li>Participate in quizzes or interactive features</li>
                </ul>
                <p className="mb-4">
                  This information may include:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Email address</li>
                  <li>Language preference (English or Spanish)</li>
                  <li>Subscription preferences (newsletter, podcast)</li>
                  <li>Any other information you choose to provide</li>
                </ul>

                <h3 className="text-xl font-bold text-white mb-3 mt-4">2.2 Automatically Collected Information</h3>
                <p className="mb-4">
                  When you visit our website, we may automatically collect certain information about your device, including:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Referring website</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Date and time of visit</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                <p className="mb-4">
                  We use the information we collect in the following ways:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>Newsletter and Podcast Delivery:</strong> To send you daily AI news updates and/or podcast episode notifications based on your subscription preferences</li>
                  <li><strong>Communication:</strong> To respond to your inquiries, comments, or feedback</li>
                  <li><strong>Service Improvement:</strong> To understand how users interact with our website and improve our content and services</li>
                  <li><strong>Analytics:</strong> To analyze trends, track user engagement, and gather demographic information</li>
                  <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Newsletter and Subscription Management</h2>
                <p className="mb-4">
                  We offer two types of email subscriptions:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>Newsletter:</strong> Daily AI news and insights (available in English and Spanish)</li>
                  <li><strong>Podcast:</strong> Notifications about new podcast episodes (Spanish only)</li>
                </ul>
                <p className="mb-4">
                  You can manage your subscription preferences at any time:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Click the unsubscribe link in any email we send you</li>
                  <li>Visit our unsubscribe page to update your preferences</li>
                  <li>Contact us directly to modify or cancel your subscriptions</li>
                </ul>
                <p className="mb-4">
                  Your email address and subscription preferences are stored securely and are only used for the purposes you have consented to.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>
                <p className="mb-4">
                  We use the following third-party services to operate our website and deliver our services:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>Mailgun:</strong> For sending newsletter and podcast notification emails</li>
                  <li><strong>n8n:</strong> For workflow automation and subscription management</li>
                  <li><strong>Hosting Services:</strong> For website hosting and data storage</li>
                </ul>
                <p className="mb-4">
                  These third-party services may have access to your personal information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose. We encourage you to review the privacy policies of these third-party services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking Technologies</h2>
                <p className="mb-4">
                  We may use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data that are sent to your browser from a website and stored on your device.
                </p>
                <p className="mb-4">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Data Security</h2>
                <p className="mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure data storage practices</li>
                </ul>
                <p className="mb-4">
                  However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
                <p className="mb-4">
                  We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                </p>
                <p className="mb-4">
                  When you unsubscribe from our newsletter or podcast notifications, we will retain your email address in our suppression list to ensure we do not send you future communications, but we will remove other associated data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Your Data Protection Rights</h2>
                <p className="mb-4">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>Access:</strong> Request copies of your personal information</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal information</li>
                  <li><strong>Restriction:</strong> Request restriction of processing of your personal information</li>
                  <li><strong>Data Portability:</strong> Request transfer of your information to another organization or directly to you</li>
                  <li><strong>Objection:</strong> Object to our processing of your personal information</li>
                </ul>
                <p className="mb-4">
                  To exercise any of these rights, please contact us using the information provided below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. International Data Transfers</h2>
                <p className="mb-4">
                  Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ from those in your jurisdiction.
                </p>
                <p className="mb-4">
                  If you are located outside Spain and choose to provide information to us, please note that we transfer the data to Spain and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Children's Privacy</h2>
                <p className="mb-4">
                  Our website is not intended for children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take necessary actions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">12. Changes to This Privacy Policy</h2>
                <p className="mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
                </p>
                <p className="mb-4">
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this Privacy Policy, or if you would like to exercise your data protection rights, please contact us:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Through the contact form on our website</li>
                  <li>By email at the address provided on the contact page</li>
                </ul>
                <p className="mb-4">
                  We will respond to your request within a reasonable timeframe.
                </p>
              </section>

            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t-2 border-gray-800">
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/en/terms"
                className="text-[#ff006e] hover:text-white transition-colors font-semibold uppercase text-sm"
              >
                Terms of Service
              </a>
              <span className="text-gray-600">•</span>
              <a
                href="/en"
                className="text-gray-400 hover:text-white transition-colors font-semibold uppercase text-sm"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

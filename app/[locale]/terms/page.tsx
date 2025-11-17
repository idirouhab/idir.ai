import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { getSiteDomain } from '@/lib/site-config';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'terms' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function TermsOfService() {
  const siteDomain = getSiteDomain();
  return (
    <div className="min-h-screen bg-[#050505] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black border-2 border-gray-700 p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-1 w-12 bg-[#00ff88]"></div>
              <span className="text-[#00ff88] font-bold uppercase tracking-wider text-sm">Legal</span>
              <div className="h-1 flex-1 bg-[#00ff88]"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
              Terms of Service
            </h1>
            <p className="text-gray-400 text-sm">
              Last Updated: November 17, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-gray max-w-none">
            <div className="space-y-8 text-gray-300">

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="mb-4">
                  By accessing and using {siteDomain} (&quot;the Website&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
                <p className="mb-4">
                  Permission is granted to temporarily access the materials (information or software) on {siteDomain} for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on {siteDomain}</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Newsletter Service</h2>
                <p className="mb-4">
                  By subscribing to our newsletter, you agree to receive periodic emails about AI news, updates, and related content. You can unsubscribe at any time by clicking the unsubscribe link in any email or by visiting the unsubscribe page on our website.
                </p>
                <p className="mb-4">
                  We offer two types of subscriptions:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li><strong>Newsletter:</strong> Daily AI news and insights</li>
                  <li><strong>Podcast:</strong> Notifications about new podcast episodes (Spanish only)</li>
                </ul>
                <p className="mb-4">
                  You can manage your subscription preferences at any time through the unsubscribe page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. User Content</h2>
                <p className="mb-4">
                  Any content you submit through our website (such as comments, feedback, or contact forms) may be used by {siteDomain} for any purpose. You grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute such content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Disclaimer</h2>
                <p className="mb-4">
                  The materials on {siteDomain} are provided on an &apos;as is&apos; basis. {siteDomain} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
                <p className="mb-4">
                  The information provided on this website is for general informational and educational purposes only. While we strive to provide accurate and up-to-date information about AI and technology, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability of the information, products, services, or related graphics contained on the website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Limitations</h2>
                <p className="mb-4">
                  In no event shall {siteDomain} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on {siteDomain}, even if {siteDomain} or an authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Accuracy of Materials</h2>
                <p className="mb-4">
                  The materials appearing on {siteDomain} could include technical, typographical, or photographic errors. {siteDomain} does not warrant that any of the materials on its website are accurate, complete, or current. {siteDomain} may make changes to the materials contained on its website at any time without notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Links</h2>
                <p className="mb-4">
                  {siteDomain} has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by {siteDomain} of the site. Use of any such linked website is at the user&apos;s own risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Modifications</h2>
                <p className="mb-4">
                  {siteDomain} may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
                <p className="mb-4">
                  These terms and conditions are governed by and construed in accordance with the laws of Spain and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Contact Information</h2>
                <p className="mb-4">
                  If you have any questions about these Terms of Service, please contact us through the contact form on our website or via email at the address provided on the contact page.
                </p>
              </section>

            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t-2 border-gray-800">
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/en/privacy"
                className="text-[#00ff88] hover:text-white transition-colors font-semibold uppercase text-sm"
              >
                Privacy Policy
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

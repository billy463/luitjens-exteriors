import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => {
    const title = 'Privacy Policy | Luitjens Exteriors';
    const description = 'Read how Luitjens Exteriors LLC collects, uses, and protects your information, including SMS consent and mobile data handling.';
    document.title = title;

    const setMeta = (attr, key, content) => {
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
  }, []);

  return (
    <main className="min-h-screen bg-dark text-white pt-[84px] md:pt-[96px]">
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-slate-400 mb-12">Last updated: April 25, 2026</p>

          <div className="space-y-10 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Information We Collect</h2>
              <p>
                We collect information you voluntarily submit through our website forms or chat widget, including your
                name, address, email address, phone number, and property details related to your project inquiry.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">How We Use Your Information</h2>
              <p>
                We use your information to respond to inquiries, schedule consultations, send appointment and project
                updates, and send promotional offers if you&apos;ve opted in.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">SMS / Text Messaging Consent</h2>
              <p>
                By providing your mobile phone number through our website forms or chat widget, you consent to receive
                SMS text messages from Luitjens Exteriors LLC, including transactional messages related to your inquiry
                and, if you separately opt in, promotional messages. Message frequency varies. Message and data rates
                may apply. You may opt out at any time by replying STOP to any message. Reply HELP for help. Consent to
                receive SMS messages is not a condition of any purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Mobile Information Sharing</h2>
              <p>
                No mobile information will be shared with third parties or affiliates for marketing or promotional
                purposes. Information sharing to subcontractors in support services, such as customer service, is
                permitted. All other categories exclude text messaging originator opt-in data and consent; this
                information will not be shared with any third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Cookies and Tracking</h2>
              <p>
                Our site uses cookies and similar technologies for performance and advertising measurement, including
                Google Ads conversion tracking and Meta Pixel.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Data Retention</h2>
              <p>
                We keep submitted information only as long as necessary to provide service, communicate about your
                project, or comply with legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Your Rights</h2>
              <p>
                You may request access to, correction of, or deletion of your information by contacting
                {' '}michaels@luitjens-exteriors.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. The latest version will always be posted at
                {' '}/privacy-policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Contact</h2>
              <div className="space-y-1">
                <p>Luitjens Exteriors LLC</p>
                <p>66 Adventura Dr, Festus, MO 63028</p>
                <p>michaels@luitjens-exteriors.com</p>
                <p>(314) 882-0973</p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

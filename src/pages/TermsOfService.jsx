import { useEffect } from 'react';

export default function TermsOfService() {
  useEffect(() => {
    const title = 'Terms of Service | Luitjens Exteriors';
    const description = 'Review the terms governing use of the Luitjens Exteriors website, quote estimates, and SMS communications.';
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
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Terms of Service</h1>
          <p className="text-slate-400 mb-12">Last updated: April 25, 2026</p>

          <div className="space-y-10 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Acceptance of Terms</h2>
              <p>
                By using this website, you agree to these Terms of Service and any applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Services Offered</h2>
              <p>
                Luitjens Exteriors LLC provides exterior renovation services for residential customers in the St. Louis
                metro area.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Quote and Estimate Disclaimer</h2>
              <p>
                Price ranges shown on /windows-landing are estimates only based on satellite imagery and self-reported
                counts. Final pricing requires an in-person consultation and may change based on measurements, product
                selection, access conditions, and scope.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">SMS Messaging Terms</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Message frequency varies based on inquiry status, typically 0-4 messages per inquiry.</li>
                <li>Message and data rates may apply depending on your mobile carrier plan.</li>
                <li>Opt-out at any time by replying STOP. Reply HELP for help.</li>
                <li>Carriers are not liable for delayed or undelivered messages.</li>
                <li>Consent to receive SMS messages is not a condition of purchase.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Limitation of Liability</h2>
              <p>
                Information on this website and quote tools is provided as-is for informational estimate purposes.
                Separate customer agreements govern actual project work, scheduling, materials, and warranties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, branding, images, and layout, is the property of
                Luitjens Exteriors LLC unless otherwise noted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Governing Law</h2>
              <p>These terms are governed by the laws of the State of Missouri.</p>
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


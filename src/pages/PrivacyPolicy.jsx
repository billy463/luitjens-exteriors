const effectiveDate = 'April 21, 2026';

export default function PrivacyPolicy() {
  return (
    <div className="bg-dark text-gray-200">
      <section className="border-b border-gray-800 bg-darker px-6 py-20">
        <div className="container mx-auto max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-primary">Privacy Policy</p>
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-gray-400">Effective date: {effectiveDate}</p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="container mx-auto max-w-3xl space-y-10 leading-7 text-gray-300">
          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">Who Operates This Website</h2>
            <p>
              This website is operated by Luitjens Exteriors LLC, 66 Adventura Dr, Festus, MO
              63028. You can contact us at{' '}
              <a href="mailto:michaels@luitjens-exteriors.com" className="text-primary hover:text-white">
                michaels@luitjens-exteriors.com
              </a>{' '}
              or{' '}
              <a href="tel:+13148820973" className="text-primary hover:text-white">
                (314) 882-0973
              </a>.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">Information We Collect</h2>
            <p>
              We collect information you choose to provide, including your name, phone number,
              email address, service address, and project details. For window quote tools, we may
              also pull property photos from public listing data for quoting purposes.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">How We Use It</h2>
            <p>
              We use your information to respond to your inquiry, provide quotes, schedule
              inspections, and communicate about requested exterior services. We do not sell your
              personal information to third parties, and we do not share it with companies that
              buy or resell customer inquiries.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">SMS and Phone Communication</h2>
            <p>
              This site collects phone numbers for purposes of responding to inquiries and
              providing service quotes. By providing a phone number, you consent to receive SMS
              messages from Luitjens Exteriors LLC related to your inquiry and service. Message
              frequency varies. Message and data rates may apply. Consent is not a condition of
              purchase. You may reply STOP to unsubscribe at any time or HELP for help.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">How To Contact Us</h2>
            <p>
              If you have questions about this policy or want to update your information, contact
              Luitjens Exteriors LLC at michaels@luitjens-exteriors.com or (314) 882-0973.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

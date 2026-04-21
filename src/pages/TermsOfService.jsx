const effectiveDate = 'April 21, 2026';

export default function TermsOfService() {
  return (
    <div className="bg-dark text-gray-200">
      <section className="border-b border-gray-800 bg-darker px-6 py-20">
        <div className="container mx-auto max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-primary">Terms of Service</p>
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">Terms of Service</h1>
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
            <h2 className="mb-3 text-2xl font-bold text-white">Services</h2>
            <p>
              Luitjens Exteriors LLC provides exterior contracting services, including windows,
              doors, siding, gutters, roofing, storm damage inspections, and related exterior
              repair or replacement work.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">Use of This Website</h2>
            <p>
              You may use this website to learn about our services, request information, submit
              project details, and contact our team. Please provide accurate information when
              requesting a quote or inspection.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">Quote Ranges and Estimates</h2>
            <p>
              Any quote ranges, pricing ranges, or project estimates shown on this website are for
              general planning purposes only. They are not binding offers or final prices. Final
              pricing depends on inspection, measurements, product selections, site conditions, and
              written agreement.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">Disclaimer of Warranties</h2>
            <p>
              This website is provided for general information. We work to keep information useful
              and accurate, but we do not guarantee that the website or any estimate tool will be
              error-free, uninterrupted, or suitable for every project condition.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">Limitation of Liability</h2>
            <p>
              To the fullest extent allowed by law, Luitjens Exteriors LLC is not liable for
              indirect, incidental, special, or consequential damages arising from use of this
              website or reliance on non-binding estimate ranges shown on the site.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">Governing Law</h2>
            <p>
              These terms are governed by the laws of the State of Missouri, without regard to
              conflict of law rules.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

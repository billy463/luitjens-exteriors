import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, CheckCircle2, Home, Phone, Quote, SunMedium, TrendingUp, Wrench } from 'lucide-react';
import { trackLeadConversion, trackPhoneConversion } from '../lib/googleAds';
import { trackMetaLead } from '../lib/metaPixel';

const faqs = [
  {
    question: 'What does window replacement usually cost?',
    answer:
      'Pricing depends on window count, style, and glass package. We provide a clear written quote with no hidden add-ons.',
  },
  {
    question: 'Will new windows actually lower my energy bill?',
    answer:
      'Modern insulated windows can reduce drafts and HVAC strain. During your quote, we explain expected efficiency gains for your home.',
  },
  {
    question: 'How disruptive is install day?',
    answer: 'Most projects finish in 1 to 2 days with full cleanup included. We confirm timeline before install begins.',
  },
];

const processSteps = [
  {
    title: 'Consultation',
    body: 'We inspect your current windows, discuss goals, and recommend practical options for your home.',
  },
  {
    title: 'Measure & Scope',
    body: 'We confirm exact measurements and installation details so pricing and timeline are clear.',
  },
  {
    title: 'Professional Install',
    body: 'Our crew installs each unit with attention to fit, sealing, and finish quality.',
  },
  {
    title: 'Warranty & Follow-Up',
    body: 'We walk the project with you and document warranty coverage for long-term confidence.',
  },
];

const initialForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  message: '',
};

export default function Windows() {
  const [formData, setFormData] = useState(initialForm);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    const previousTitle = document.title;
    const targetTitle = 'Window Replacement in St. Louis | Luitjens Exteriors';
    const targetDescription =
      'Need window replacement in St. Louis? Get a free estimate from Luitjens Exteriors. Local installation, honest pricing, and owner-led service.';

    document.title = targetTitle;

    let descriptionMeta = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionMeta?.getAttribute('content') || '';
    let createdMeta = false;

    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
      createdMeta = true;
    }

    descriptionMeta.setAttribute('content', targetDescription);

    return () => {
      document.title = previousTitle;
      if (descriptionMeta) {
        if (createdMeta) {
          descriptionMeta.remove();
        } else {
          descriptionMeta.setAttribute('content', previousDescription);
        }
      }
    };
  }, []);

  const phoneHref = 'tel:+13148820973';
  const formattedPhone = '(314) 882-0973';

  const objectionItems = useMemo(
    () => [
      {
        title: 'Concerned about cost?',
        detail: 'Get a clear written quote and financing options that fit your monthly budget.',
      },
      {
        title: 'Unsure if it helps energy bills?',
        detail: 'We show how upgraded glass and tighter seals improve comfort and reduce HVAC strain.',
      },
      {
        title: 'Worried about install disruption?',
        detail: 'Most installs are completed in 1 to 2 days with full cleanup included.',
      },
    ],
    []
  );

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(current => ({ ...current, [name]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitState({ status: 'loading', message: '' });

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to submit your request right now.');
      }

      trackMetaLead();
      trackLeadConversion();
      setSubmitState({
        status: 'success',
        message: 'Thanks, your request was sent. We will reach out shortly to schedule your free estimate.',
      });
      setFormData(initialForm);
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error.message || 'Unable to submit your request right now.',
      });
    }
  };

  return (
    <div className="w-full bg-dark pb-20 text-gray-200 md:pb-0">
      <section className="relative overflow-hidden border-b border-gray-800 bg-darker px-4 py-16 sm:px-6 sm:py-20">
        <div className="absolute inset-0 bg-[url('/images/doors-windows.jpeg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-darker/85 to-dark/75" />

        <div className="container relative z-10 mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-primary sm:text-sm">Window Replacement</p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
              Cut Your St. Louis Energy Bill and Get a Window Quote in 24 Hours
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl">
              Owner-led installs across St. Louis City, County, Jefferson, St. Charles, and Metro East with zero high-pressure sales tactics.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={phoneHref}
                onClick={trackPhoneConversion}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-white transition hover:bg-primary-dark"
              >
                <Phone className="h-5 w-5" />
                Call {formattedPhone}
              </a>
              <p className="text-sm text-gray-300">We will call or text within one business day. No spam. No pressure.</p>
            </div>

            <div className="mt-7 rounded-2xl border border-gray-700/70 bg-black/30 p-5">
              <div className="flex items-start gap-3">
                <Quote className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm leading-relaxed text-gray-200">
                  "They gave us a straightforward quote and finished in one day. The draft by our living room windows is gone."
                  <span className="block pt-1 text-gray-400">- Homeowner, St. Charles (name available on request)</span>
                </p>
              </div>
            </div>
          </div>

          <div id="windows-lead-form" className="rounded-3xl border border-gray-700 bg-dark/95 p-6 shadow-2xl sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Free Estimate</p>
            <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">Get My Free Window Quote</h2>
            <p className="mt-3 text-sm text-gray-300">Fast estimate. Clear scope. No-obligation pricing for your home.</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-bold text-gray-300">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-gray-700 bg-darker px-4 py-3 text-white outline-none transition focus:border-primary"
                  placeholder="Jane Smith"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-bold text-gray-300">
                    Phone *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    className="w-full rounded-xl border border-gray-700 bg-darker px-4 py-3 text-white outline-none transition focus:border-primary"
                    placeholder="(314) 000-0000"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-bold text-gray-300">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    inputMode="email"
                    required
                    className="w-full rounded-xl border border-gray-700 bg-darker px-4 py-3 text-white outline-none transition focus:border-primary"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="mb-2 block text-sm font-bold text-gray-300">
                  Project Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                  required
                  className="w-full rounded-xl border border-gray-700 bg-darker px-4 py-3 text-white outline-none transition focus:border-primary"
                  placeholder="123 Main St, St. Louis, MO"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-bold text-gray-300">
                  Project Details (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="3"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-700 bg-darker px-4 py-3 text-white outline-none transition focus:border-primary"
                  placeholder="Any specific concerns or goals?"
                />
              </div>

              <button
                type="submit"
                disabled={submitState.status === 'loading'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitState.status === 'loading' ? 'Submitting...' : 'Get My Free Window Quote'}
                <ArrowRight className="h-5 w-5" />
              </button>

              <p className="text-xs leading-relaxed text-gray-500">
                By submitting, you agree to be contacted by Luitjens Exteriors at the number and email provided, including via autodialed calls/texts. Consent is not required for purchase.
              </p>

              {submitState.message && (
                <p
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    submitState.status === 'success'
                      ? 'border-primary/30 bg-primary/10 text-gray-200'
                      : 'border-red-500/30 bg-red-500/10 text-red-200'
                  }`}
                >
                  {submitState.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-800 bg-dark py-10">
        <div className="container mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3 sm:px-6">
          {objectionItems.map(item => (
            <div key={item.title} className="rounded-2xl border border-gray-800 bg-darker p-5">
              <p className="text-lg font-black text-white">{item.title}</p>
              <p className="mt-2 text-sm text-gray-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-dark py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 grid gap-8 lg:grid-cols-2 lg:items-end">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Why homeowners replace their windows</h2>
              <p className="mt-4 text-gray-400">
                Most homeowners call us for comfort first, then realize the curb appeal and resale upside comes with it.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Process Overview</p>
              <p className="mt-2 text-gray-400">Consultation - Measure - Install - Warranty</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <article className="rounded-2xl border border-gray-800 bg-darker p-6">
              <SunMedium className="mb-4 h-9 w-9 text-primary" />
              <h3 className="text-xl font-bold text-white">Energy Savings</h3>
              <p className="mt-2 text-gray-400">Modern insulated glass and tighter seals help reduce drafts and seasonal HVAC demand.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-darker p-6">
              <Home className="mb-4 h-9 w-9 text-primary" />
              <h3 className="text-xl font-bold text-white">Aesthetics</h3>
              <p className="mt-2 text-gray-400">Updated frames and cleaner lines can transform the front elevation of your home.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-darker p-6">
              <TrendingUp className="mb-4 h-9 w-9 text-primary" />
              <h3 className="text-xl font-bold text-white">Resale Value</h3>
              <p className="mt-2 text-gray-400">Window upgrades can improve buyer confidence when your home goes to market.</p>
            </article>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-gray-800 bg-darker p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Step {index + 1}</p>
                <h3 className="mt-2 text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-gray-400">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-800 bg-darker py-14">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Recent Window Projects (Before/After)</h2>
          <p className="mt-3 text-gray-400">Real project photos from the St. Louis area. Replace placeholders with final client-approved images.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(item => (
              <div key={item} className="rounded-2xl border border-gray-800 bg-dark p-4">
                <div className="aspect-[4/3] rounded-xl border border-dashed border-gray-700 bg-black/20" />
                <p className="mt-3 text-sm text-gray-400">TODO: Add before/after photo set #{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dark py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Window Replacement FAQ</h2>
          <div className="mt-8 space-y-4">
            {faqs.map(item => (
              <details key={item.question} className="rounded-2xl border border-gray-800 bg-darker p-5">
                <summary className="cursor-pointer list-none text-lg font-bold text-white">{item.question}</summary>
                <p className="mt-3 text-gray-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-[6px] border-primary bg-darker px-4 py-16 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-black text-white sm:text-5xl">Ready to replace your windows?</h2>
          <p className="mt-4 text-lg text-gray-300">Book your free estimate and get a clear project scope for your St. Louis home.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="#windows-lead-form"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white transition hover:bg-primary-dark"
            >
              Get My Free Window Quote
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href={phoneHref}
              onClick={trackPhoneConversion}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary/10 px-8 py-4 font-bold text-primary transition hover:bg-primary hover:text-white"
            >
              <Phone className="h-5 w-5" />
              Call Now
            </a>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-primary/30 bg-darker/95 p-3 shadow-2xl md:hidden">
        <a
          href={phoneHref}
          onClick={trackPhoneConversion}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white"
        >
          <Phone className="h-5 w-5" />
          Tap To Call {formattedPhone}
        </a>
      </div>
    </div>
  );
}

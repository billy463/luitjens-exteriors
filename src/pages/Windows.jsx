import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Home,
  Phone,
  SunMedium,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { trackLeadConversion, trackPhoneConversion } from '../lib/googleAds';

const faqs = [
  {
    question: 'How do I know if my windows need replacement?',
    answer: 'Drafts, foggy glass, hard-to-open sashes, and rising utility bills are the most common signals.',
  },
  {
    question: 'How long does window replacement take?',
    answer: 'Most projects are completed in 1 to 2 days after materials are ready. We confirm schedule before install.',
  },
  {
    question: 'Do you offer financing?',
    answer: 'We can discuss financing options during your estimate so you can choose the right payment approach.',
  },
  {
    question: 'Will new windows reduce energy costs?',
    answer: 'Quality window packages can improve comfort and reduce HVAC strain, especially with low-E glass options.',
  },
  {
    question: 'Can you match my home style?',
    answer: 'Yes. We review frame color, grid pattern, and style options to fit your architecture and goals.',
  },
  {
    question: 'Is cleanup included?',
    answer: 'Yes. Removal, cleanup, and final walkthrough are all part of the install process.',
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

  const trustItems = useMemo(
    () => [
      { value: 'TODO+', label: 'Years serving St. Louis homeowners' },
      { value: 'Local', label: 'Owner-led, neighborhood-first service' },
      { value: 'Licensed', label: 'Licensed and insured installation team' },
    ],
    []
  );

  const scrollToForm = () => {
    document.getElementById('windows-lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
    <div className="w-full bg-dark text-gray-200">
      <section className="relative overflow-hidden border-b border-gray-800 bg-darker px-4 py-20 sm:px-6">
        <div className="absolute inset-0 bg-[url('/images/doors-windows.jpeg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-darker/80 to-dark/70" />

        <div className="container relative z-10 mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-primary sm:text-sm">Window Replacement</p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            Window Replacement in St. Louis
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl">
            Get an honest, local quote for energy-efficient window replacement with owner-led installation and no pressure.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={phoneHref}
              onClick={trackPhoneConversion}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-white transition hover:bg-primary-dark"
            >
              <Phone className="h-5 w-5" />
              Call {formattedPhone}
            </a>
            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary/10 px-6 py-4 font-bold text-primary transition hover:bg-primary hover:text-white"
            >
              Get Free Estimate
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-800 bg-dark py-10">
        <div className="container mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3 sm:px-6">
          {trustItems.map(item => (
            <div key={item.label} className="rounded-2xl border border-gray-800 bg-darker p-5 text-center">
              <p className="text-3xl font-black text-white">{item.value}</p>
              <p className="mt-2 text-sm text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-dark py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Why replace your windows?</h2>
            <p className="mt-4 text-gray-400">Most homeowners call us for comfort first, then realize the curb appeal and resale upside comes with it.</p>
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
        </div>
      </section>

      <section className="border-y border-gray-800 bg-darker py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Before & After Gallery</h2>
              <p className="mt-3 text-gray-400">Real projects and in-progress examples from local installs.</p>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">TODO: replace with final photos</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <figure className="overflow-hidden rounded-2xl border border-gray-800 bg-dark">
              <img src="/images/doors-windows.jpeg" alt="Window project placeholder 1" className="h-56 w-full object-cover" />
              <figcaption className="border-t border-gray-800 px-4 py-3 text-sm text-gray-400">Before: aging frames and fogged panes</figcaption>
            </figure>
            <figure className="overflow-hidden rounded-2xl border border-gray-800 bg-dark">
              <img src="/images/Luijens-Exteriors-siding-roofing-doors-and-windows.jpg" alt="Window project placeholder 2" className="h-56 w-full object-cover" />
              <figcaption className="border-t border-gray-800 px-4 py-3 text-sm text-gray-400">After: updated style and cleaner exterior lines</figcaption>
            </figure>
            <figure className="overflow-hidden rounded-2xl border border-gray-800 bg-dark sm:col-span-2 lg:col-span-1">
              <img src="/images/st+louis+arch+skyline.jpg" alt="St. Louis service area placeholder" className="h-56 w-full object-cover" />
              <figcaption className="border-t border-gray-800 px-4 py-3 text-sm text-gray-400">St. Louis area service projects</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="bg-dark py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Our process</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      <section id="windows-lead-form" className="border-y border-gray-800 bg-darker py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.1fr]">
            <div className="rounded-3xl border border-gray-800 bg-dark p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Free Estimate</p>
              <h2 className="mt-3 text-3xl font-extrabold text-white">Request your window quote</h2>
              <p className="mt-4 text-gray-400">Tell us about your project and we will contact you to schedule your no-obligation estimate.</p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <p className="text-gray-300">Local team serving St. Louis and surrounding counties.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Wrench className="mt-0.5 h-5 w-5 text-primary" />
                  <p className="text-gray-300">Professional install quality with owner oversight.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <p className="text-gray-300">Clear scope, timeline, and warranty before work begins.</p>
                </div>
              </div>

              <a
                href={phoneHref}
                onClick={trackPhoneConversion}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-center font-bold text-white transition hover:bg-primary-dark"
              >
                <Phone className="h-5 w-5" />
                Call {formattedPhone}
              </a>
            </div>

            <div className="rounded-3xl border border-gray-800 bg-dark p-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-bold text-gray-300">Full Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-700 bg-darker px-4 py-3 text-white outline-none transition focus:border-primary"
                    placeholder="Jane Smith"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-bold text-gray-300">Phone *</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-700 bg-darker px-4 py-3 text-white outline-none transition focus:border-primary"
                      placeholder="(314) 000-0000"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-bold text-gray-300">Email *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-700 bg-darker px-4 py-3 text-white outline-none transition focus:border-primary"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="mb-2 block text-sm font-bold text-gray-300">Project Address *</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-700 bg-darker px-4 py-3 text-white outline-none transition focus:border-primary"
                    placeholder="123 Main St, St. Louis, MO"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-bold text-gray-300">Project Details</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-700 bg-darker px-4 py-3 text-white outline-none transition focus:border-primary"
                    placeholder="Tell us about your current windows and goals."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitState.status === 'loading'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitState.status === 'loading' ? 'Submitting...' : 'Get Free Estimate'}
                  <ArrowRight className="h-5 w-5" />
                </button>

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
            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white transition hover:bg-primary-dark"
            >
              Get Free Estimate
              <ArrowRight className="h-5 w-5" />
            </button>
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

import { useEffect, useState } from 'react';
import { ArrowRight, Check, Phone, Star } from 'lucide-react';
import { trackLeadConversion, trackPhoneConversion } from '../lib/googleAds';
import { trackMetaLead } from '../lib/metaPixel';

const PHONE = '(314) 882-0973';
const PHONE_HREF = 'tel:+13148820973';

const brandOptions = [
  'Not sure - help me decide',
  'Wincore (good value)',
  'Simonton (best value-to-quality)',
  'Pella (premium)',
  'Andersen (ultra-premium)',
];

const brandLogos = [
  {
    name: 'Wincore',
    src: '/images/brands/wincore.jfif',
  },
  {
    name: 'Simonton',
    src: '/images/brands/simonton.jfif',
  },
  {
    name: 'Pella',
    src: '/images/brands/pella.jfif',
  },
  {
    name: 'Andersen',
    src: '/images/brands/anderson.jfif',
  },
];

const analyzerSteps = [
  {
    title: 'Enter your address',
    body: "We pull your home's publicly available listing photos from Zillow, Redfin, and Realtor.",
  },
  {
    title: 'We count your windows',
    body: 'We identify visible windows by type and estimate your project scope.',
  },
  {
    title: 'You get a text with your range',
    body: 'Wincore on the low end, Andersen on the high end, with Pella and Simonton in between.',
  },
];

const tiers = [
  ['Good', 'Wincore', '$300-$800/window', 'Dependable vinyl with a lifetime limited warranty.', 'Budget-conscious replacements'],
  ['Better', 'Simonton', '$300-$900/window', 'Made in USA. ProNetwork certified. Good Housekeeping Seal.', 'Best value-to-quality balance'],
  ['Best', 'Pella', '$500-$2,000+/window', 'Premium aesthetics from vinyl to wood and composite.', 'Aesthetic-driven mid-premium'],
  ['Ultra-Premium', 'Andersen', '$600-$3,500+/window', 'Heritage wood-clad and Fibrex composite.', 'Custom and luxury renovations'],
];

const faqItems = [
  [
    'Why are your prices higher than the "$189" window ads I\'ve seen?',
    "They're not once the full scope is included. Teaser ads usually exclude Low-E, argon, wrapping, removals, installation, and warranty details.",
  ],
  [
    "What's the difference between full-frame and insert replacement?",
    'Full-frame removes to the studs and is best for damaged frames. Insert is faster when the existing frame is sound.',
  ],
  [
    'How do I know which brand is right for my house?',
    'We install Wincore, Simonton, Pella, and Andersen, so we match brand to your home and budget instead of forcing one line.',
  ],
  ['How long does install take?', 'Most whole-home projects are 1-2 days on site after manufacturing lead time.'],
  ['What is covered by warranty?', 'Coverage varies by product line, and workmanship support is included from our local team.'],
];

const initialForm = {
  address: '',
  name: '',
  phone: '',
  brand: 'Not sure - help me decide',
};

function upsertMeta(attr, key, content) {
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function WindowsLanding() {
  const [formData, setFormData] = useState(initialForm);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [logoFailures, setLogoFailures] = useState({});

  useEffect(() => {
    const title = 'Window Replacement in St. Louis | Wincore, Simonton, Pella & Andersen | Luitjens Exteriors';
    const description =
      'Replace your St. Louis windows with the right brand for your home and budget - Wincore, Simonton, Pella, or Andersen. We handle the permits. Family-owned. Get a real range in 2 minutes.';

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', `${window.location.origin}/windows-landing`);
  }, []);

  const onSubmit = async event => {
    event.preventDefault();

    if (!formData.address.trim() || !formData.name.trim() || !formData.phone.trim()) {
      setSubmitState({ status: 'error', message: 'Please enter your street address, full name, and phone number.' });
      return;
    }

    setSubmitState({ status: 'loading', message: '' });

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'windows',
          brand: formData.brand || 'Not sure - help me decide',
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          source: '/windows hero form',
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Unable to submit your request.');

      trackLeadConversion();
      trackMetaLead({ content_name: 'Windows lead', value: 0, currency: 'USD' });

      setSubmitState({
        status: 'success',
        message:
          "Got it. Sarah - we're pulling your home's listing photos now. You'll get your range by text within 2 minutes (or by email within 1 business hour if manual verification is needed).",
      });
      setFormData(initialForm);
    } catch (error) {
      setSubmitState({ status: 'error', message: error.message || 'Unable to submit your request.' });
    }
  };

  return (
    <div className="w-full bg-dark text-gray-200 pb-24 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-darker/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 md:h-16 md:px-6">
          <a href="/" className="font-bold tracking-wide text-white">LUITJENS EXTERIORS</a>
        </div>
      </header>

      <section id="windows" className="border-b border-gray-800 bg-darker">
        <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-5 md:px-6 md:py-16">
          <div className="order-1 md:col-span-3">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Window Replacement - St. Louis / Wincore - Simonton - Pella - Andersen</p>
            <div className="mb-6 grid grid-cols-2 items-center gap-5 sm:grid-cols-4">
              {brandLogos.map(brand => (
                <div key={brand.name} className="flex h-12 w-full items-center justify-center md:h-14">
                  {!logoFailures[brand.name] ? (
                    <img
                      src={brand.src}
                      alt={`${brand.name} logo`}
                      className="h-[90%] w-full object-contain opacity-95"
                      loading="lazy"
                      onError={() =>
                        setLogoFailures(current => ({
                          ...current,
                          [brand.name]: true,
                        }))
                      }
                    />
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-300 md:text-sm">{brand.name}</span>
                  )}
                </div>
              ))}
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.05] text-white md:text-6xl">
              Match the window to your home.
              <br />
              <span className="text-primary">Not the other way around.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-300 md:text-lg">
              Most St. Louis window companies push whichever brand they happen to sell. We install <strong>all four</strong> - Wincore, Simonton, Pella, and Andersen - and recommend the one that fits your home and budget. We handle permits. No high-pressure sales.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 border-y border-gray-700 py-3 text-xs text-gray-300">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" />10+ Years in St. Louis</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Family-owned</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Licensed & insured</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" />BBB A+</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Authorized on all 4 brands</span>
            </div>
          </div>

          <div className="order-2 md:col-span-2">
            <div id="windows-form" className="rounded-2xl border border-gray-700 bg-dark p-5 shadow-xl md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Free - Built from your home's photos</p>
              <h2 className="mt-1 text-2xl font-extrabold text-white">See your home's real range in 2 minutes.</h2>
              <p className="mt-2 text-sm text-gray-300">No salesperson, no kitchen-table close, no second visit required.</p>

              <form onSubmit={onSubmit} className="mt-4 space-y-3">
                <label className="block text-xs font-semibold text-gray-200">Street address
                  <input value={formData.address} onChange={event => setFormData(current => ({ ...current, address: event.target.value }))} className="mt-1 w-full rounded-lg border-2 border-primary/40 bg-primary/10 px-3 py-3 text-sm text-white outline-none placeholder:text-gray-400" placeholder="1234 Forsyth Blvd, St. Louis, MO" required />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-gray-200">Full name
                    <input value={formData.name} onChange={event => setFormData(current => ({ ...current, name: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-600 bg-darker px-3 py-2.5 text-sm text-white outline-none" placeholder="Sarah J." required />
                  </label>
                  <label className="block text-xs font-semibold text-gray-200">Phone
                    <input value={formData.phone} onChange={event => setFormData(current => ({ ...current, phone: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-600 bg-darker px-3 py-2.5 text-sm text-white outline-none" placeholder="(314) 555-0199" required />
                  </label>
                </div>
                <label className="block text-xs font-semibold text-gray-200">Brand you're considering <span className="font-normal text-gray-400">(optional)</span>
                  <select value={formData.brand} onChange={event => setFormData(current => ({ ...current, brand: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-600 bg-darker px-3 py-2.5 text-sm text-white outline-none">
                    {brandOptions.map(option => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <div className="rounded-lg border border-gray-700 bg-darker p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">You'll get in ~2 minutes:</p>
                  <ul className="space-y-1.5 text-xs text-gray-200">
                    <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 text-primary" /> Window count by type</li>
                    <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 text-primary" /> Range from Wincore to Andersen</li>
                    <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 text-primary" /> Similar St. Louis project ranges</li>
                  </ul>
                </div>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-base font-bold text-white" disabled={submitState.status === 'loading'}>
                  {submitState.status === 'loading' ? 'Submitting...' : 'See My Range Now ->'} <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-center text-[11px] text-gray-400">Free. No credit card. No sales calls without your permission.</p>
                {submitState.message && <p className={`rounded-lg border px-3 py-3 text-sm ${submitState.status === 'success' ? 'border-green-300/30 bg-green-500/10 text-green-200' : 'border-red-300/30 bg-red-500/10 text-red-200'}`}>{submitState.message}</p>}
              </form>

              <div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-4 text-xs text-gray-300">
                <span>Rather talk to a person?</span>
                <a href={PHONE_HREF} onClick={trackPhoneConversion} className="font-semibold text-primary">Call {PHONE}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="bg-dark py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center md:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">Your quote, grounded in your actual home.</h2>
          <div className="mt-10 grid gap-6 text-left md:grid-cols-3">
            {analyzerSteps.map((item, idx) => (
              <article key={item.title} className="rounded-xl border border-gray-700 bg-darker p-6">
                <p className="text-3xl font-extrabold text-primary">{idx + 1}</p>
                <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-300">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="brands" className="border-y border-gray-800 bg-darker py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">The four-brand promise</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-extrabold text-white md:text-4xl">Good, better, best, ultra-premium - all under one roof.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {tiers.map(([tier, brand, range, value, bestFor], idx) => (
              <article key={brand} className={`relative flex h-full flex-col rounded-2xl bg-dark p-6 ${idx === 2 ? 'border-2 border-primary shadow-lg' : 'border border-gray-700'}`}>
                {idx === 2 && <span className="absolute -top-3 left-4 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Most popular</span>}
                <p className={`text-[10px] uppercase tracking-[0.18em] ${idx === 2 ? 'font-semibold text-primary' : 'text-gray-400'}`}>{tier}</p>
                <h3 className="mt-1 text-2xl font-extrabold text-white">{brand}</h3>
                <p className="mt-1 text-sm font-semibold text-primary">{range}</p>
                <p className="mt-4 text-sm text-gray-300">{value}</p>
                <p className="mt-auto border-t border-gray-700 pt-5 text-xs text-gray-400">Best for: {bestFor}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="bg-dark py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">What St. Louis says</p>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white md:text-4xl">Trusted by families across the metro.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map(item => (
              <article key={item} className="rounded-xl border border-gray-700 bg-darker p-6">
                <div className="flex gap-1 text-primary">{Array.from({ length: 5 }).map((_, idx) => <Star key={`${item}-${idx}`} className="h-4 w-4 fill-current" />)}</div>
                <p className="mt-3 text-gray-200">{{1:'{{REVIEW_1}}',2:'{{REVIEW_2}}',3:'{{REVIEW_3}}'}[item]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-y border-gray-800 bg-darker py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">FAQ</p>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white md:text-4xl">The questions we get most.</h2>
          <div className="mt-8 space-y-3">
            {faqItems.map(([q, a]) => (
              <details key={q} className="group rounded-xl border border-gray-700 bg-dark">
                <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-semibold text-white"><span>{q}</span><span className="text-xl text-primary transition-transform group-open:rotate-45">+</span></summary>
                <p className="px-5 pb-5 text-sm text-gray-300">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="text-3xl font-extrabold text-white md:text-5xl">Ready to see your range?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="#windows-form" className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary">Get my brand-match estimate -&gt;</a>
            <a href={PHONE_HREF} onClick={trackPhoneConversion} className="inline-flex items-center rounded-lg border border-white/70 px-6 py-3 text-sm font-semibold text-white">Call {PHONE}</a>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-gray-700 bg-dark p-2 md:hidden">
        <a href={PHONE_HREF} onClick={trackPhoneConversion} className="flex-1 rounded-lg border border-primary px-3 py-2.5 text-center text-sm font-semibold text-primary">Call</a>
        <a href="#windows-form" className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white">Get my estimate</a>
      </div>
    </div>
  );
}

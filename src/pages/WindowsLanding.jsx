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

const comparisonRows = [
  {
    label: 'Window Quality',
    bigBox: 'Builder-grade house brands with limited glass and frame options',
    luitjens: 'Your pick of four top brands - Wincore, Simonton, Pella, and Andersen',
    franchise: 'Usually one proprietary brand with limited flexibility',
  },
  {
    label: 'The Real Price',
    bigBox: 'Low sticker price grows once disposal, capping, Low-E, and argon are added',
    luitjens: 'Transparent pricing with tear-out, disposal, Low-E, argon, and capping included',
    franchise: 'Higher price structure from ad spend, franchise fees, and corporate overhead',
  },
  {
    label: "Who's At Your Door",
    bigBox: "Subcontractors you don't know ahead of time",
    luitjens: 'Our trained crew in Luitjens shirts, with consistent install standards',
    franchise: 'Install teams can vary by market and subcontracting model',
  },
  {
    label: 'Permits & Code',
    bigBox: 'Often left to homeowners to navigate',
    luitjens: 'We pull permits and manage inspections from start to finish',
    franchise: 'Handled and often rolled into marked-up pricing',
  },
  {
    label: 'Sales Experience',
    bigBox: 'Self-serve process with limited project-specific guidance',
    luitjens: 'Straight quote with no 3-hour pitch and no sign-tonight pressure',
    franchise: 'Long in-home presentations with urgency-based discounts',
  },
  {
    label: 'Warranty & Service',
    bigBox: 'Service quality depends heavily on third-party install crews',
    luitjens: 'Manufacturer-backed coverage plus a local team you can call directly',
    franchise: 'Support often routed through layered call-center systems',
  },
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
  const [comparisonTarget, setComparisonTarget] = useState('bigBox');
  const [showMobileStickyCta, setShowMobileStickyCta] = useState(false);

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

  useEffect(() => {
    const onScroll = () => {
      const triggerSection = document.getElementById('why-different');
      const triggerPoint = triggerSection ? Math.max(triggerSection.offsetTop - 120, 220) : 420;
      setShowMobileStickyCta(window.scrollY >= triggerPoint);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
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
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-6">
          <a href="/" className="flex items-center">
            <img
              src="https://images.squarespace-cdn.com/content/v1/67c894550ca45b50d4350eb4/e11fb7cd-e691-4181-a329-40aea8c93872/Luitjens%2BExteriors%2BLogo.jpg?format=1500w"
              alt="Luitjens Exteriors"
              className="h-9 w-auto object-contain md:h-11"
            />
          </a>
          <nav className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-200 md:gap-6 md:text-xs">
            <a href="#why-different" className="transition-colors hover:text-primary">Why We're Different</a>
            <a href="#reviews" className="transition-colors hover:text-primary">Reviews</a>
          </nav>
        </div>
      </header>

      <section id="windows" className="border-b border-gray-800 bg-darker">
        <div className="container mx-auto grid max-w-6xl gap-4 px-4 pb-6 pt-3 md:grid-cols-5 md:gap-8 md:px-6 md:py-12">
          <div className="order-1 md:col-span-3">
            <h1 className="text-4xl font-extrabold leading-[1.05] text-white md:text-6xl">
              Lower your energy bills
              <br />
              <span className="text-primary">with the right windows.</span>
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-300 md:text-lg">
              New energy-efficient windows can help lower your home's indoor temperature by 2-5 degrees, saving hundreds on your energy bills. They also increase property value and instantly upgrade curb appeal.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-1.5 gap-y-2 border-y border-gray-700 py-2.5 text-[11px] text-gray-300 md:mt-6 md:py-3 md:text-xs">
              <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="h-1.5 w-1.5 rounded-full bg-primary" />10+ Years in St. Louis</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Family-owned</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Licensed & Insured</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="h-1.5 w-1.5 rounded-full bg-primary" />BBB A Rated</span>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-700">
              <img
                src="/images/windows-landing-hero-house.jpg"
                alt="Recent Luitjens window project home"
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="order-2 md:col-span-2">
            <div id="windows-form" className="rounded-2xl border border-gray-700 bg-dark p-5 shadow-xl md:p-6">
              <h2 className="mt-1 text-2xl font-extrabold text-white">3-Minute Window Estimate. Real Numbers. All-In Pricing.</h2>
              <p className="mt-2 text-sm text-gray-300">Enter your address. In about 30 seconds we'll find your home, count every window we can see, and show you a price range that includes everything - no $189 bait, no upsell stack.</p>

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

      <section id="why-different" className="bg-dark py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Why St. Louis Homeowners Choose Luitjens</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white md:text-5xl">
              The smart middle between cheap surprises
              <br />
              <span className="text-primary">and overpriced pressure.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-300 md:text-lg">
              Big box stores lure you with a low sticker price that grows once add-ons stack up. National sales organizations offer quality but layer in heavy overhead. We do it the right way, for the right price.
            </p>
          </div>

          <div className="mt-10 hidden gap-5 md:grid md:grid-cols-3 md:items-stretch">
            <article className="rounded-2xl border border-gray-700 bg-darker p-5 md:p-6">
              <h3 className="text-xl font-extrabold text-gray-100">Big Box Stores</h3>
              <p className="mt-1 text-sm text-gray-400">Home Depot, Lowe&apos;s &amp; similar chains</p>
              <div className="mt-5 space-y-4">
                {comparisonRows.map(row => (
                  <div key={`desktop-big-${row.label}`} className="border-t border-gray-700 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">{row.label}</p>
                    <p className="mt-1.5 flex items-start gap-2 text-sm text-gray-300">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-[11px] font-black text-red-300">x</span>
                      {row.bigBox}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="relative rounded-2xl border-2 border-primary bg-dark p-5 shadow-xl shadow-primary/10 md:-translate-y-2 md:p-6">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Best Value</span>
              <h3 className="text-xl font-extrabold text-white md:text-2xl">Luitjens Exteriors</h3>
              <p className="mt-1 text-sm text-primary/90">Local, owner-led, no games</p>
              <div className="mt-5 space-y-4">
                {comparisonRows.map(row => (
                  <div key={`desktop-luitjens-${row.label}`} className="border-t border-gray-700 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{row.label}</p>
                    <p className="mt-1.5 flex items-start gap-2 text-sm text-gray-100">
                      <Check className="mt-0.5 h-5 w-5 rounded-full bg-green-500/15 p-1 text-green-300" />
                      {row.luitjens}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-gray-700 bg-darker p-5 md:p-6">
              <h3 className="text-xl font-extrabold text-gray-100">National Franchises</h3>
              <p className="mt-1 text-sm text-gray-400">TV-advertised in-home sales brands</p>
              <div className="mt-5 space-y-4">
                {comparisonRows.map(row => (
                  <div key={`desktop-franchise-${row.label}`} className="border-t border-gray-700 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">{row.label}</p>
                    <p className="mt-1.5 flex items-start gap-2 text-sm text-gray-300">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-[11px] font-black text-red-300">x</span>
                      {row.franchise}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="mt-10 space-y-4 md:hidden">
            <article className="relative rounded-2xl border-2 border-primary bg-dark p-5 shadow-xl shadow-primary/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Best Value</span>
              <h3 className="text-xl font-extrabold text-white">Luitjens Exteriors</h3>
              <p className="mt-1 text-sm text-primary/90">Local, owner-led, no games</p>
              <div className="mt-4 space-y-3">
                {comparisonRows.map(row => (
                  <div key={`mobile-luitjens-${row.label}`} className="border-t border-gray-700 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{row.label}</p>
                    <p className="mt-1.5 flex items-start gap-2 text-sm text-gray-100">
                      <Check className="mt-0.5 h-5 w-5 rounded-full bg-green-500/15 p-1 text-green-300" />
                      {row.luitjens}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <div className="rounded-xl border border-gray-700 bg-darker p-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setComparisonTarget('bigBox')}
                  className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${comparisonTarget === 'bigBox' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-dark'}`}
                >
                  Compare: Big Box
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonTarget('franchise')}
                  className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${comparisonTarget === 'franchise' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-dark'}`}
                >
                  Compare: Franchise
                </button>
              </div>
            </div>

            <article className="rounded-2xl border border-gray-700 bg-darker p-5">
              <h3 className="text-xl font-extrabold text-gray-100">
                {comparisonTarget === 'bigBox' ? 'Big Box Stores' : 'National Franchises'}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {comparisonTarget === 'bigBox' ? "Home Depot, Lowe's & similar chains" : 'TV-advertised in-home sales brands'}
              </p>
              <div className="mt-4 space-y-3">
                {comparisonRows.map(row => (
                  <div key={`mobile-compare-${row.label}`} className="border-t border-gray-700 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">{row.label}</p>
                    <p className="mt-1.5 flex items-start gap-2 text-sm text-gray-300">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-[11px] font-black text-red-300">x</span>
                      {comparisonTarget === 'bigBox' ? row.bigBox : row.franchise}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="mt-10 text-center">
            <a href="#windows-form" className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-bold text-white transition hover:bg-primary-dark">
              Get Your Free Quote <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-3 text-sm text-gray-400">No pressure. No gimmicks. Just a straight price on quality windows.</p>
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

      <section id="reviews" className="bg-dark py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">What St. Louis says</p>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white md:text-4xl">Trusted by families across the metro.</h2>
          <p className="mt-3 text-center text-sm font-semibold text-primary md:text-base">5.0 ★★★★★ on Google</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                name: 'Katherine D',
                quote: 'Five-star experience.',
              },
              {
                name: 'Billy Willis',
                quote:
                  'Wonderful Experience! They helped me get a new roof with my insurance company. They were fast and easy to communicate. We contacted another roofing company but they said they were months out.',
              },
              {
                name: 'Emsud',
                quote:
                  'Professional team, clear communication, and quality work from start to finish. I would absolutely recommend Luitjens Exteriors.',
              },
            ].map((review, reviewIndex) => (
              <article key={review.name} className="rounded-xl border border-gray-700 bg-darker p-6">
                <div className="flex gap-1 text-primary">{Array.from({ length: 5 }).map((_, idx) => <Star key={`${reviewIndex}-${idx}`} className="h-4 w-4 fill-current" />)}</div>
                <p className="mt-3 text-gray-200">{review.quote}</p>
                <p className="mt-4 text-sm font-semibold text-white">{review.name}</p>
              </article>
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

      <div className={`fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-gray-700 bg-dark p-2 transition-all duration-300 md:hidden ${showMobileStickyCta ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'}`}>
        <a href={PHONE_HREF} onClick={trackPhoneConversion} className="flex-1 rounded-lg border border-primary px-3 py-2.5 text-center text-sm font-semibold text-primary">Call</a>
        <a href="#windows-form" className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white">Get my estimate</a>
      </div>
    </div>
  );
}

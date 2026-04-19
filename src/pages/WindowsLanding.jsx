import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, FileBadge, Handshake, House, Phone, Star } from 'lucide-react';
import { trackLeadConversion, trackPhoneConversion } from '../lib/googleAds';
import { trackMetaLead } from '../lib/metaPixel';

const PHONE = '(314) 882-0973';
const PHONE_HREF = 'tel:+13148820973';
const HERO_PRIMARY = '/images/windows-hero.jpg';
const HERO_FALLBACK = '/images/doors-windows.jpeg';

const brandOptions = [
  'Not sure - help me decide',
  'Wincore (good value)',
  'Simonton (best value-to-quality)',
  'Pella (premium)',
  'Andersen (ultra-premium)',
];

const tiers = [
  ['Good', 'Wincore', '$300-$800/window', 'Dependable vinyl with a lifetime limited warranty. Built by former Simonton engineers.', 'Budget-conscious replacements'],
  ['Better', 'Simonton', '$300-$900/window', 'Made in USA. ProNetwork certified. Good Housekeeping Seal.', 'Best value-to-quality balance'],
  ['Best', 'Pella', '$500-$2,000+/window', 'Premium aesthetics, vinyl through wood and composite. Limited lifetime warranty.', 'Aesthetic-driven mid-premium'],
  ['Ultra-Premium', 'Andersen', '$600-$3,500+/window', 'Heritage wood-clad and Fibrex composite. 130+ years.', 'Custom & luxury renovations'],
];

const analyzerSteps = [
  {
    title: 'Enter your address',
    body: "We pull your home's publicly available listing photos from Zillow, Redfin, Realtor - whatever's on file. No visit needed.",
  },
  {
    title: 'We count your windows',
    body: 'Our AI identifies every window it can see by type - double-hung, casement, picture, bay. Usually takes 60 to 120 seconds.',
  },
  {
    title: 'You get a text with your range',
    body: 'Wincore at the low end, Andersen at the high end. Most homes like yours land in the middle. Free on-site confirmation scheduled at your convenience.',
  },
];

const faqs = [
  [
    'Why are your prices higher than the "$189" window ads I\'ve seen?',
    "They're not once you add up what a $189 ad actually gets you. The advertised price is typically the bare frame with no Low-E, no argon, no wrapping, no storm or mullion removal, no installation, and no real warranty. By the time those get added back in, the final invoice usually lands at $400-$700+ per window. Our quote is all-in from the first conversation, and the range you see is the range that ends up on the invoice.",
  ],
  [
    "What's the difference between full-frame and insert replacement?",
    "A full-frame replacement removes the window down to the studs and is best if your frame is rotted, if you want to change size, or if you're upgrading for energy performance. An insert fits the new window into your existing frame, which is faster and lower cost when the old frame is sound. We walk through both and recommend based on what is happening in your walls.",
  ],
  [
    'How do I know which brand is right for my house?',
    'Because we install all four - Wincore, Simonton, Pella, and Andersen - we match the brand to your house, not the other way around. Historic homes may lean Pella or Andersen for wood-clad looks, while many budget-first replacements do great with Wincore or Simonton.',
  ],
  ['How long does the install take?', 'Most whole-home replacements are one or two days on site. Lead time from order to install is typically four to eight weeks depending on brand and configuration.'],
  ["What's covered by the warranty?", 'Wincore and Simonton carry lifetime limited warranties on frame, sash, and hardware. Pella is limited lifetime across most product lines. Andersen is 20 years on glass and 10 on hardware.'],
];

const gallery = [
  '/images/projects/windows-1.jpg',
  '/images/projects/windows-2.jpg',
  '/images/projects/windows-3.jpg',
  '/images/projects/windows-4.jpg',
  '/images/projects/windows-5.jpg',
  '/images/projects/windows-6.jpg',
];

function setMeta(name, value, attr = 'name') {
  let node = document.querySelector(`meta[${attr}="${name}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute(attr, name);
    document.head.appendChild(node);
  }
  node.setAttribute('content', value);
}

export default function WindowsLanding() {
  const [heroImage, setHeroImage] = useState(HERO_PRIMARY);
  const [missing, setMissing] = useState({});
  const [formData, setFormData] = useState({
    address: '',
    name: '',
    phone: '',
    brand: 'Not sure - help me decide',
  });
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    document.title = 'Window Replacement in St. Louis | Wincore, Simonton, Pella & Andersen | Luitjens Exteriors';
    const description =
      'Replace your St. Louis windows with the right brand for your home and budget - Wincore, Simonton, Pella, or Andersen. We handle the permits. Family-owned. Get a real range in 2 minutes.';
    setMeta('description', description);
    setMeta('og:title', document.title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:url', `${window.location.origin}/windows-landing`, 'property');
  }, []);

  const trust = useMemo(
    () => ['10+ Years in St. Louis', 'Family-owned', 'Licensed & insured', 'BBB A+', 'Authorized on all 4 brands'],
    []
  );

  const onPhoneClick = () => trackPhoneConversion();

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
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
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
          "Got it. Sarah - we're pulling your home's listing photos now. You'll get your range by text within 2 minutes (or by email within 1 business hour if our team needs to verify it manually).",
      });
      setFormData({ address: '', name: '', phone: '', brand: 'Not sure - help me decide' });
    } catch (error) {
      setSubmitState({ status: 'error', message: error.message || 'Unable to submit your request.' });
    }
  };

  return (
    <div className="w-full bg-dark pb-24 text-gray-200 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-darker/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 md:h-16 md:px-6">
          <a href="/" className="font-bold tracking-wide text-white">LUITJENS EXTERIORS</a>
        </div>
      </header>

      <section id="windows" className="border-b border-gray-800 bg-darker">
        <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-5 md:px-6 md:py-16">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="order-1 md:col-span-3">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Window Replacement · St. Louis / Wincore · Simonton · Pella · Andersen</p>
            <h1 className="text-4xl font-extrabold leading-[1.05] text-white md:text-6xl">
              Match the window to your home.
              <br />
              <span className="text-primary">Not the other way around.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-300 md:text-lg">
              Most St. Louis window companies push whichever brand they happen to sell. We install <strong>all four</strong> - Wincore, Simonton, Pella, and Andersen - and recommend the one that fits your home and your budget, not ours. We handle the permits. No high-pressure sales.
            </p>
          </motion.div>

          <div className="order-2 md:col-span-2 md:row-span-2">
            <div id="windows-form" className="rounded-2xl border border-gray-700 bg-dark p-5 shadow-xl md:p-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-300/30 bg-green-500/10 px-2.5 py-1 text-[11px] text-green-300">
                <span className="relative h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
                </span>
                Last estimate sent 23 min ago · Kirkwood, MO
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Free · Built from your home's photos</p>
              <h2 className="mt-1 text-2xl font-extrabold text-white">See your home's real range in 2 minutes.</h2>
              <p className="mt-2 text-sm text-gray-300">
                Enter your address. We pull your listing photos, count your windows, and text you a range across all four brands. <strong>No salesperson, no kitchen-table close, no second visit required.</strong>
              </p>
              <form onSubmit={onSubmit} className="mt-4 space-y-3">
                <label className="block text-xs font-semibold text-gray-200">
                  <span className="mb-1 flex items-center gap-1.5"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">1</span>Street address</span>
                  <input
                    value={formData.address}
                    onChange={event => setFormData(current => ({ ...current, address: event.target.value }))}
                    className="w-full rounded-lg border-2 border-primary/40 bg-primary/10 px-3 py-3 text-sm text-white outline-none placeholder:text-gray-400 focus:border-primary"
                    placeholder="1234 Forsyth Blvd, St. Louis, MO"
                    required
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-gray-200">Full name
                    <input value={formData.name} onChange={event => setFormData(current => ({ ...current, name: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-600 bg-darker px-3 py-2.5 text-sm text-white outline-none focus:border-primary" placeholder="Sarah J." required />
                  </label>
                  <label className="block text-xs font-semibold text-gray-200">Phone
                    <input value={formData.phone} onChange={event => setFormData(current => ({ ...current, phone: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-600 bg-darker px-3 py-2.5 text-sm text-white outline-none focus:border-primary" placeholder="(314) 555-0199" required />
                  </label>
                </div>
                <label className="block text-xs font-semibold text-gray-200">
                  Brand you're considering <span className="font-normal text-gray-400">(optional)</span>
                  <select value={formData.brand} onChange={event => setFormData(current => ({ ...current, brand: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-600 bg-darker px-3 py-2.5 text-sm text-white outline-none focus:border-primary">
                    {brandOptions.map(option => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <div className="rounded-lg border border-gray-700 bg-darker p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">You'll get in ~2 minutes:</p>
                  <ul className="space-y-1.5 text-xs text-gray-200">
                    <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 text-primary" />Your window count by type (double-hung, casement, picture)</li>
                    <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 text-primary" />Estimated range - Wincore low end, Andersen high end</li>
                    <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 text-primary" />What similar St. Louis homes actually paid</li>
                  </ul>
                </div>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-base font-bold text-white hover:bg-primary-dark" disabled={submitState.status === 'loading'}>
                  {submitState.status === 'loading' ? 'Submitting...' : 'See My Range Now ->'} <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-center text-[11px] text-gray-400">Free. No credit card. No sales calls without your permission.</p>
                {submitState.message && (
                  <div className={`rounded-lg border px-3 py-3 text-sm ${submitState.status === 'success' ? 'border-green-300/30 bg-green-500/10 text-green-200' : 'border-red-300/30 bg-red-500/10 text-red-200'}`}>
                    <p>{submitState.message}</p>
                    {submitState.status === 'error' && <a href={PHONE_HREF} onClick={onPhoneClick} className="mt-3 inline-flex rounded-md border border-primary/50 px-3 py-2 text-xs font-semibold text-primary">Call {PHONE}</a>}
                  </div>
                )}
              </form>
              <div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-4 text-xs text-gray-300">
                <span>Rather talk to a person?</span>
                <a href={PHONE_HREF} onClick={onPhoneClick} className="font-semibold text-primary">Call {PHONE}</a>
              </div>
            </div>
          </div>

          <div className="order-3 md:col-span-3">
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-y border-gray-700 py-3 text-xs text-gray-300">
              {trust.map(item => <span key={item} className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{item}</span>)}
            </div>
            <div className="relative mt-6 overflow-hidden rounded-xl border border-gray-700">
              <img
                src={heroImage}
                alt="Recent Luitjens project in Kirkwood"
                className="aspect-[16/10] w-full object-cover"
                onError={() => {
                  if (heroImage === HERO_PRIMARY) {
                    console.warn('Missing /images/windows-hero.jpg. Falling back to /images/doors-windows.jpeg.');
                    setHeroImage(HERO_FALLBACK);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/80">Recent project · Kirkwood, MO</p>
                <p className="mt-1 text-xl font-semibold">28 Pella Lifestyle windows + permit handled end-to-end.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="bg-dark py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center md:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">Your quote, grounded in your actual home.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-300">No calculators. No guessing. We use your home's public listing photos to build a real estimate across Wincore, Simonton, Pella, and Andersen before we ever step onto your porch.</p>
          <div className="mt-10 grid gap-6 text-left md:grid-cols-3">
            {analyzerSteps.map((item, idx) => (
              <article key={item.title} className="rounded-xl border border-gray-700 bg-darker p-6">
                <p className="text-3xl font-extrabold text-primary">{idx + 1}</p>
                <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-300">{item.body}</p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-xs text-gray-400">Preliminary estimate only. Back-of-house windows sometimes are not in listing photos. Your on-site quote locks the final number, and it's free.</p>
        </div>
      </section>

      <section id="brands" className="border-y border-gray-800 bg-darker py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">The four-brand promise</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-extrabold text-white md:text-4xl">Good, better, best, ultra-premium - all under one roof.</h2>
          <p className="mt-3 max-w-3xl text-gray-300">Most St. Louis window companies carry one or two brands and recommend whatever they are authorized to sell. We carry Wincore, Simonton, Pella, and Andersen, so the recommendation is built around your home and your budget.</p>
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

      <section className="bg-dark py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3 md:px-6">
          {[['We handle the permit.', 'Most St. Louis window companies make you pull your own city permits. We file, schedule inspections, and close out.', FileBadge], ['No second visit. No hard sell.', "Get a real number on the first call. If you'd rather not have anyone in your living room, we'll quote by phone with a Street View walk-through.", Handshake], ['Family-owned, not a franchise.', 'When something needs attention five years from now, a local family answers the phone, not a 1-800 line routed to another state.', House]].map(([title, body, Icon]) => (
            <article key={title} className="rounded-xl border border-gray-700 bg-darker p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white"><Icon className="h-5 w-5" /></div>
              <h3 className="text-xl font-extrabold text-white">{title}</h3>
              <p className="mt-2 text-sm text-gray-300">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-gray-800 bg-darker py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">No teaser pricing</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">What "starting at $189" actually costs.</h2>
            <p className="mt-3 text-gray-300">Most low advertised prices leave out the parts that make a window perform in St. Louis weather. Here's how invoices usually stack up.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-gray-700 bg-white p-6 text-gray-900 md:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">What you see in the ad</p>
              <p className="mt-2 text-5xl font-extrabold md:text-6xl">$189</p>
              <p className="mt-1 text-sm text-gray-500">per window · double-hung vinyl</p>
              <ul className="mt-6 space-y-2 border-t border-gray-200 pt-4 text-sm">
                <li className="flex gap-3"><span className="w-4 font-bold text-primary">✓</span>Basic window frame</li>
                <li className="flex gap-3 text-gray-400"><span className="w-4">-</span>Low-E glass coating</li>
                <li className="flex gap-3 text-gray-400"><span className="w-4">-</span>Argon gas fill</li>
                <li className="flex gap-3 text-gray-400"><span className="w-4">-</span>Window wrapping</li>
                <li className="flex gap-3 text-gray-400"><span className="w-4">-</span>Storm window removal</li>
                <li className="flex gap-3 text-gray-400"><span className="w-4">-</span>Mullion removal</li>
                <li className="flex gap-3 text-gray-400"><span className="w-4">-</span>Extended warranty</li>
                <li className="flex gap-3 text-gray-400"><span className="w-4">-</span>Installation</li>
              </ul>
            </article>
            <article className="rounded-2xl border-2 border-primary bg-dark p-6 text-white md:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">What ends up on the invoice</p>
              <div className="mt-4 space-y-1.5 font-mono text-sm text-white/90">
                <div className="flex justify-between"><span>Base window</span><span>$189</span></div><div className="flex justify-between"><span>+ Low-E glass coating</span><span>$50</span></div><div className="flex justify-between"><span>+ Argon gas fill</span><span>$25</span></div><div className="flex justify-between"><span>+ Window wrapping</span><span>$65</span></div><div className="flex justify-between"><span>+ Storm window removal</span><span>$59</span></div><div className="flex justify-between"><span>+ Mullion removal</span><span>$30</span></div><div className="flex justify-between"><span>+ Extended warranty</span><span>$50</span></div><div className="flex justify-between"><span>+ Installation</span><span>$50</span></div><div className="mt-2 flex justify-between border-t border-white/20 pt-2"><span>+ Tax & fees</span><span>varies</span></div>
              </div>
              <div className="mt-5 flex items-baseline justify-between border-t border-primary/40 pt-4"><span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Real bill</span><span className="text-4xl font-extrabold md:text-5xl">$518+</span></div>
              <p className="mt-4 text-[11px] text-white/70">Based on publicly reported per-unit costs from real customer invoices. 2025 HomeGuide survey of 1,000 homeowners found an average of $373/window, with real installs commonly landing between $400 and $1,700 depending on package.</p>
            </article>
          </div>
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-primary p-6 text-center text-white md:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">The Luitjens way</p>
            <h3 className="mt-2 text-2xl font-extrabold md:text-3xl">All of that is included in the number we quote you.</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 md:text-base">Low-E, argon, wrapping, storm and mullion removal, installation, workmanship warranty - all in. The range you get from our 2-minute estimate is the range you'll see on the actual quote. No upsell games at the kitchen table.</p>
            <a href="#windows-form" className="mt-6 inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary">See my real range -&gt;</a>
          </div>
        </div>
      </section>

      <section className="bg-dark py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Recent St. Louis projects</p>
          <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">Before & after.</h2>
          <p className="mt-2 max-w-sm text-sm text-gray-300">Every home in this section should be a Luitjens install. No stock photos.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {gallery.map((src, index) => (
              <div key={src} className="relative overflow-hidden rounded-lg border border-gray-700 bg-darker">
                {!missing[index] && <img src={src} alt={`Luitjens project ${index + 1}`} className="aspect-[4/5] w-full object-cover" onError={() => setMissing(current => ({ ...current, [index]: true }))} />}
                {missing[index] && <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-primary/15 to-darker p-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-primary">PLACEHOLDER - replace with project photo</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-800 bg-darker py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">The process</p>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white md:text-4xl">Four steps. One local family.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[['01', 'Free quote', 'In-home or by phone. Your call.'], ['02', 'Precise measurement', 'Factory spec every opening. No surprises at install.'], ['03', 'Pro install', 'Our crew, not subcontractors.'], ['04', 'Local lifetime support', 'A family answers, not a 1-800 line.']].map(([step, title, body]) => (
              <article key={step} className="rounded-xl border border-gray-700 bg-dark p-5">
                <p className="text-2xl font-extrabold text-primary">{step}</p>
                <h3 className="mt-1 font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm text-gray-300">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="bg-dark py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">What St. Louis says</p>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white md:text-4xl">Trusted by families across the metro.</h2>
          <p className="mt-2 text-center text-sm text-gray-300">4.9 / 5 across Google reviews · Trusted in Ladue, Kirkwood, Webster Groves, Clayton, Chesterfield</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map(item => (
              <article key={item.who} className="rounded-xl border border-gray-700 bg-darker p-6">
                <div className="flex gap-1 text-primary">{Array.from({ length: 5 }).map((_, idx) => <Star key={`${item.who}-${idx}`} className="h-4 w-4 fill-current" />)}</div>
                <p className="mt-3 text-gray-200">{item.quote}</p>
                <p className="mt-4 text-sm font-semibold text-white">{item.who}</p>
                <p className="text-xs text-gray-400">{item.area}</p>
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
            {faqs.map(([q, a]) => (
              <details key={q} className="group rounded-xl border border-gray-700 bg-dark">
                <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-semibold text-white">
                  <span>{q}</span>
                  <span className="text-xl text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-gray-300">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="text-3xl font-extrabold text-white md:text-5xl">Ready to see your range?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">Enter your address. We'll text your four-brand estimate in about two minutes.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="#windows-form" className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary">Get my brand-match estimate -&gt;</a>
            <a href={PHONE_HREF} onClick={onPhoneClick} className="inline-flex items-center rounded-lg border border-white/70 px-6 py-3 text-sm font-semibold text-white">Call {PHONE}</a>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-gray-700 bg-dark p-2 md:hidden">
        <a href={PHONE_HREF} onClick={onPhoneClick} className="flex-1 rounded-lg border border-primary px-3 py-2.5 text-center text-sm font-semibold text-primary">Call</a>
        <a href="#windows-form" className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white">Get my estimate</a>
      </div>
    </div>
  );
}

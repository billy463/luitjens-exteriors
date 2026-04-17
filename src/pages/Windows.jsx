import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calculator,
  Camera,
  Home,
  MapPinned,
  Search,
  ShieldCheck,
  Sparkles,
  Waves,
} from 'lucide-react';

const windowStyles = [
  { id: 'double-hung', name: 'Double-Hung', tagline: 'Most common replacement window in St. Louis homes.', multiplier: 1 },
  { id: 'casement', name: 'Casement', tagline: 'Tighter seal, more airflow, higher hardware cost.', multiplier: 1.18 },
  { id: 'sliding', name: 'Sliding', tagline: 'Wide opening, common in bedrooms and basements.', multiplier: 1.08 },
  { id: 'picture', name: 'Picture', tagline: 'Fixed glass for light, view, and curb appeal.', multiplier: 1.12 },
  { id: 'awning', name: 'Awning', tagline: 'Great for bathrooms, basements, and tighter spaces.', multiplier: 1.1 },
  { id: 'bay-bow', name: 'Bay / Bow', tagline: 'Statement windows with added structure and labor.', multiplier: 2.7 },
  { id: 'garden', name: 'Garden', tagline: 'Deeper kitchen window package with more complexity.', multiplier: 1.75 },
  { id: 'egress', name: 'Egress', tagline: 'Basement code-driven opening with heavier install work.', multiplier: 1.45 },
];

const productLines = [
  {
    id: 'essential',
    name: 'Essential Vinyl',
    badge: 'Budget Friendly',
    description: 'For straightforward replacements where the number has to stay lean.',
    baseProduct: 360,
    baseInstall: 290,
  },
  {
    id: 'comfort',
    name: 'Comfort Vinyl',
    badge: 'Best Value',
    description: 'The lane we expect to live in most often: strong performance with a fair installed number.',
    baseProduct: 520,
    baseInstall: 330,
  },
  {
    id: 'signature',
    name: 'Signature Fiberglass',
    badge: 'Premium',
    description: 'Higher-end performance and stronger hardware for long-term owners.',
    baseProduct: 710,
    baseInstall: 390,
  },
];

const glassPackages = [
  { id: 'standard', name: 'Standard Double Pane', addProduct: 0, description: 'Baseline insulated glass for straightforward replacements.' },
  { id: 'low-e', name: 'Low-E / Argon', addProduct: 80, description: 'Most common upgrade for comfort, UV control, and efficiency.' },
  { id: 'triple-pane', name: 'Triple Pane', addProduct: 170, description: 'Best for noise control and premium comfort-focused jobs.' },
];

const formatCurrency = value =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const normalizeImages = payload => {
  if (!payload) return [];

  const buckets = [
    payload.images,
    payload.imageUrls,
    payload.photos,
    payload.data?.images,
    payload.data?.photos,
    payload.results,
    payload,
  ];

  for (const bucket of buckets) {
    if (!Array.isArray(bucket)) continue;
    const urls = bucket
      .map(item => {
        if (typeof item === 'string') return item;
        if (!item || typeof item !== 'object') return null;
        return item.url || item.href || item.image || item.imageUrl || item.src || item.original || null;
      })
      .filter(Boolean);
    if (urls.length) return urls;
  }

  return [];
};

const normalizeCounts = payload => payload?.counts || payload?.window_counts || payload?.result || payload || null;

export default function Windows() {
  const [quantities, setQuantities] = useState(
    Object.fromEntries(windowStyles.map(style => [style.id, 0]))
  );
  const [productLineId, setProductLineId] = useState('comfort');
  const [glassPackageId, setGlassPackageId] = useState('low-e');
  const [address, setAddress] = useState('');
  const [lookup, setLookup] = useState({ status: 'idle', message: '', images: [] });
  const [counting, setCounting] = useState({ status: 'idle', message: '', confidence: '', notes: [] });

  const selectedProductLine = productLines.find(line => line.id === productLineId);
  const selectedGlassPackage = glassPackages.find(pkg => pkg.id === glassPackageId);

  const estimate = useMemo(() => {
    const lineItems = windowStyles
      .filter(style => quantities[style.id] > 0)
      .map(style => {
        const quantity = quantities[style.id];
        const productEach = Math.round((selectedProductLine.baseProduct + selectedGlassPackage.addProduct) * style.multiplier);
        const installEach = Math.round(selectedProductLine.baseInstall * style.multiplier);

        return {
          ...style,
          quantity,
          productEach,
          installEach,
          total: (productEach + installEach) * quantity,
          productTotal: productEach * quantity,
          installTotal: installEach * quantity,
        };
      });

    const totalWindows = lineItems.reduce((sum, item) => sum + item.quantity, 0);
    const productSubtotal = lineItems.reduce((sum, item) => sum + item.productTotal, 0);
    const installSubtotal = lineItems.reduce((sum, item) => sum + item.installTotal, 0);
    const subtotal = productSubtotal + installSubtotal;
    const discountRate = totalWindows >= 12 ? 0.08 : totalWindows >= 8 ? 0.05 : 0;
    const discountAmount = Math.round(subtotal * discountRate);
    const total = subtotal - discountAmount;

    return {
      lineItems,
      totalWindows,
      productSubtotal,
      installSubtotal,
      discountRate,
      discountAmount,
      total,
      low: Math.round(total * 0.96),
      high: Math.round(total * 1.07),
    };
  }, [quantities, selectedGlassPackage, selectedProductLine]);

  const setQuantity = (styleId, nextValue) => {
    const parsed = Number.isNaN(nextValue) ? 0 : Math.max(0, nextValue);
    setQuantities(current => ({ ...current, [styleId]: parsed }));
  };

  const applyAiCounts = counts => {
    if (!counts || typeof counts !== 'object') return;

    const aliases = {
      'double-hung': ['double-hung', 'double_hung', 'doubleHung'],
      casement: ['casement'],
      sliding: ['sliding', 'slider'],
      picture: ['picture'],
      awning: ['awning'],
      'bay-bow': ['bay-bow', 'bay_bow', 'bayBow', 'bay', 'bow'],
      garden: ['garden'],
      egress: ['egress'],
    };

    setQuantities(current => {
      const next = { ...current };
      Object.entries(aliases).forEach(([styleId, keys]) => {
        const match = keys.find(key => Number.isFinite(Number(counts[key])));
        if (match) next[styleId] = Math.max(0, Number(counts[match]));
      });
      return next;
    });
  };

  const handleAddressLookup = async event => {
    event.preventDefault();
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setLookup({ status: 'error', message: 'Enter a property address to search for listing photos.', images: [] });
      return;
    }

    setLookup({ status: 'loading', message: '', images: [] });
    setCounting({ status: 'idle', message: '', confidence: '', notes: [] });

    try {
      const response = await fetch(`/api/property-images?address=${encodeURIComponent(trimmedAddress)}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to fetch property images right now.');
      }

      const images = normalizeImages(payload);
      setLookup({
        status: 'success',
        message: images.length
          ? `Found ${images.length} property photo${images.length === 1 ? '' : 's'} for this address.`
          : 'No listing photos were returned for this address.',
        images,
      });
    } catch (error) {
      setLookup({
        status: 'error',
        message: error.message || 'Unable to fetch property images right now.',
        images: [],
      });
    }
  };

  const handleAiCount = async () => {
    if (!lookup.images.length) {
      setCounting({
        status: 'error',
        message: 'Look up a property first so the AI has photos to review.',
        confidence: '',
        notes: [],
      });
      return;
    }

    setCounting({ status: 'loading', message: '', confidence: '', notes: [] });

    try {
      const response = await fetch('/api/window-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address.trim(),
          images: lookup.images.slice(0, 6),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to analyze property photos right now.');
      }

      applyAiCounts(normalizeCounts(payload));

      setCounting({
        status: 'success',
        message: 'AI counts applied. Review and adjust anything that looks off.',
        confidence: payload?.confidence || '',
        notes: Array.isArray(payload?.notes) ? payload.notes : [],
      });
    } catch (error) {
      setCounting({
        status: 'error',
        message: error.message || 'Unable to analyze property photos right now.',
        confidence: '',
        notes: [],
      });
    }
  };

  const estimatorImage = lookup.images[0] || null;

  return (
    <div className="w-full bg-dark text-gray-200">
      <section className="relative overflow-hidden border-b border-gray-800 bg-darker px-6 py-24 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2070')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-darker/70 to-dark/40" />
        <div className="container relative z-10 mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.85fr] lg:items-start">
            <div className="space-y-6">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Windows And Doors</p>
              <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
                Window Pricing Without <span className="text-primary">the Runaround.</span>
              </h1>
              <p className="max-w-3xl text-xl leading-relaxed text-gray-300">
                Lexi handles the homeowner side. Mike runs the install side. That means a real scope,
                a real conversation, and an owner on every job site.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-primary/20 bg-black/20 p-5 backdrop-blur-sm">
                  <p className="mb-2 text-xl font-black text-white">Live project range</p>
                  <p className="text-sm text-gray-300">Build a budget by window type, package, and glass option before the in-home visit.</p>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-black/20 p-5 backdrop-blur-sm">
                  <p className="mb-2 text-xl font-black text-white">Owner-led</p>
                  <p className="text-sm text-gray-300">No mystery subcontractor after the sale.</p>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-black/20 p-5 backdrop-blur-sm">
                  <p className="mb-2 text-xl font-black text-white">AI-assisted</p>
                  <p className="text-sm text-gray-300">Pull listing photos first, then let the AI prefill the count.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/15 bg-black/25 p-8 backdrop-blur-sm">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-primary">Why this page exists</p>
              <p className="mb-5 leading-relaxed text-gray-300">
                Most homeowners do not know how many windows they have by style, what package fits the house,
                or whether a quote is even in the right ballpark. This page fixes that.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calculator className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-gray-300">Build the scope by window type instead of guessing on a total count.</p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPinned className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-gray-300">Use RealtyAPI to pull listing photos by address through your own secure Vercel endpoint.</p>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-gray-300">Let AI produce a first-pass count, then keep every quantity editable before the estimate.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-800 bg-dark py-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="rounded-3xl border border-gray-800 bg-darker p-8 shadow-2xl shadow-black/20">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">Property Photo Lookup</p>
                <h2 className="text-3xl font-extrabold text-white md:text-4xl">Start with the property</h2>
              </div>
              <p className="max-w-2xl text-gray-400">Pull listing photos by address to make the estimator feel tied to the actual home before the customer starts selecting windows.</p>
            </div>

            <form onSubmit={handleAddressLookup} className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <MapPinned className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <input
                  type="text"
                  value={address}
                  onChange={event => setAddress(event.target.value)}
                  placeholder="5865 Blackberry Dr, Imperial, MO 63052"
                  className="w-full rounded-2xl border border-gray-700 bg-dark py-4 pl-12 pr-4 text-white outline-none transition focus:border-primary"
                />
              </div>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-white transition hover:bg-primary-dark">
                <Search className="h-5 w-5" />
                {lookup.status === 'loading' ? 'Searching...' : 'Find Property Photos'}
              </button>
            </form>

            {lookup.message && (
              <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                lookup.status === 'error'
                  ? 'border-red-500/30 bg-red-500/10 text-red-200'
                  : 'border-primary/30 bg-primary/10 text-gray-200'
              }`}>
                {lookup.message}
              </div>
            )}

            {lookup.images.length > 0 && (
              <>
                <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-gray-400">
                    <Camera className="h-4 w-4 text-primary" />
                    Listing Photos
                  </div>
                  <button
                    type="button"
                    onClick={handleAiCount}
                    className="inline-flex items-center gap-2 self-start rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 font-bold text-primary transition hover:bg-primary hover:text-white"
                  >
                    <Sparkles className="h-4 w-4" />
                    {counting.status === 'loading' ? 'Counting Windows...' : 'Use AI To Count Windows'}
                  </button>
                </div>

                {counting.message && (
                  <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                    counting.status === 'error'
                      ? 'border-red-500/30 bg-red-500/10 text-red-200'
                      : 'border-primary/30 bg-primary/10 text-gray-200'
                  }`}>
                    <p>{counting.message}</p>
                    {(counting.confidence || counting.notes.length > 0) && (
                      <div className="mt-2 space-y-1 text-gray-300">
                        {counting.confidence && <p><span className="font-bold text-white">Confidence:</span> {counting.confidence}</p>}
                        {counting.notes.map((note, index) => <p key={`${note}-${index}`}>• {note}</p>)}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {lookup.images.slice(0, 6).map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="overflow-hidden rounded-2xl border border-gray-800 bg-dark">
                      <img src={imageUrl} alt={`Property reference ${index + 1}`} className="h-56 w-full object-cover" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="bg-dark py-20">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 md:px-6 xl:grid-cols-[1.35fr_0.8fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-gray-800 bg-darker p-8 shadow-2xl shadow-black/20">
              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">Step 1</p>
                  <h2 className="text-3xl font-extrabold text-white md:text-4xl">How many of each window do you have?</h2>
                </div>
                <p className="max-w-xl text-gray-400">Start at zero and only fill in what applies. The AI helps, but the homeowner stays in control.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {windowStyles.map(style => (
                  <div key={style.id} className="min-w-0 rounded-2xl border border-gray-800 bg-dark/70 p-5 transition-all hover:border-primary/40">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-white">{style.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-gray-400">{style.tagline}</p>
                      </div>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                        <Home className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button type="button" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gray-700 bg-darker text-xl font-bold text-white transition hover:border-primary hover:text-primary" onClick={() => setQuantity(style.id, quantities[style.id] - 1)}>-</button>
                      <input
                        type="number"
                        min="0"
                        value={quantities[style.id]}
                        onChange={event => setQuantity(style.id, Number.parseInt(event.target.value || '0', 10))}
                        className="h-14 min-w-0 flex-1 rounded-xl border border-gray-700 bg-darker px-4 text-center text-lg font-bold text-white outline-none transition focus:border-primary"
                      />
                      <button type="button" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gray-700 bg-darker text-xl font-bold text-white transition hover:border-primary hover:text-primary" onClick={() => setQuantity(style.id, quantities[style.id] + 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-800 bg-darker p-8 shadow-2xl shadow-black/20">
              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">Step 2</p>
                  <h2 className="text-3xl font-extrabold text-white md:text-4xl">Pick your pricing lane</h2>
                </div>
                <p className="max-w-xl text-gray-400">This is not meant to lock the customer into a manufacturer. It is meant to get them closer to a confident budget.</p>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-gray-400">Window package</p>
                  <div className="grid gap-4 lg:grid-cols-3">
                    {productLines.map(line => (
                      <button
                        key={line.id}
                        type="button"
                        onClick={() => setProductLineId(line.id)}
                        className={`rounded-2xl border p-5 text-left transition-all ${
                          line.id === productLineId ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' : 'border-gray-800 bg-dark hover:border-primary/40'
                        }`}
                      >
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">{line.badge}</p>
                        <h3 className="mb-2 text-xl font-bold text-white">{line.name}</h3>
                        <p className="text-sm leading-relaxed text-gray-400">{line.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-gray-400">Glass package</p>
                  <div className="grid gap-4 lg:grid-cols-3">
                    {glassPackages.map(pkg => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setGlassPackageId(pkg.id)}
                        className={`rounded-2xl border p-5 text-left transition-all ${
                          pkg.id === glassPackageId ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' : 'border-gray-800 bg-dark hover:border-primary/40'
                        }`}
                      >
                        <h3 className="mb-2 text-xl font-bold text-white">{pkg.name}</h3>
                        <p className="text-sm leading-relaxed text-gray-400">{pkg.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:sticky xl:top-28 xl:self-start">
            <div className="rounded-3xl border border-gray-800 bg-darker p-8 shadow-2xl shadow-black/20">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">Live Estimate</p>
              <h2 className="text-3xl font-extrabold text-white">Your project budget</h2>
              <p className="mt-4 leading-relaxed text-gray-400">
                This estimate stays focused on a project range, not a public per-window anchor.
                The goal is to get the homeowner close enough to move forward confidently.
              </p>

              {estimatorImage && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-gray-800 bg-dark">
                  <img src={estimatorImage} alt={address || 'Property preview'} className="h-56 w-full object-cover" />
                  <div className="border-t border-gray-800 px-4 py-3">
                    <p className="text-sm font-bold text-white">{address}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Estimator reference photo</p>
                  </div>
                </div>
              )}

              {estimate.totalWindows === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-gray-700 bg-dark/60 p-6 text-gray-400">
                  Add your window counts to build the estimate.
                </div>
              ) : (
                <>
                  <div className="mt-8 flex items-end gap-3">
                    <span className="text-3xl font-black text-white md:text-4xl">{formatCurrency(estimate.low)}</span>
                    <span className="pb-1 text-sm uppercase tracking-[0.18em] text-gray-500">to</span>
                    <span className="text-3xl font-black text-white md:text-4xl">{formatCurrency(estimate.high)}</span>
                  </div>

                  <div className="mt-8 space-y-4">
                    {estimate.lineItems.map(item => (
                      <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-gray-800 bg-dark/70 p-4">
                        <div>
                          <p className="font-bold text-white">{item.quantity} x {item.name}</p>
                          <p className="text-sm text-gray-400">{formatCurrency(item.productEach)} product / {formatCurrency(item.installEach)} install</p>
                        </div>
                        <p className="font-bold text-white">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-3 border-t border-gray-800 pt-6">
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Windows</span>
                      <span>{formatCurrency(estimate.productSubtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Installation</span>
                      <span>{formatCurrency(estimate.installSubtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Removal / cleanup</span>
                      <span>Included</span>
                    </div>
                    {estimate.discountAmount > 0 && (
                      <div className="flex items-center justify-between text-primary">
                        <span>Multi-window discount ({Math.round(estimate.discountRate * 100)}%)</span>
                        <span>-{formatCurrency(estimate.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-gray-800 pt-4 text-lg font-black text-white">
                      <span>Estimated total</span>
                      <span>{formatCurrency(estimate.total)}</span>
                    </div>
                  </div>
                </>
              )}

              <a href="/#contact" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-center font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-dark">
                Schedule My Free In-Home Estimate
                <ArrowRight className="h-5 w-5" />
              </a>
              <p className="mt-4 text-sm leading-relaxed text-gray-500">
                This gets the homeowner close. Mike still confirms measurements, install conditions, and final scope in person.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-800 bg-darker py-20">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-12 max-w-4xl text-center md:mx-auto">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.22em] text-primary">Why We Position It This Way</p>
            <h2 className="text-3xl font-extrabold text-white md:text-5xl">The real job is not selling the cheapest window.</h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-400">
              The real job is helping the homeowner understand the project, trust the install, and spend the right amount on the right package.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-800 bg-dark p-8">
              <Waves className="mb-5 h-10 w-10 text-primary" />
              <h3 className="mb-3 text-2xl font-bold text-white">Comfort is the hook</h3>
              <p className="leading-relaxed text-gray-400">Drafts, fogged panes, stuck sashes, and outside noise are felt every single day. That is why people buy.</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-dark p-8">
              <Sparkles className="mb-5 h-10 w-10 text-primary" />
              <h3 className="mb-3 text-2xl font-bold text-white">Transparency is the edge</h3>
              <p className="leading-relaxed text-gray-400">Big-box window sellers want the homeowner blind until the pitch. This page gives them a smarter starting point before anyone steps inside the house.</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-dark p-8">
              <ShieldCheck className="mb-5 h-10 w-10 text-primary" />
              <h3 className="mb-3 text-2xl font-bold text-white">The owner story is real</h3>
              <p className="leading-relaxed text-gray-400">Lexi handles the homeowner side. Mike runs the install. That is what separates this from a call-center quote and a subcontractor install.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t-[6px] border-primary bg-dark px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-4xl font-black text-white md:text-5xl">Let&apos;s figure out what your windows are actually costing you.</h2>
          <p className="mb-10 text-xl leading-relaxed text-gray-300">
            If the house is drafty, the panes are fogging, or the old quote felt high, we will measure it, explain it, and give you a real number without the kitchen-table pressure.
          </p>
          <a href="/#contact" className="inline-flex items-center gap-2 rounded-md bg-primary px-10 py-5 text-xl font-bold text-white shadow-[0_10px_30px_rgba(158,130,84,0.3)] transition-all hover:-translate-y-1 hover:bg-primary-dark">
            Get My Free Window Estimate
            <ArrowRight className="h-6 w-6" />
          </a>
        </div>
      </section>
    </div>
  );
}

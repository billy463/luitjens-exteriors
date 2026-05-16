import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Eye, MapPin, Minus, Phone, Plus, Search, Sparkles, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BayBowIcon,
  CasementIcon,
  DoubleHungIcon,
  PictureIcon,
  SlidingIcon,
  SlidingPatioDoorIcon,
} from '../components/WindowTypeIcons';
import { trackLeadConversion, trackPhoneConversion } from '../lib/googleAds';
import { trackMetaLead } from '../lib/metaPixel';
import './WindowsLanding.css';

const PHONE = '(314) 882-0973';
const PHONE_HREF = 'tel:+13148820973';
const MIN_ANALYZE_MS = 15000;

const fallbackNarrative =
  "We couldn't get a clear look at your home from public photos. No problem - just enter your window counts below and we'll take it from there.";

const GALLERY_PHOTOS = [
  "/images/2026-03-26 17.55.27.jpg",
  "/images/2026-03-26 14.02.37.jpg",
  "/images/2026-03-26 13.49.39.jpg",
  "/images/2026-03-24 17.39.50.jpg",
  "/images/2026-03-25 11.40.16.jpg",
  "/images/2026-02-10 16.53.50.jpg",
  "/images/2026-02-10 11.44.07.jpg",
  "/images/2026-02-04 11.46.29.jpg",
  "/images/2025-12-22 11.54.43.jpg"
];

const heroCopy = {
  default: {
    badge: 'Lower Your Energy Bills',
    title: 'See your window replacement pricing range in under 3 minutes',
    subtitle: "We carry name-brand windows without the massive markup. Because we're a small, independent team, our customers often can't believe we're half the price of the big guys.",
  },
  mayDiscount: {
    badge: '💰 $1,000 Off • May Only',
    title: '$1,000 off when you replace 5+ windows this month',
    subtitle: 'See your discounted pricing range instantly. If your quote covers 5+ windows, the $1,000 comes off automatically.',
  },
  speedPricing: {
    badge: '⚡ Energy Bill Calculator',
    title: 'See how much you\'ll save on energy bills with new windows',
    subtitle: 'Get an instant pricing range + your estimated annual savings based on your home\'s size and current windows.',
  },
};

const initialCounts = {
  single_hung_double_hung: 0,
  picture: 0,
  sliding: 0,
  casement: 0,
  bay_bow: 0,
  patio_door: 0,
};

const pricingMatrix = {
  wincore: {
    label: 'Wincore',
    windowTypes: {
      single_hung_double_hung: { low: 950, high: 1350 },
      picture: { low: 1000, high: 1250 },
      sliding: { low: 950, high: 1250 },
      casement: { low: 1050, high: 1300 },
      bay_bow: { low: 1650, high: 2200 },
      patio_door: { low: 3300, high: 4400 },
    },
  },
  simonton: {
    label: 'Simonton',
    windowTypes: {
      single_hung_double_hung: { low: 1150, high: 1550 },
      picture: { low: 1200, high: 1450 },
      sliding: { low: 1150, high: 1450 },
      casement: { low: 1250, high: 1500 },
      bay_bow: { low: 1850, high: 2400 },
      patio_door: { low: 3500, high: 4600 },
    },
  },
  pella: {
    label: 'Pella',
    windowTypes: {
      single_hung_double_hung: { low: 1350, high: 1550 },
      picture: { low: 1200, high: 1500 },
      sliding: { low: 1350, high: 1700 },
      casement: { low: 1600, high: 2100 },
      bay_bow: { low: 2850, high: 3950 },
      patio_door: { low: 5950, high: 8500 },
    },
  },
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function formatRange([low, high]) {
  return `$${low.toLocaleString()} - $${high.toLocaleString()}`;
}

function calculateBrandRange(brandPricing, counts) {
  return Object.entries(brandPricing.windowTypes).reduce(
    ([lowTotal, highTotal], [type, range]) => {
      const quantity = counts[type] || 0;
      return [lowTotal + range.low * quantity, highTotal + range.high * quantity];
    },
    [0, 0],
  );
}

function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}
function formatCountSummary(windowCount, doorCount) {
  const windowText = `${windowCount} ${pluralize(windowCount, 'window')}`;
  if (!doorCount) return windowText;
  return `${windowText} & ${doorCount} ${pluralize(doorCount, 'Door')}`;
}
function sanitizeCounts(input = {}) {
  const normalize = key => {
    const num = Number(input?.[key]);
    if (!Number.isFinite(num) || num < 0) return 0;
    return Math.min(30, Math.round(num));
  };

  return {
    single_hung_double_hung: normalize('single_hung_double_hung'),
    picture: normalize('picture'),
    sliding: normalize('sliding'),
    casement: normalize('casement'),
    bay_bow: normalize('bay_bow'),
    patio_door: normalize('patio_door'),
  };
}

export default function WindowsLanding({ variant = 'default' }) {
  const currentHero = heroCopy[variant] || heroCopy.default;
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [counts, setCounts] = useState(initialCounts);
  const [narrative, setNarrative] = useState(fallbackNarrative);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [progress, setProgress] = useState({
    foundProperty: false,
    pulledImages: false,
    countedWindows: false,
    matchedPricing: false,
    builtRanges: false,
  });
  const [analysisPulse, setAnalysisPulse] = useState(0);
  const [previewImage, setPreviewImage] = useState('/images/windows-landing-hero-house.jpg');
  const [images, setImages] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const addressInputRef = useRef(null);

  const totalWindows = useMemo(
    () => counts.single_hung_double_hung + counts.picture + counts.sliding + counts.casement + counts.bay_bow,
    [counts],
  );

  const totalDoors = useMemo(
    () => counts.patio_door,
    [counts.patio_door],
  );

  const totalProjectUnits = totalWindows + totalDoors;
  const totalCountSummary = formatCountSummary(totalWindows, totalDoors);

  const priceRanges = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(pricingMatrix).map(([brandKey, brandPricing]) => [
          brandKey,
          calculateBrandRange(brandPricing, counts),
        ]),
      ),
    [counts],
  );

  useEffect(() => {
    const title = 'Luitjens Exteriors - See Your Window Pricing in About 3 Minutes';
    const description =
      'Lower your energy bills with the right windows. Enter your address and get your St. Louis pricing ranges by text.';
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

  useEffect(() => {
    if (step !== 2) return undefined;
    const intervalId = window.setInterval(() => {
      setAnalysisPulse(current => (current + 1) % 5);
    }, 1200);
    return () => window.clearInterval(intervalId);
  }, [step]);

  useEffect(() => {
    const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!mapsKey || !addressInputRef.current) return;

    let autocomplete;
    let placeListener;
    let detachedLoadListener = () => {};

    const initAutocomplete = () => {
      if (!window.google?.maps?.places || !addressInputRef.current) return;
      autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'name'],
        types: ['address'],
      });

      placeListener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace?.();
        const nextAddress = place?.formatted_address || place?.name || '';
        if (nextAddress) setAddress(nextAddress);
      });
    };

    if (window.google?.maps?.places) {
      initAutocomplete();
      return () => {
        if (placeListener?.remove) placeListener.remove();
      };
    }

    const existingScript = document.querySelector('script[data-google-maps-places="true"]');
    const onScriptLoad = () => initAutocomplete();

    if (existingScript) {
      existingScript.addEventListener('load', onScriptLoad);
      detachedLoadListener = () => existingScript.removeEventListener('load', onScriptLoad);
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(mapsKey)}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMapsPlaces = 'true';
      script.addEventListener('load', onScriptLoad);
      detachedLoadListener = () => script.removeEventListener('load', onScriptLoad);
      document.head.appendChild(script);
    }

    return () => {
      detachedLoadListener();
      if (placeListener?.remove) placeListener.remove();
    };
  }, []);

  const setCountValue = (key, value) => {
    setCounts(current => {
      const next = Number(value);
      const clamped = Number.isFinite(next) ? Math.max(0, Math.min(30, Math.round(next))) : 0;
      return { ...current, [key]: clamped };
    });
  };

  const updateCount = (key, delta) => {
    setCounts(current => ({
      ...current,
      [key]: Math.max(0, Math.min(30, current[key] + delta)),
    }));
  };

  const handleAddressStart = async event => {
    event.preventDefault();
    if (!address.trim()) {
      setStatus({ type: 'error', message: 'Please enter your street address to continue.' });
      return;
    }

    setStatus({ type: 'loading', message: '' });
    setProgress({
      foundProperty: false,
      pulledImages: false,
      countedWindows: false,
      matchedPricing: false,
      builtRanges: false,
    });
    setNarrative(fallbackNarrative);
    setCounts(initialCounts);
    setStep(2);

    const startedAt = Date.now();
    let availableImages = [];
    let propertyData = null;

    try {
      setProgress(current => ({ ...current, foundProperty: true }));

      const propertyResponse = await fetch(`/api/property-images?address=${encodeURIComponent(address.trim())}`);
      const propertyPayload = await propertyResponse.json().catch(() => ({}));

      if (propertyResponse.ok) {
        availableImages = Array.isArray(propertyPayload.images) ? propertyPayload.images.filter(Boolean) : [];
        propertyData = propertyPayload?.propertyData && typeof propertyPayload.propertyData === 'object'
          ? propertyPayload.propertyData
          : null;
      }

      setImages(availableImages);
      if (availableImages[0]) setPreviewImage(availableImages[0]);
      setProgress(current => ({ ...current, pulledImages: true }));

      const countResponse = await fetch('/api/window-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: availableImages, propertyData }),
      });

      const countPayload = await countResponse.json().catch(() => ({}));
      setProgress(current => ({ ...current, countedWindows: true, matchedPricing: true, builtRanges: true }));

      if (countResponse.ok) {
        const nextCounts = sanitizeCounts(countPayload?.counts || {});
        setCounts(nextCounts);
        setNarrative(`${countPayload?.narrative || fallbackNarrative}`.trim() || fallbackNarrative);
      } else {
        setNarrative(fallbackNarrative);
      }
    } catch {
      setProgress(current => ({ ...current, countedWindows: true, matchedPricing: true, builtRanges: true }));
      setNarrative(fallbackNarrative);
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_ANALYZE_MS) {
      await wait(MIN_ANALYZE_MS - elapsed);
    }

    setStep(3);
    setStatus({ type: 'idle', message: '' });
  };

  const handleProceedFromCounts = () => {
    if (totalProjectUnits <= 0) {
      setStatus({ type: 'error', message: 'Please set at least one window before continuing.' });
      return;
    }

    setStatus({ type: 'idle', message: '' });
    setStep(4);
  };

  const handleLeadSubmit = async event => {
    event.preventDefault();

    if (!address.trim() || !name.trim() || !phone.trim()) {
      setStatus({ type: 'error', message: 'Please complete address, full name, and mobile number.' });
      return;
    }

    if (totalProjectUnits <= 0) {
      setStatus({ type: 'error', message: 'Please set your window counts before submitting.' });
      return;
    }

    setStatus({ type: 'loading', message: '' });

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'windows',
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          source: '/windows-landing sms funnel',
          details: `Window count estimate: ${totalWindows} (single/double-hung:${counts.single_hung_double_hung}, picture:${counts.picture}, sliding:${counts.sliding}, casement:${counts.casement}, bay/bow:${counts.bay_bow}, patio door:${counts.patio_door}), images analyzed: ${images.length}`,
          totalWindows,
          propertyImageUrl: images[0] || null,
          pricing: {
            wincore_low: priceRanges.wincore[0],
            wincore_high: priceRanges.wincore[1],
            simonton_low: priceRanges.simonton[0],
            simonton_high: priceRanges.simonton[1],
            pella_low: priceRanges.pella[0],
            pella_high: priceRanges.pella[1],
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Unable to submit right now.');

      trackLeadConversion();
      trackMetaLead({ content_name: 'Windows landing SMS lead', value: 0, currency: 'USD' });

      setStatus({ type: 'success', message: "Success - we're texting your range now." });
      setStep(5);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Submission failed. Please call us now.' });
    }
  };

  const progressItems = [
    { label: 'Found your property', done: progress.foundProperty },
    { label: 'Pulled listing photos', done: progress.pulledImages },
    { label: 'Counting windows by type...', done: progress.countedWindows },
    { label: 'Building your all-in estimate range', done: progress.matchedPricing },
    { label: 'Preparing your editable window breakdown', done: progress.builtRanges },
  ];

  return (
    <div className="windows-landing-v2 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-sans text-gray-900 overflow-x-hidden">
      {step === 1 ? (
        <div className="relative">
          <header className="border-b border-gray-800 bg-[#0d1b2a]/95 px-4 py-4 backdrop-blur-md md:px-8">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <a className="flex items-center gap-3" href="/">
                <img
                  src="https://images.squarespace-cdn.com/content/v1/67c894550ca45b50d4350eb4/e11fb7cd-e691-4181-a329-40aea8c93872/Luitjens%2BExteriors%2BLogo.jpg?format=1500w"
                  alt="Luitjens Exteriors"
                  className="h-10 w-auto object-contain"
                />
              </a>
              <a 
                href={PHONE_HREF} 
                onClick={trackPhoneConversion}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow hover:bg-blue-700 h-9 px-4 py-2"
              >
                <Phone className="mr-2 size-4" />
                Call Now
              </a>
            </div>
          </header>

          <div className="relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden bg-[#0d1b2a]">
                  <img src="/images/windows-landing-hero-bg.jpg" alt="Luitjens Exteriors Windows" className="absolute left-0 bottom-0 h-[140%] w-full object-cover object-[65%_90%] md:h-[120%]" />
                </div>

                <div className="absolute inset-0 bg-black/25 sm:bg-gradient-to-r sm:from-black/55 sm:via-black/30 sm:to-black/10 pointer-events-none" />

                <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
                  <div className="grid items-center gap-8 lg:grid-cols-2">
                    <div>
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
                        <Sparkles className="size-4" />
                        {currentHero.badge || '🏠 Instant Price Range'}
                      </div>

                      <h1 className="mb-4 text-4xl md:text-5xl lg:text-6xl text-white leading-tight font-extrabold drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                        {currentHero.title}
                      </h1>

                      <p className="mb-8 text-lg text-white md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
                        {currentHero.subtitle || currentHero.lead}
                      </p>

                      <div className="relative rounded-2xl border border-white/20 bg-white/95 p-6 mt-6 shadow-2xl backdrop-blur-sm md:p-8">
                        <div className="absolute -right-4 -top-6 flex rotate-6 flex-col items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 px-4 py-2 font-black text-white shadow-xl shadow-red-500/20 border-4 border-white transform transition-transform hover:rotate-12 hover:scale-110 cursor-default">
                          <span className="text-sm tracking-widest uppercase opacity-90">May Only</span>
                          <span className="text-xl leading-none">10% OFF</span>
                        </div>
                        <h2 className="mb-2 pr-12 text-2xl font-extrabold leading-tight tracking-tight text-gray-900 md:pr-20">
                          Get your free quote today to lock in your 10% May discount.
                        </h2>
                        <p className="mb-6 text-sm text-gray-600">
                          Simply enter your home address to get started. 
                        </p>

                        <form onSubmit={handleAddressStart} className="space-y-4">
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                            <input
                              ref={addressInputRef}
                              type="text"
                              value={address}
                              onChange={e => setAddress(e.target.value)}
                              className="w-full rounded-xl border-2 border-gray-300 bg-white py-4 pl-12 pr-4 text-lg text-gray-900 placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                              placeholder="1234 Forsyth Blvd, St. Louis, MO"
                              autoComplete="street-address"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={status.type === 'loading'}
                            className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-6 text-lg font-medium text-white shadow hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-colors"
                          >
                            {status.type === 'loading' ? 'Building Pricing...' : (
                              <>
                                <ArrowRight className="mr-2 size-5" />
                                Get My Price Range Now
                              </>
                            )}
                          </button>
                        </form>
                        {status.type === 'error' ? <p className="mt-4 text-red-600 bg-red-50 p-2 rounded-md text-sm">{status.message}</p> : null}

                        <div className="mt-4 flex flex-col items-center justify-center gap-2 text-center text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Check className="size-4 shrink-0 text-green-600" />
                            <span>We use public listing photos to accurately price your window replacement.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:flex flex-col justify-center gap-6 text-white">
                      <h3 className="text-sm uppercase tracking-widest text-white/70 font-bold">The Luitjens Exteriors Difference</h3>
                      <div className="space-y-5">
                        <div className="flex items-start gap-4">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                            <Check className="size-5 text-green-400" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg">Real Prices, Zero Pressure</div>
                            <div className="text-sm text-white/70">We text your quote to your phone. No three-hour sales pitches.</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                            <Check className="size-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg">No Aggressive Sales Teams</div>
                            <div className="text-sm text-white/70">No call centers. Review your numbers on your own time.</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
                            <Check className="size-5 text-indigo-400" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg">Half the Price of the Big Guys</div>
                            <div className="text-sm text-white/70">Top-tier Wincore, Simonton &amp; Pella — without the corporate markup.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

          <div className="mx-auto max-w-5xl px-4 pb-8 pt-0 md:px-8 md:pb-16">
            <div className="space-y-12">

              <div className="mx-auto max-w-6xl pt-12">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg md:p-10">
                  <h3 className="mb-8 text-center text-sm uppercase tracking-wide text-gray-500 font-bold">
                    The Luitjens Exteriors Difference
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
                    <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center">
                      <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <Check className="size-5 sm:size-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900 sm:mb-2 sm:text-lg">Real Prices, Zero Pressure</h4>
                        <p className="text-sm text-gray-600 hidden sm:block">We text your quote directly to your phone. No grueling three-hour sales pitches in your living room.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center">
                      <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <Check className="size-5 sm:size-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900 sm:mb-2 sm:text-lg">No Aggressive Sales Teams</h4>
                        <p className="text-sm text-gray-600 hidden sm:block">We don't have massive call centers bothering you every day. You review the numbers entirely on your own time.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center">
                      <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <Check className="size-5 sm:size-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900 sm:mb-2 sm:text-lg">Half the Price of the Big Guys</h4>
                        <p className="text-sm text-gray-600 hidden sm:block">You get top-tier Wincore, Simonton, and Pella windows without the bloated corporate markup.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                  <div className="grid items-center gap-6 p-6 md:grid-cols-[auto_1fr] md:p-8">
                    <div className="mx-auto size-32 overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 md:size-40 border-2 border-blue-500">
                      <img src="/images/owners-couple.jpg" alt="Alexis and Michael Luitjens" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="mb-2 text-xs uppercase tracking-wide text-gray-500 font-bold">
                        Family Owned & Operated
                      </div>
                      <h3 className="mb-2 text-2xl text-gray-900 font-bold">Alexis & Michael Luitjens</h3>
                      <p className="mb-4 text-gray-600 italic">
                        "Michael is on every install. I answer every text. That's the whole company and
                        that's on purpose."
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Check className="size-4 text-blue-600" />
                          <span>10+ Years in St. Louis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="size-4 text-blue-600" />
                          <span>BBB A-Rated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="size-4 text-blue-600" />
                          <span>Licensed & Insured</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Gallery Carousel */}
              <div className="mx-auto max-w-4xl px-4 py-8">
                <h3 className="mb-8 text-center text-3xl font-extrabold text-gray-900 tracking-tight">Our Work</h3>
                <div className="relative group overflow-hidden rounded-2xl shadow-2xl bg-gray-100">
                  <div className="aspect-[16/10] relative">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentPhotoIndex}
                        src={GALLERY_PHOTOS[currentPhotoIndex]}
                        alt="Luitjens Exteriors project"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="h-full w-full object-cover"
                        style={{ 
                          imageRendering: 'high-quality',
                          WebkitBackfaceVisibility: 'hidden',
                          backfaceVisibility: 'hidden',
                        }}
                      />
                    </AnimatePresence>
                    
                    {/* Navigation Arrows */}
                    <button 
                      onClick={() => setCurrentPhotoIndex(prev => (prev === 0 ? GALLERY_PHOTOS.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-900 shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="size-6" />
                    </button>
                    <button 
                      onClick={() => setCurrentPhotoIndex(prev => (prev === GALLERY_PHOTOS.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-900 shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="size-6" />
                    </button>

                    {/* Photo Info Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                      <p className="text-sm font-medium opacity-90">Project {currentPhotoIndex + 1} of {GALLERY_PHOTOS.length}</p>
                    </div>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex gap-2 p-2 overflow-x-auto bg-white scrollbar-hide">
                    {GALLERY_PHOTOS.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPhotoIndex(idx)}
                        className={`relative size-16 shrink-0 overflow-hidden rounded-lg transition-all ${currentPhotoIndex === idx ? 'ring-2 ring-blue-600 opacity-100 scale-105' : 'opacity-50 hover:opacity-100'}`}
                      >
                        <img src={photo} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
            
            <footer className="mt-16 border-t border-gray-200 bg-transparent py-8">
              <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-600">
                <p className="text-gray-500">
                  © 2026 Luitjens Exteriors. All rights reserved. <Link to="/privacy-policy" className="underline">Privacy Policy</Link> | <Link to="/terms-of-service" className="underline">Terms of Service</Link>
                </p>
              </div>
            </footer>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mx-auto max-w-2xl px-4 py-8">
          <header className="mb-12 flex justify-center">
            <img
              src="https://images.squarespace-cdn.com/content/v1/67c894550ca45b50d4350eb4/e11fb7cd-e691-4181-a329-40aea8c93872/Luitjens%2BExteriors%2BLogo.jpg?format=1500w"
              alt="Luitjens Exteriors"
              className="h-12 w-auto brightness-0"
            />
          </header>
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-8 overflow-hidden rounded-xl border-2 border-blue-500 shadow-lg">
              <img src={previewImage} alt="Property preview" className="h-48 w-full object-cover" />
            </div>
            <h2 className="mb-2 text-3xl font-extrabold text-gray-900 tracking-tight">Analyzing your home...</h2>
            <p className="mb-8 text-gray-600">Hang tight while we process your home details.</p>
            <div className="space-y-4">
              {progressItems.map((item, idx) => (
                <div key={item.label} className={`flex items-center gap-4 transition-all duration-500 ${item.done ? 'opacity-100' : 'opacity-40'} ${analysisPulse === idx ? 'scale-105' : ''}`}>
                  <div className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${item.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                    {item.done && <Check className="size-4" />}
                  </div>
                  <span className={`text-sm font-medium ${item.done ? 'text-gray-900' : 'text-gray-500'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            {/* Loading Indicator */}
            <div className="mt-12 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                initial={{ width: "0%" }}
                animate={{ width: `${(progressItems.filter(p => p.done).length / progressItems.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mx-auto max-w-3xl px-4 py-12">
          <header className="mb-12 flex justify-center">
            <img
              src="https://images.squarespace-cdn.com/content/v1/67c894550ca45b50d4350eb4/e11fb7cd-e691-4181-a329-40aea8c93872/Luitjens%2BExteriors%2BLogo.jpg?format=1500w"
              alt="Luitjens Exteriors"
              className="h-12 w-auto brightness-0"
            />
          </header>
          <div className="rounded-3xl border border-gray-200 bg-white shadow-2xl p-6 md:p-10 scale-[1.02] transform transition-all">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">Step 2 of 3</div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Here's what we found. Look right?</h2>
                <div className="mt-2 flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  <MapPin size={14} />
                  {address.trim() || '1234 Forsyth Blvd'}
                </div>
              </div>
            </div>

            <div className="mb-8 overflow-hidden rounded-2xl border-2 border-gray-100 shadow-inner">
              <img src={previewImage} alt="Detected property" className="h-64 w-full object-cover" />
            </div>

            <div className="mb-8 rounded-2xl bg-indigo-50 p-6 border border-indigo-100">
              <div className="mb-2 flex items-center gap-2 text-indigo-900 font-bold">
                <Eye size={18} />
                <span>AI Vision Report</span>
                <span className="ml-auto rounded-full bg-white/50 px-2.5 py-0.5 text-[10px] tracking-wider uppercase text-indigo-700 font-black">Verify Counts</span>
              </div>
              <p className="text-sm leading-relaxed text-indigo-800 italic">{narrative || fallbackNarrative}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { id: 'single_hung_double_hung', label: 'Single / Double Hung', hint: 'Vertical sliders', icon: <DoubleHungIcon size={24} color="#2563eb" /> },
                { id: 'picture', label: 'Picture', hint: 'Fixed windows', icon: <PictureIcon size={24} color="#2563eb" /> },
                { id: 'sliding', label: 'Sliding', hint: 'Horizontal sliders', icon: <SlidingIcon size={24} color="#2563eb" /> },
                { id: 'casement', label: 'Casement', hint: 'Crank outward', icon: <CasementIcon size={24} color="#2563eb" /> },
                { id: 'bay_bow', label: 'Bay / Bow', hint: 'Projected units', icon: <BayBowIcon size={24} color="#2563eb" /> },
                { id: 'patio_door', label: 'Patio / French Doors', hint: 'Glass exit doors', icon: <SlidingPatioDoorIcon size={24} color="#2563eb" /> },
              ].map(windowType => (
                <div key={windowType.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4 hover:border-blue-200 hover:bg-blue-50/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100">
                      {windowType.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{windowType.label}</div>
                      <div className="text-[11px] text-gray-500">{windowType.hint}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => updateCount(windowType.id, -1)} className="flex size-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 select-none">
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={counts[windowType.id]}
                      onChange={e => setCountValue(windowType.id, e.target.value)}
                      className="w-10 bg-transparent text-center font-black text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button type="button" onClick={() => updateCount(windowType.id, 1)} className="flex size-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 select-none">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between rounded-2xl border-2 border-gray-900 bg-gray-900 p-6 text-white shadow-xl">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Project Units</div>
                <div className="text-xl font-extrabold">{totalCountSummary}</div>
              </div>
              <button 
                onClick={handleProceedFromCounts}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Confirm & See Prices
                <ArrowRight size={18} />
              </button>
            </div>
            
            {status.type === 'error' ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600">{status.message}</p> : null}
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="mx-auto max-w-2xl px-4 py-12">
          <header className="mb-12 flex justify-center">
            <img
              src="https://images.squarespace-cdn.com/content/v1/67c894550ca45b50d4350eb4/e11fb7cd-e691-4181-a329-40aea8c93872/Luitjens%2BExteriors%2BLogo.jpg?format=1500w"
              alt="Luitjens Exteriors"
              className="h-12 w-auto brightness-0"
            />
          </header>
          <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-12 shadow-2xl">
            <div className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600">Step 3 of 3 — Last Step</div>
            <h2 className="mb-4 text-4xl font-extrabold text-gray-900 tracking-tight leading-none">Where should we <span className="text-blue-600">text your ranges?</span></h2>
            <p className="mb-10 text-lg text-gray-600 font-medium">We built a custom price range for your home across 3 brands. Drop your number and we'll text it over in under a minute.</p>
            
            <div className="mb-10 rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
              <div className="mb-4 text-sm font-bold text-blue-900">You'll receive a detailed text with:</div>
              <div className="space-y-3">
                {[
                  'Your project range with all-in pricing',
                  'Individual brand pricing (Wincore, Simonton, Pella)',
                  'What similar St. Louis homes actually paid',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="size-3" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Your Full Name</label>
                  <input 
                    type="text" 
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                    placeholder="Sarah Johnson" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Your Mobile Number</label>
                  <input 
                    type="tel" 
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                    placeholder="(314) 555-0199" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    required
                  />
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4 text-[10px] leading-relaxed text-gray-500">
                By submitting, you consent to receive SMS text messages from Luitjens Exteriors at the number provided. Message/data rates may apply. Reply STOP to cancel. Review our{' '}
                <Link to="/privacy-policy" className="underline hover:text-blue-600">Privacy Policy</Link> and <Link to="/terms-of-service" className="underline hover:text-blue-600">Terms</Link>.
              </div>

              <button 
                type="submit" 
                disabled={status.type === 'loading'}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-5 text-xl font-black text-white shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all transform active:scale-[0.98]"
              >
                {status.type === 'loading' ? 'Encrypting & Sending...' : 'Text Me My Ranges'}
                <ArrowRight className="size-6" />
              </button>
              
              <div className="text-center text-xs font-medium text-gray-400">⚡ Instant Delivery • No Hidden Fees • No Sales Pressure</div>

              {status.message && (
                <p className={`rounded-xl p-4 text-center text-sm font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {status.message}
                </p>
              )}
            </form>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="mx-auto max-w-2xl px-4 py-24">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
            <div className="relative h-48 sm:h-64">
              <img src="/images/windows-landing-hero-bg.jpg" alt="Finished Luitjens project" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full bg-green-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                <Check className="size-4" />
                <span>Request Received</span>
              </div>
            </div>
            
            <div className="p-8 md:p-12">
              <h2 className="mb-2 text-4xl font-extrabold text-gray-900 tracking-tight leading-none">Texting you now{ name ? `, ${name.split(' ')[0]}` : ''}.</h2>
              <p className="mb-10 text-lg text-gray-600 font-medium">Your {totalCountSummary} range is on its way. Watch for a text from Alexis at <span className="font-bold text-gray-900 whitespace-nowrap">{PHONE}</span> in the next minute.</p>
              
              <div className="mb-10 space-y-6">
                <div className="flex gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Check className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Estimate built</h4>
                    <p className="text-sm text-gray-500">Your counts and address are locked in.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <div className="animate-pulse flex size-4 items-center justify-center rounded-full bg-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Text sending</h4>
                    <p className="text-sm text-gray-500">We're sending the brand ranges to your phone now.</p>
                  </div>
                </div>
                <div className="flex gap-4 opacity-40">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 font-bold text-xs ring-1 ring-gray-200">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Ready for next steps</h4>
                    <p className="text-sm text-gray-500">Reply YES and Alexis will text visit times.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-8 border-t border-gray-100">
                <div className="text-sm font-medium text-gray-500 italic">Want to talk with Michael or Alexis now?</div>
                <a 
                  href={PHONE_HREF} 
                  onClick={trackPhoneConversion}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-6 py-3 font-bold text-gray-900 transition-colors hover:bg-gray-200"
                >
                  <Phone className="size-4" />
                  Call {PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="mt-12 py-12 border-t border-gray-200/50">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm font-medium text-gray-500">
            © 2026 Luitjens Exteriors. All rights reserved. {' '}
            <Link to="/privacy-policy" className="underline hover:text-blue-600">Privacy Policy</Link>
            {' '}|{' '}
            <Link to="/terms-of-service" className="underline hover:text-blue-600">Terms of Service</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}





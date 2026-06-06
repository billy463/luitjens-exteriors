import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Check, ChevronDown, ChevronRight, MapPin, Minus, Phone, Plus, ShieldCheck, Star } from 'lucide-react';
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
const LOGO_SRC = '/images/luitjens-logo-trans.png';

// ---- Per-variant opening copy. Only the intro + offer badge change between the 3 pages. ----
const VARIANTS = {
  default: {
    offerBadge: null,
    intro: [
      "Hey, I'm Alexis 👋 — the estimate tool the Luitjens family built. Michael's always out on the job sites and I answer the texts, so we made this to price windows the honest way.",
      "No salesperson, no pressure — just our real, wholesale-based pricing.",
    ],
  },
  mayDiscount: {
    offerBadge: '$1,000 OFF · 5+ windows · May only',
    intro: [
      "Hey, I'm Alexis 👋 — the estimate tool the Luitjens family built so you can skip the sales pitch.",
      "Quick heads up: through the end of May, any quote covering 5+ windows gets $1,000 off automatically — I'll build it right into your numbers.",
    ],
  },
  speedPricing: {
    offerBadge: 'Instant pricing + energy savings estimate',
    intro: [
      "Hey, I'm Alexis 👋 — the instant estimate tool the Luitjens family built.",
      "Old windows leak money every month. I can show you a real replacement range and what new windows could save you — no salesperson, no pressure.",
    ],
  },
};

const MENU_PROMPT = "Since you're looking at new windows — what would you like to see first?";

const MENU_OPTIONS = [
  { id: 'photos', label: '📸 Photos of our work' },
  { id: 'reviews', label: '⭐ Reviews from our customers' },
  { id: 'brands', label: '🏷️ Manufacturers we offer' },
  { id: 'about', label: '👋 About us' },
  { id: 'offer', label: '⚡ Get my offer now' },
];

// Collapsing photo header at the top of the page.
const HERO_IMAGE = '/images/hero-dining.jpg';

// Current month name, so the limited-time offer always reads as "this month" (auto-updates).
const CURRENT_MONTH = new Date().toLocaleString('en-US', { month: 'long' });

// Verified install photos that exist in public/images.
const GALLERY_PHOTOS = [
  '/images/2025-07-08 10.11.58.jpg',
  '/images/2025-11-20 10.21.05.jpg',
  '/images/2025-11-06 13.47.36.jpg',
  '/images/2025-10-13 13.11.16.jpg',
  '/images/2025-08-14 17.04.49.jpg',
  '/images/2025-06-07 10.39.45.jpg',
  '/images/2025-04-21 17.45.22.jpg',
];

// Real 5-star Google reviews (window-related ones first, since this is the windows page).
const REVIEWS = [
  { name: 'Roberto T.', stars: 5, text: 'Installed my windows — did an amazing job, guys were amazing. I recommend using Luitjens Exteriors.' },
  { name: 'Dino H.', stars: 5, text: 'I had Mike do my whole house from windows to siding and roofing. Super quick turnaround on everything. House turned out just like we imagined it. Very knowledgeable — don\'t be afraid to use this contractor on any home project!' },
  { name: 'Dennis S.', stars: 5, text: 'Mike and Lexi remodeled my entire house — roof, windows, siding, gutters, fascia and soffit. Turned out amazing. A great company, nothing but professional.' },
  { name: 'Paula B.', stars: 5, text: 'Luitjens Exteriors replaced our roof, siding, and gutters after the tornado last year. Mike was excellent helping with our insurance claim and the workmanship was outstanding! Our home turned out beautiful!!' },
  { name: 'Lindsay L.', stars: 5, text: 'Mike took excellent care of me when I had storm damage to my roof and siding. He and his crew have also taken phenomenal care of my dad on several occasions. I couldn\'t ask for someone more knowledgeable and professional.' },
  { name: 'Kelly M.', stars: 5, text: 'Very professional, excellent communication and trustworthy. My husband and I will be using this company again in the future.' },
  { name: 'Kamber S.', stars: 5, text: 'Great service, trustworthy and so much more! Can\'t recommend enough!' },
  { name: 'Cass H.', stars: 5, text: 'Good communication and helped with insurance — great work!' },
  { name: 'Ashley W.', stars: 5, text: 'We got a new door for our basement and it is beautiful! Changed the whole look of our finished basement.' },
  { name: 'Billy W.', stars: 5, text: 'Wonderful experience! They helped me get a new roof with my insurance company. Fast and easy to communicate — another roofing company said they were months out.' },
];

const BRANDS = [
  {
    name: 'Wincore',
    tag: 'Best value',
    blurb: 'Efficient vinyl windows with the biggest bang for your buck.',
    logo: '/images/brands/wincore-logo.png',
    window: '/images/brands/wincore-window.jpg',
    sizzle:
      'American-made vinyl built for real Midwest weather. Fusion-welded frames and energy-saving Low-E glass keep the drafts out and your bills down — premium performance without the premium price tag. The smart-money pick.',
  },
  {
    name: 'Simonton',
    tag: 'Most popular',
    blurb: 'A national favorite — strong warranty, great quality-to-price sweet spot.',
    logo: '/images/brands/simonton-logo.png',
    window: '/images/brands/simonton-window.jpg',
    sizzle:
      'The crowd favorite for a reason. ENERGY STAR efficiency, a rock-solid warranty, and a clean, modern look that fits any St. Louis home. The quality-to-price sweet spot thousands of homeowners trust.',
  },
  {
    name: 'Pella',
    tag: 'Premium',
    blurb: 'Top-tier name brand for the best look and performance.',
    logo: '/images/brands/pella-logo.png',
    window: '/images/brands/pella-window.jpg',
    sizzle:
      "The name everyone knows — and for good reason. Showroom-grade craftsmanship, designer styles, and best-in-class performance that turns heads and lasts for decades. When you want the very best, it's Pella.",
  },
];

const initialCounts = {
  single_hung_double_hung: 0,
  picture: 0,
  sliding: 0,
  casement: 0,
  bay_bow: 0,
  patio_door: 0,
};

const WINDOW_TYPES = [
  { id: 'single_hung_double_hung', label: 'Single / Double Hung', hint: 'Vertical sliders', Icon: DoubleHungIcon },
  { id: 'picture', label: 'Picture', hint: 'Fixed windows', Icon: PictureIcon },
  { id: 'sliding', label: 'Sliding', hint: 'Horizontal sliders', Icon: SlidingIcon },
  { id: 'casement', label: 'Casement', hint: 'Crank outward', Icon: CasementIcon },
  { id: 'bay_bow', label: 'Bay / Bow', hint: 'Projected units', Icon: BayBowIcon },
  { id: 'patio_door', label: 'Patio / French Doors', hint: 'Glass exit doors', Icon: SlidingPatioDoorIcon },
];

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

// The specific window line we quote per brand + sales language.
// TODO(Billy): confirm these are the exact lines Luitjens quotes.
const BRAND_LINES = {
  wincore: {
    line: 'Wincore 5400 Series',
    sell: 'Our value workhorse — contoured, fusion-welded vinyl frames with dual-pane Low-E glass and a limited lifetime warranty. Quietly efficient and built to last, at a fraction of the big-box price.',
  },
  simonton: {
    line: 'Simonton Reflections 5500',
    sell: "America's crowd favorite — a sturdy double-hung with Super Spacer® and energy-saving Low-E glass, backed by a limited lifetime warranty. The quality-to-price sweet spot thousands of homeowners trust.",
  },
  pella: {
    line: 'Pella 250 Series',
    sell: "Pella's most popular vinyl line — frames 52% stronger than ordinary vinyl, a 3-point weather-repel system, and ENERGY STAR® options in all 50 states. The premium name, the premium feel.",
  },
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const money = n => `$${Math.round(n).toLocaleString()}`;

function calculateBrandRange(brandPricing, counts) {
  return Object.entries(brandPricing.windowTypes).reduce(
    ([low, high], [type, range]) => {
      const qty = counts[type] || 0;
      return [low + range.low * qty, high + range.high * qty];
    },
    [0, 0],
  );
}

function sanitizeCounts(input = {}) {
  const norm = key => {
    const num = Number(input?.[key]);
    if (!Number.isFinite(num) || num < 0) return 0;
    return Math.min(30, Math.round(num));
  };
  return {
    single_hung_double_hung: norm('single_hung_double_hung'),
    picture: norm('picture'),
    sliding: norm('sliding'),
    casement: norm('casement'),
    bay_bow: norm('bay_bow'),
    patio_door: norm('patio_door'),
  };
}

function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function summarizeCounts(windowCount, doorCount) {
  const windowText = `${windowCount} ${pluralize(windowCount, 'window')}`;
  if (!doorCount) return windowText;
  return `${windowText} & ${doorCount} ${pluralize(doorCount, 'door')}`;
}

export default function WindowsLanding({ variant = 'default' }) {
  const config = VARIANTS[variant] || VARIANTS.default;

  const [messages, setMessages] = useState([]);
  const [stage, setStage] = useState('boot'); // boot → address → analyzing → counts → pricing → contact → done
  const [botTyping, setBotTyping] = useState(false);

  const [input, setInput] = useState('');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [counts, setCounts] = useState(initialCounts);
  const [images, setImages] = useState([]);
  const [propertyPhoto, setPropertyPhoto] = useState(null);
  const [leadStatus, setLeadStatus] = useState({ type: 'idle', message: '' });
  const [asking, setAsking] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);
  const [addressMeta, setAddressMeta] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const idRef = useRef(0);
  const mountedRef = useRef(true);
  const threadRef = useRef(null);
  const addressInputRef = useRef(null);
  const startedRef = useRef(false);
  const placesLibRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const suggestTimerRef = useRef(null);
  const suggestSeqRef = useRef(0);
  const runAnalysisRef = useRef(null);
  const seenMenuRef = useRef(new Set());
  const holdScrollRef = useRef(false);
  const recapSentRef = useRef(false);
  const convertedRef = useRef(false);
  const recapRef = useRef({});
  const sessionStartRef = useRef(Date.now());

  const nextId = () => {
    idRef.current += 1;
    return idRef.current;
  };

  const totalWindows = useMemo(
    () =>
      counts.single_hung_double_hung +
      counts.picture +
      counts.sliding +
      counts.casement +
      counts.bay_bow,
    [counts],
  );
  const totalDoors = counts.patio_door;
  const totalUnits = totalWindows + totalDoors;

  const priceRanges = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(pricingMatrix).map(([key, brand]) => [key, calculateBrandRange(brand, counts)]),
      ),
    [counts],
  );

  const projectRange = useMemo(() => {
    const lows = Object.values(priceRanges).map(r => r[0]);
    const highs = Object.values(priceRanges).map(r => r[1]);
    return [Math.min(...lows), Math.max(...highs)];
  }, [priceRanges]);

  // Keep the latest session snapshot in a ref so the on-exit recap handler reads current values.
  recapRef.current = {
    variant,
    stage,
    address,
    totalWindows,
    totalDoors,
    projectRange,
    messages,
    seenMenu: Array.from(seenMenuRef.current),
  };

  const addMessage = useCallback(msg => {
    setMessages(prev => [...prev, { id: msg.id ?? Date.now() + Math.random(), ...msg }]);
  }, []);

  const pushBot = useCallback(
    (text, extra = {}) => addMessage({ id: nextId(), from: 'bot', kind: 'text', text, ...extra }),
    [addMessage],
  );
  const pushUser = useCallback(
    (text, extra = {}) => addMessage({ id: nextId(), from: 'user', kind: 'text', text, ...extra }),
    [addMessage],
  );

  // Bot "types" for a beat, then says each line.
  const botSay = useCallback(
    async (lines, { perLineMs = 850 } = {}) => {
      const arr = Array.isArray(lines) ? lines : [lines];
      for (const line of arr) {
        if (!mountedRef.current) return;
        setBotTyping(true);
        await wait(Math.min(1400, 500 + line.length * 12));
        if (!mountedRef.current) return;
        setBotTyping(false);
        pushBot(line);
        await wait(perLineMs);
      }
    },
    [pushBot],
  );

  const scrollThreadToBottom = useCallback(() => {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);

  // Auto-scroll the thread on new content — unless we're intentionally holding the view
  // (e.g. on the pricing reveal, so the user reads the numbers instead of being yanked to the form).
  useEffect(() => {
    if (holdScrollRef.current) return;
    scrollThreadToBottom();
  }, [messages, botTyping, scrollThreadToBottom]);

  // Email a session recap when an ENGAGED visitor leaves (covers people who never submit).
  // Skipped for instant bounces (no interaction) and for converters (their lead email has it all).
  useEffect(() => {
    const send = () => {
      if (recapSentRef.current || convertedRef.current) return;
      const d = recapRef.current || {};
      const msgs = Array.isArray(d.messages) ? d.messages : [];
      const userActions = msgs.filter(m => m.kind === 'text' && m.from === 'user').length;
      const engaged = userActions > 0 || (d.stage && d.stage !== 'boot' && d.stage !== 'menu');
      if (!engaged) return;
      recapSentRef.current = true;
      const transcript = msgs
        .filter(m => m.kind === 'text' && m.text)
        .map(m => `${m.from === 'bot' ? 'Alexis' : 'Visitor'}: ${m.text}`)
        .join('\n');
      const reachedPricing = ['pricing', 'contact', 'done'].includes(d.stage);
      const payload = JSON.stringify({
        variant: d.variant,
        stageReached: d.stage,
        address: d.address || null,
        totalWindows: reachedPricing ? d.totalWindows : null,
        totalDoors: reachedPricing ? d.totalDoors : null,
        pricingLow: reachedPricing && d.projectRange ? Math.round(d.projectRange[0]) : null,
        pricingHigh: reachedPricing && d.projectRange ? Math.round(d.projectRange[1]) : null,
        menuViewed: d.seenMenu || [],
        durationSec: (Date.now() - sessionStartRef.current) / 1000,
        transcript,
      });
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/session-recap', new Blob([payload], { type: 'application/json' }));
        } else {
          fetch('/api/session-recap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          });
        }
      } catch {
        // best-effort; ignore
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') send();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', send);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', send);
    };
  }, []);

  // SEO / page meta.
  useEffect(() => {
    document.title = 'Luitjens Exteriors — Get a Real Window Estimate, No Sales Pressure';
    const setMeta = (attr, key, content) => {
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    const description =
      "Drop your address and our family-built estimate tool pulls your home's photos, counts your windows, and shows your St. Louis replacement pricing in about a minute. No salesperson, no pressure.";
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', 'Luitjens Exteriors — Instant Window Estimate');
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
  }, []);

  // Opening sequence (runs once).
  useEffect(() => {
    mountedRef.current = true;
    if (startedRef.current) return undefined;
    startedRef.current = true;
    (async () => {
      await wait(400);
      await botSay(config.intro, { perLineMs: 650 });
      await botSay(MENU_PROMPT, { perLineMs: 300 });
      if (!mountedRef.current) return;
      addMessage({ id: nextId(), from: 'bot', kind: 'menu', options: MENU_OPTIONS });
      setStage('menu');
    })();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the Google Maps JS (Places + Geocoder) once, early, so validation is ready by the address step.
  useEffect(() => {
    const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!mapsKey) return undefined;
    if (window.google?.maps?.places) {
      setMapsReady(true);
      return undefined;
    }
    const existing = document.querySelector('script[data-google-maps-places="true"]');
    const onLoad = () => setMapsReady(true);
    if (existing) {
      existing.addEventListener('load', onLoad);
      if (window.google?.maps?.places) setMapsReady(true);
      return () => existing.removeEventListener('load', onLoad);
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(mapsKey)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsPlaces = 'true';
    script.addEventListener('load', onLoad);
    document.head.appendChild(script);
    return () => script.removeEventListener('load', onLoad);
  }, []);

  // ---- New Google Places API (Autocomplete Data API) ----
  const ensurePlaces = useCallback(async () => {
    if (placesLibRef.current) return placesLibRef.current;
    if (!window.google?.maps?.importLibrary) return null;
    placesLibRef.current = await window.google.maps.importLibrary('places');
    return placesLibRef.current;
  }, []);

  const fetchSuggestions = useCallback(
    async text => {
      const query = text.trim();
      if (query.length < 4) {
        setSuggestions([]);
        return;
      }
      const seq = ++suggestSeqRef.current;
      try {
        const places = await ensurePlaces();
        if (!places?.AutocompleteSuggestion) return;
        if (!sessionTokenRef.current && places.AutocompleteSessionToken) {
          sessionTokenRef.current = new places.AutocompleteSessionToken();
        }
        const { suggestions: sg } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          includedRegionCodes: ['us'],
          sessionToken: sessionTokenRef.current || undefined,
        });
        if (seq !== suggestSeqRef.current || !mountedRef.current) return; // stale response
        const mapped = (sg || [])
          .filter(s => s.placePrediction)
          .slice(0, 5)
          .map(s => ({
            id: s.placePrediction.placeId,
            text: s.placePrediction.text?.toString?.() || s.placePrediction.text || '',
            prediction: s.placePrediction,
          }));
        setSuggestions(mapped);
      } catch (error) {
        // Most commonly a referrer/permission block — fail closed (no suggestions, so nothing validates).
        console.warn('[places] suggestion fetch failed', error?.message);
        if (seq === suggestSeqRef.current) setSuggestions([]);
      }
    },
    [ensurePlaces],
  );

  const acceptValidatedPlace = useCallback(
    async place => {
      sessionTokenRef.current = null; // selection ends the billing session
      setSuggestions([]);
      setInput('');
      setAddress(place.formatted_address);
      setAddressMeta(place);
      pushUser(place.formatted_address);
      await runAnalysisRef.current(place.formatted_address);
    },
    [pushUser],
  );

  const selectSuggestion = useCallback(
    async item => {
      try {
        await ensurePlaces();
        const place = item.prediction.toPlace();
        await place.fetchFields({ fields: ['formattedAddress', 'location', 'addressComponents'] });
        const comps = place.addressComponents || [];
        const has = type => comps.some(c => (c.types || []).includes(type));
        const complete = has('street_number') && (has('locality') || has('postal_town') || has('sublocality'));
        const loc = place.location;
        const resolved = {
          formatted_address: place.formattedAddress || item.text,
          lat: loc?.lat ? loc.lat() : null,
          lng: loc?.lng ? loc.lng() : null,
          placeId: place.id || item.id || null,
          complete,
        };
        if (!complete) {
          setSuggestions([]);
          setInput(resolved.formatted_address);
          await botSay(
            'That looks like a street or area — I need your specific house (number, street, city, and ZIP). Mind picking the full address?',
          );
          return;
        }
        await acceptValidatedPlace(resolved);
      } catch (error) {
        console.warn('[places] select failed', error?.message);
        await botSay(`I had trouble pulling that address up — try again, or call/text us at ${PHONE}.`);
      }
    },
    [ensurePlaces, acceptValidatedPlace, botSay],
  );

  const handleAddressInputChange = value => {
    setInput(value);
    if (stage !== 'address') return;
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    if (value.trim().length < 4) {
      setSuggestions([]);
      return;
    }
    suggestTimerRef.current = setTimeout(() => fetchSuggestions(value), 280);
  };

  const startAddressEntry = async typed => {
    setStage('address');
    setInput(typed);
    await botSay('Go ahead and tap your full address from the list as it pops up 👇', { perLineMs: 200 });
    fetchSuggestions(typed);
  };


  const updateCount = (key, delta) =>
    setCounts(cur => ({ ...cur, [key]: Math.max(0, Math.min(30, cur[key] + delta)) }));
  const setCountValue = (key, value) =>
    setCounts(cur => {
      const n = Number(value);
      return { ...cur, [key]: Number.isFinite(n) ? Math.max(0, Math.min(30, Math.round(n))) : 0 };
    });

  // ---- Spine: address → analyze → counts ----
  const runAnalysis = async addr => {
    setStage('analyzing');
    setCounts(initialCounts);
    let availableImages = [];
    let propertyData = null;

    await botSay([`Perfect — pulling up ${addr.split(',')[0]} now…`], { perLineMs: 300 });
    setBotTyping(true);

    try {
      const propRes = await fetch(`/api/property-images?address=${encodeURIComponent(addr)}`);
      const propPayload = await propRes.json().catch(() => ({}));
      if (propRes.ok) {
        availableImages = Array.isArray(propPayload.images) ? propPayload.images.filter(Boolean) : [];
        propertyData =
          propPayload?.propertyData && typeof propPayload.propertyData === 'object'
            ? propPayload.propertyData
            : null;
      }
      setImages(availableImages);

      const countRes = await fetch('/api/window-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: availableImages, propertyData }),
      });
      const countPayload = await countRes.json().catch(() => ({}));
      const narrative = `${countPayload?.narrative || ''}`.trim();
      if (countRes.ok) setCounts(sanitizeCounts(countPayload?.counts || {}));

      // Show the photos the AI says best show the home's exterior windows (not just the first one).
      const idxList =
        Array.isArray(countPayload?.bestImageIndices) && countPayload.bestImageIndices.length
          ? countPayload.bestImageIndices
          : [0];
      const photoUrls = [];
      for (const i of idxList) {
        const url = availableImages[i];
        if (url && !photoUrls.includes(url)) photoUrls.push(url);
      }
      if (photoUrls.length === 0 && availableImages[0]) photoUrls.push(availableImages[0]);
      setPropertyPhoto(photoUrls[0] || null);

      if (!mountedRef.current) return;
      setBotTyping(false);

      if (photoUrls.length) {
        addMessage({ id: nextId(), from: 'bot', kind: 'photo', srcs: photoUrls });
      }
      await botSay(
        [
          narrative ||
            "I couldn't pull clear photos of your place, so I started you at zero — just tell me roughly how many of each you've got below and I'll price it.",
          'Here\'s my count — tap the +/- to fix anything I got wrong, then hit "See my pricing."',
        ],
        { perLineMs: 500 },
      );
    } catch {
      if (!mountedRef.current) return;
      setBotTyping(false);
      await botSay(
        "Hmm, I couldn't reach your listing photos just now. No problem — set your counts below and I'll still build your range.",
      );
    }

    if (!mountedRef.current) return;
    addMessage({ id: nextId(), from: 'bot', kind: 'counts' });
    setStage('counts');
  };
  runAnalysisRef.current = runAnalysis;

  // Submitting typed text (Enter/Send) never proceeds on its own — the ONLY way forward is tapping a
  // validated suggestion (handled by selectSuggestion). This re-prompts them to pick from the list.
  const handleAddressSubmit = async value => {
    const raw = value.trim();
    if (!raw) return;
    pushUser(raw);
    setInput('');
    if (!window.google?.maps?.importLibrary) {
      await botSay(
        `I'm having trouble loading the address lookup right now — give us a quick call or text at ${PHONE} and we'll get your estimate started.`,
      );
      return;
    }
    if (stage !== 'address') setStage('address');
    await botSay(
      'I want to make sure I pull up the right house — keep typing and then tap your full address from the list that drops down (I need the street number, city, and ZIP).',
    );
    fetchSuggestions(raw);
  };

  const handleMenuChoice = async option => {
    pushUser(option.label);

    if (option.id === 'offer') {
      setStage('address');
      await botSay(
        ["Perfect — let's get you a real number.", "What's your home address? I'll pull your place up and count the windows."],
        { perLineMs: 450 },
      );
      return;
    }

    if (option.id === 'photos') {
      await botSay('Here\'s some of our recent St. Louis work 👇');
      if (!mountedRef.current) return;
      addMessage({ id: nextId(), from: 'bot', kind: 'gallery' });
    } else if (option.id === 'reviews') {
      await botSay('Here\'s what a few neighbors had to say 👇');
      if (!mountedRef.current) return;
      addMessage({ id: nextId(), from: 'bot', kind: 'reviews' });
    } else if (option.id === 'brands') {
      await botSay('Here are 3 of our most popular brands 👇');
      if (!mountedRef.current) return;
      addMessage({ id: nextId(), from: 'bot', kind: 'brands' });
    } else if (option.id === 'about') {
      await botSay('Glad you asked — here\'s a little about us 👇');
      if (!mountedRef.current) return;
      addMessage({ id: nextId(), from: 'bot', kind: 'about' });
    }

    // Drop what they just saw; keep "Get my offer now" until it's the only thing left.
    seenMenuRef.current.add(option.id);
    const remaining = MENU_OPTIONS.filter(o => o.id === 'offer' || !seenMenuRef.current.has(o.id));
    const moreToSee = remaining.some(o => o.id !== 'offer');
    await botSay(moreToSee ? 'Want to see anything else, or ready for your offer?' : 'That\'s everything — ready for your offer? 👇', {
      perLineMs: 300,
    });
    if (!mountedRef.current) return;
    addMessage({ id: nextId(), from: 'bot', kind: 'menu', options: remaining });
  };

  // Top hero CTA: start the estimate if they're still browsing, otherwise refocus the live step.
  const focusOffer = () => {
    if (stage === 'menu') {
      handleMenuChoice({ id: 'offer', label: '⚡ Get my offer now' });
    } else {
      scrollThreadToBottom();
    }
  };

  const handleSeePricing = async () => {
    if (totalUnits <= 0) {
      setLeadStatus({ type: 'error', message: 'Add at least one window or door so I can price it.' });
      return;
    }
    setLeadStatus({ type: 'idle', message: '' });
    pushUser(`Looks right — ${summarizeCounts(totalWindows, totalDoors)} 👍`);
    setStage('pricing');
    await botSay(
      [
        `Great. For ${summarizeCounts(totalWindows, totalDoors)}, here's your all-in installed range across the three brands we carry:`,
      ],
      { perLineMs: 400 },
    );
    if (!mountedRef.current) return;
    addMessage({ id: nextId(), from: 'bot', kind: 'pricing' });

    // Let the pricing card scroll into view, then PARK the view on the numbers — everything
    // below (value prop, form) loads in beneath without yanking the user past the price.
    await wait(2000);
    if (!mountedRef.current) return;
    holdScrollRef.current = true;

    // Our unique value story (loads in below; user scrolls down when ready)
    setBotTyping(true);
    await wait(1100);
    if (!mountedRef.current) return;
    setBotTyping(false);
    addMessage({ id: nextId(), from: 'bot', kind: 'valueprop' });
    await wait(700);

    await botSay(
      `Want the full brand-by-brand breakdown texted over? Drop your name and cell — and since it's still ${CURRENT_MONTH}, lock it in now to claim your exclusive 10% off 👇`,
      { perLineMs: 550 },
    );
    if (!mountedRef.current) return;
    addMessage({ id: nextId(), from: 'bot', kind: 'leadform' });
    setStage('contact');
  };

  const buildTranscript = () =>
    messages
      .filter(m => m.kind === 'text' && m.text)
      .map(m => `${m.from === 'bot' ? 'Alexis' : 'Visitor'}: ${m.text}`)
      .join('\n');

  const handleLeadSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setLeadStatus({ type: 'error', message: 'I just need your name and a cell number to text the breakdown.' });
      return;
    }
    if (totalUnits <= 0) {
      setLeadStatus({ type: 'error', message: 'Set your window counts first so I can price it.' });
      return;
    }
    setLeadStatus({ type: 'loading', message: '' });
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'windows',
          name: name.trim(),
          address: address.trim(),
          addressLat: addressMeta?.lat ?? null,
          addressLng: addressMeta?.lng ?? null,
          placeId: addressMeta?.placeId ?? null,
          phone: phone.trim(),
          source: `/windows-landing chat (${variant})`,
          details: `Chat estimate — ${summarizeCounts(totalWindows, totalDoors)} (single/double-hung:${counts.single_hung_double_hung}, picture:${counts.picture}, sliding:${counts.sliding}, casement:${counts.casement}, bay/bow:${counts.bay_bow}, patio door:${counts.patio_door}); images analyzed: ${images.length}`,
          totalWindows,
          propertyImageUrl: propertyPhoto || images[0] || null,
          transcript: buildTranscript(),
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
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || 'Something went wrong sending that.');

      trackLeadConversion();
      trackMetaLead({ content_name: 'Windows landing chat lead', value: 0, currency: 'USD' });

      setLeadStatus({ type: 'success', message: '' });
      convertedRef.current = true; // they submitted — lead email covers it, skip the recap
      holdScrollRef.current = false; // resume auto-scroll so the confirmation shows
      pushUser(`${name.trim()} · ${phone.trim()}`);
      setStage('done');
      await botSay(
        [
          `You're all set${name.trim() ? `, ${name.trim().split(' ')[0]}` : ''}! 🎉`,
          `I'm texting your full brand-by-brand breakdown to ${phone.trim()} right now — watch for a message from our St. Louis number in the next minute.`,
          'Reply to that text anytime with questions, or if you want Michael to come take exact measurements. No pressure either way.',
        ],
        { perLineMs: 600 },
      );
      if (!mountedRef.current) return;
      addMessage({ id: nextId(), from: 'bot', kind: 'confirm' });
    } catch (error) {
      setLeadStatus({ type: 'error', message: error.message || 'Could not send that — please call us instead.' });
    }
  };

  // ---- Hybrid Q&A: free-form text → Claude ----
  const handleAsk = async question => {
    const q = question.trim();
    if (!q || asking) return;
    setInput('');
    pushUser(q);
    setAsking(true);
    setBotTyping(true);
    try {
      const history = messages
        .filter(m => m.kind === 'text' && m.text)
        .slice(-12)
        .map(m => ({ role: m.from === 'bot' ? 'assistant' : 'user', content: m.text }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content: q }],
          context: {
            variant,
            stage,
            address,
            counts,
            totalWindows,
            totalDoors,
            projectRange,
          },
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!mountedRef.current) return;
      setBotTyping(false);
      const reply =
        `${payload?.reply || ''}`.trim() ||
        "Good question — let me have the real Alexis text you that one so you get the exact answer. Want to drop your number?";
      pushBot(reply);
    } catch {
      if (!mountedRef.current) return;
      setBotTyping(false);
      pushBot("Sorry, I glitched for a sec. Mind asking that again? Or just call us at " + PHONE + '.');
    } finally {
      if (mountedRef.current) setAsking(false);
    }
  };

  // Starts with a street number + a word (e.g. "1234 Forsyth Blvd") and isn't a question.
  const looksLikeAddress = value => /^\s*\d{1,6}\s+\p{L}/u.test(value) && !value.trim().endsWith('?');

  const onComposerSubmit = e => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    holdScrollRef.current = false; // any composer action resumes normal scrolling
    if (stage === 'address' && !value.endsWith('?')) {
      handleAddressSubmit(value); // re-prompts to pick from the list
    } else if (stage === 'menu' && looksLikeAddress(value)) {
      startAddressEntry(value); // move into address entry with live suggestions
    } else {
      handleAsk(value);
    }
  };

  const composerActive = stage !== 'boot' && stage !== 'analyzing';
  const composerPlaceholder =
    stage === 'address'
      ? 'Type your home address…'
      : stage === 'menu'
        ? 'Type your address or ask a question…'
        : 'Ask Alexis anything…';

  return (
    <div className="windows-landing-chat fixed inset-0 flex flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Compact header */}
      <header className="z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <a href="/" className="flex items-center gap-2.5">
          <img src={LOGO_SRC} alt="Luitjens Exteriors" className="h-10 w-auto object-contain" />
        </a>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 sm:inline-flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            ALEXIS ONLINE
          </span>
          <a
            href={PHONE_HREF}
            onClick={trackPhoneConversion}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800"
          >
            <Phone className="size-3.5" />
            <span>Call</span>
          </a>
        </div>
      </header>

      {/* Thread */}
      <div ref={threadRef} className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        <div className="mx-auto flex max-w-md flex-col gap-2.5">
          {/* Hero photo — lives inside the chat and scrolls with the conversation */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <img
              src={HERO_IMAGE}
              alt="Premium windows by Luitjens Exteriors"
              className="h-44 w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white drop-shadow">
                Premium Windows &amp; Doors
              </p>
              <button
                type="button"
                onClick={focusOffer}
                className="mt-0.5 text-[16px] font-bold tracking-wide text-amber-300 drop-shadow transition hover:text-amber-200"
              >
                Discover Your View ↓
              </button>
            </div>
          </div>

          <div className="mx-auto mb-1 flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-400 shadow-sm ring-1 ring-slate-100">
            <ShieldCheck className="size-3.5 text-green-600" />
            Family-built estimate tool · we never cold-call
          </div>

          {messages.map(msg => (
            <MessageRow
              key={msg.id}
              msg={msg}
              counts={counts}
              updateCount={updateCount}
              setCountValue={setCountValue}
              totalWindows={totalWindows}
              totalDoors={totalDoors}
              priceRanges={priceRanges}
              projectRange={projectRange}
              onSeePricing={handleSeePricing}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              onLeadSubmit={handleLeadSubmit}
              leadStatus={leadStatus}
              onMenuChoice={handleMenuChoice}
            />
          ))}

          {botTyping ? <TypingBubble /> : null}
          {leadStatus.type === 'error' ? (
            <div className="ml-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {leadStatus.message}
            </div>
          ) : null}
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Address suggestions (new Places API) */}
        {stage === 'address' && suggestions.length > 0 ? (
          <ul className="mx-auto mb-2 max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            {suggestions.map(item => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => selectSuggestion(item)}
                  className="flex w-full items-start gap-2.5 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 active:bg-slate-100"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <span className="text-[14px] leading-snug text-slate-700">{item.text}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <form onSubmit={onComposerSubmit} className="mx-auto flex max-w-md items-center gap-2">
          <div className="relative flex-1">
            {stage === 'address' ? (
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            ) : null}
            <input
              ref={addressInputRef}
              type="text"
              value={input}
              onChange={e => handleAddressInputChange(e.target.value)}
              disabled={!composerActive}
              placeholder={composerActive ? composerPlaceholder : 'Alexis is typing…'}
              autoComplete="off"
              className={`w-full rounded-full border border-slate-300 bg-white py-3 ${
                stage === 'address' ? 'pl-11' : 'pl-4'
              } pr-4 text-[15px] text-slate-900 placeholder-slate-400 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50`}
            />
          </div>
          <button
            type="submit"
            disabled={!composerActive || !input.trim()}
            aria-label="Send"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 disabled:opacity-40"
          >
            <ArrowUp className="size-5" />
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-md text-center text-[10px] text-slate-400">
          Hundreds of installs · 10+ years in St. Louis · Michael on every job site ·{' '}
          <Link to="/privacy-policy" className="underline">Privacy</Link> ·{' '}
          <Link to="/terms-of-service" className="underline">Terms</Link>
        </p>
      </div>
    </div>
  );
}

// ---------- Sub-components ----------

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="size-2 rounded-full bg-slate-400"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  );
}

function Bubble({ from, children }) {
  const isBot = from === 'bot';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
          isBot
            ? 'rounded-tl-sm bg-slate-100 text-slate-800'
            : 'rounded-tr-sm bg-blue-600 text-white'
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}

function MessageRow(props) {
  const { msg } = props;

  if (msg.kind === 'text') {
    return <Bubble from={msg.from}>{msg.text}</Bubble>;
  }

  if (msg.kind === 'photo') {
    const srcs = msg.srcs || (msg.src ? [msg.src] : []);
    if (!srcs.length) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start"
      >
        <div className="max-w-[88%] overflow-hidden rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-100">
          {srcs.length === 1 ? (
            <img src={srcs[0]} alt="Your home" className="h-44 w-full object-cover" />
          ) : (
            <div className="flex gap-1 overflow-x-auto p-1">
              {srcs.map((s, i) => (
                <img
                  key={s}
                  src={s}
                  alt={`Your home ${i + 1}`}
                  className="h-32 w-44 shrink-0 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500">
            Found your place ✓{srcs.length > 1 ? ` · ${srcs.length} photos` : ''}
          </div>
        </div>
      </motion.div>
    );
  }

  if (msg.kind === 'menu') {
    return <MenuCard options={msg.options} onMenuChoice={props.onMenuChoice} />;
  }

  if (msg.kind === 'gallery') {
    return <GalleryCard />;
  }

  if (msg.kind === 'reviews') {
    return <ReviewsCard />;
  }

  if (msg.kind === 'brands') {
    return <BrandsCard />;
  }

  if (msg.kind === 'about') {
    return <AboutCard />;
  }

  if (msg.kind === 'counts') {
    return <CountsCard {...props} />;
  }

  if (msg.kind === 'pricing') {
    return <PricingCard {...props} />;
  }

  if (msg.kind === 'valueprop') {
    return <ValueCard />;
  }

  if (msg.kind === 'leadform') {
    return <LeadFormCard {...props} />;
  }

  if (msg.kind === 'confirm') {
    return <ConfirmCard {...props} />;
  }

  return null;
}

function MenuCard({ options = MENU_OPTIONS, onMenuChoice }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2"
    >
      {options.map(opt => {
        const primary = opt.id === 'offer';
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onMenuChoice(opt)}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-[15px] transition active:scale-[0.98] ${
              primary
                ? 'bg-slate-900 font-bold text-white'
                : 'border border-slate-300 bg-white font-semibold text-slate-700 hover:border-slate-400'
            }`}
          >
            <span>{opt.label}</span>
            <ChevronRight className="size-4 opacity-60" />
          </button>
        );
      })}
    </motion.div>
  );
}

function GalleryCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-2 shadow-sm"
    >
      <div className="flex gap-2 overflow-x-auto pb-1">
        {GALLERY_PHOTOS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`Luitjens Exteriors project ${i + 1}`}
            loading="lazy"
            className="h-40 w-56 shrink-0 rounded-xl object-cover"
          />
        ))}
      </div>
    </motion.div>
  );
}

function ReviewsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="overflow-hidden rounded-2xl rounded-tl-sm border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
          <span className="text-lg font-black leading-none text-slate-900">5.0</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, s) => (
              <Star key={s} className="size-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-3">
          {REVIEWS.map(r => (
            <div
              key={r.text}
              className="flex w-60 shrink-0 snap-center flex-col rounded-xl bg-slate-50 p-3"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: r.stars }).map((_, s) => (
                  <Star key={s} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-slate-700">“{r.text}”</p>
              <p className="mt-2 text-[12px] font-bold text-slate-500">— {r.name}</p>
            </div>
          ))}
        </div>
        <div className="pb-2 text-center text-[10px] text-slate-400">← swipe to read more →</div>
      </div>
    </motion.div>
  );
}

function AboutCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl rounded-tl-sm border border-slate-200 bg-white shadow-sm"
    >
      <img
        src="/images/owners-luitjens.jpg"
        alt="Alexis & Michael Luitjens"
        className="aspect-[4/3] w-full object-cover object-top"
      />
      <div className="p-3.5">
        <h3 className="text-[15px] font-extrabold text-slate-900">Alexis &amp; Michael Luitjens</h3>
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">Family-owned · St. Louis</p>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
          We're a small, family-run exterior company that's served the St. Louis area for 10+ years — hundreds of
          installs and counting. Michael is on every job site with his crew, and I (Alexis) answer every text myself.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
          No call center, no commissioned salespeople, no pressure. We text you a real, wholesale-based number and let
          it speak for itself — we'd rather earn your trust than push a sale.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
          Off the clock, we're chasing our four kids (all under 10) — fishing, camping, and serving at our church.
          We're blessed to run a company we're proud of, with customers we're grateful to call friends.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['Family-owned', '10+ years', 'Hundreds of installs', 'Licensed & insured'].map(chip => (
            <span key={chip} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function BrandsCard() {
  const [openName, setOpenName] = useState(null);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl rounded-tl-sm border border-slate-200 bg-white shadow-sm"
    >
      {BRANDS.map((b, i) => {
        const isOpen = openName === b.name;
        return (
          <div key={b.name} className={i > 0 ? 'border-t border-slate-100' : ''}>
            <button
              type="button"
              onClick={() => setOpenName(cur => (cur === b.name ? null : b.name))}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors active:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <img
                    src={b.logo}
                    alt={b.name}
                    className="h-6 w-auto max-w-[120px] object-contain object-left"
                  />
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {b.tag}
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-snug text-slate-600">{b.blurb}</p>
              </div>
              <ChevronDown
                className={`size-5 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3">
                    <div className="overflow-hidden rounded-xl">
                      <img src={b.window} alt={`${b.name} window`} className="h-44 w-full object-cover" />
                    </div>
                    <p className="mt-2.5 text-[13px] leading-relaxed text-slate-600">{b.sizzle}</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.div>
  );
}

function CountsCard({ counts, updateCount, setCountValue, totalWindows, totalDoors, onSeePricing }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="grid gap-2">
        {WINDOW_TYPES.map(({ id, label, hint, Icon }) => (
          <div key={id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
                <Icon size={22} color="#2563eb" />
              </div>
              <div>
                <div className="text-[13px] font-bold leading-tight text-slate-900">{label}</div>
                <div className="text-[11px] text-slate-400">{hint}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => updateCount(id, -1)}
                className="flex size-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 active:scale-95"
                aria-label={`Fewer ${label}`}
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                min="0"
                max="30"
                value={counts[id]}
                onChange={e => setCountValue(id, e.target.value)}
                className="w-9 bg-transparent text-center text-base font-black text-slate-900 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => updateCount(id, 1)}
                className="flex size-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 active:scale-95"
                aria-label={`More ${label}`}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onSeePricing}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-[15px] font-bold text-white transition active:scale-[0.98]"
      >
        See my pricing ({summarizeCounts(totalWindows, totalDoors)})
      </button>
    </motion.div>
  );
}

function ValueCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-tl-sm border-l-4 border-amber-400 bg-slate-100 px-4 py-3">
        <div className="text-[11px] font-black uppercase tracking-widest text-amber-600">Our Unique Value</div>
        <p className="mt-1.5 text-[14px] leading-relaxed text-slate-700">
          For years, we did the installs for most of the big-box retailers and manufacturers — and honestly, we got
          tired of them paying us like dirt while charging you insanely marked-up prices. We're confident our numbers
          reflect the <span className="font-bold text-slate-900">true market value</span>: enough to pay our crew a fair
          wage, and still let you upgrade your home, raise its value, save on energy, and most importantly — enjoy the
          fresh air and sunshine.
        </p>
      </div>
    </motion.div>
  );
}

function PricingCard({ priceRanges, projectRange }) {
  const [open, setOpen] = useState(null);
  const rows = [
    { key: 'wincore', label: 'Wincore', sub: 'Best value' },
    { key: 'simonton', label: 'Simonton', sub: 'Most popular' },
    { key: 'pella', label: 'Pella', sub: 'Premium' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl rounded-tl-sm border border-slate-200 bg-white shadow-sm"
    >
      <div className="bg-slate-900 px-4 py-4 text-center text-white">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Your installed project range
        </div>
        <div className="mt-1 text-2xl font-black tracking-tight">
          {money(projectRange[0])} – {money(projectRange[1])}
        </div>
        <div className="mt-0.5 text-[10px] font-medium text-slate-400">Tap a brand to see what we'd install</div>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map(({ key, label, sub }) => {
          const isOpen = open === key;
          const info = BRAND_LINES[key];
          return (
            <div key={key}>
              <button
                type="button"
                onClick={() => setOpen(cur => (cur === key ? null : key))}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors active:bg-slate-50"
              >
                <span className="flex items-center gap-1.5">
                  <ChevronDown
                    className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                  <span className="text-sm font-bold text-slate-900">{label}</span>
                  <span className="text-[11px] font-medium text-slate-400">{sub}</span>
                </span>
                <span className="shrink-0 text-sm font-bold text-slate-700">
                  {money(priceRanges[key][0])} – {money(priceRanges[key][1])}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-amber-600">We'd install the</div>
                        <div className="text-[13px] font-extrabold text-slate-900">{info.line}</div>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{info.sell}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center text-[10px] leading-relaxed text-slate-400">
        Good-faith estimate generated using AI and the details you provided. Your price is honored after a quick on-site
        confirmation, barring significant differences in measurements, scope, or site conditions.
      </div>
    </motion.div>
  );
}

function LeadFormCard({ name, setName, phone, setPhone, onLeadSubmit, leadStatus }) {
  const submit = e => {
    e.preventDefault();
    onLeadSubmit();
  };
  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="mb-3 overflow-hidden rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 p-3">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">🎉</span>
          <span className="text-[13px] font-black uppercase tracking-wide text-amber-900">
            {CURRENT_MONTH} Exclusive · Extra 10% Off
          </span>
        </div>
        <p className="mt-1 pl-7 text-[11.5px] font-semibold leading-snug text-amber-800">
          Submit now to reserve this price <span className="font-extrabold text-amber-900">to your name</span> and claim
          your {CURRENT_MONTH} 10% off — only while you're on this page.
        </p>
      </div>
      <div className="grid gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-[15px] font-medium focus:border-slate-900 focus:bg-white focus:outline-none"
        />
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Cell number"
          autoComplete="tel"
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-[15px] font-medium focus:border-slate-900 focus:bg-white focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={leadStatus.type === 'loading'}
        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-[15px] font-bold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
      >
        {leadStatus.type === 'loading' ? 'Sending…' : `🔒 Lock in my ${CURRENT_MONTH} 10% off`}
      </button>
      <p className="mt-2 text-center text-[10px] leading-relaxed text-slate-400">
        By tapping, you agree to receive texts from Luitjens Exteriors. Msg/data rates may apply. Reply STOP to opt out.
        We never cold-call or sell your info.
      </p>
    </motion.form>
  );
}

function ConfirmCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl rounded-tl-sm border border-green-200 bg-green-50 p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 text-green-800">
        <div className="flex size-7 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="size-4" />
        </div>
        <span className="text-sm font-bold">Request received — text on the way</span>
      </div>
      <a
        href={PHONE_HREF}
        onClick={trackPhoneConversion}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-green-300 bg-white py-3 text-sm font-bold text-green-800 transition hover:bg-green-100"
      >
        <Phone className="size-4" />
        Or call us now · {PHONE}
      </a>
    </motion.div>
  );
}

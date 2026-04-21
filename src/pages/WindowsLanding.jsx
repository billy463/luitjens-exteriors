import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Eye, MapPin, Minus, Phone, Plus } from 'lucide-react';
import { trackLeadConversion, trackPhoneConversion } from '../lib/googleAds';
import { trackMetaLead } from '../lib/metaPixel';
import './WindowsLanding.css';

const PHONE = '(314) 882-0973';
const PHONE_HREF = 'tel:+13148820973';
const MIN_ANALYZE_MS = 15000;

const fallbackNarrative =
  "We couldn't get a clear look at your home from public photos. No problem - just enter your window counts below and we'll take it from there.";

const initialCounts = {
  single_hung_double_hung: 0,
  picture: 0,
  sliding: 0,
  bay_bow: 0,
  patio_door: 0,
  other: 0,
};

const perWindowRange = {
  wincore: [600, 800],
  simonton: [800, 1100],
  pella: [1200, 1650],
  andersen: [1400, 1900],
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function formatRange([low, high]) {
  return `$${low.toLocaleString()} - $${high.toLocaleString()}`;
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
    bay_bow: normalize('bay_bow'),
    patio_door: normalize('patio_door'),
    other: normalize('other'),
  };
}

export default function WindowsLanding() {
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
  const addressInputRef = useRef(null);

  const totalWindows = useMemo(
    () => Object.values(counts).reduce((sum, count) => sum + count, 0),
    [counts],
  );

  const totalPricedUnits = useMemo(
    () => counts.single_hung_double_hung + counts.picture + counts.sliding + counts.bay_bow + counts.other,
    [counts],
  );

  const priceRanges = useMemo(
    () => ({
      wincore: [perWindowRange.wincore[0] * totalPricedUnits, perWindowRange.wincore[1] * totalPricedUnits],
      simonton: [perWindowRange.simonton[0] * totalPricedUnits, perWindowRange.simonton[1] * totalPricedUnits],
      pella: [perWindowRange.pella[0] * totalPricedUnits, perWindowRange.pella[1] * totalPricedUnits],
      andersen: [perWindowRange.andersen[0] * totalPricedUnits, perWindowRange.andersen[1] * totalPricedUnits],
    }),
    [totalPricedUnits],
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
    const mapsKey =
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
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
    if (totalWindows <= 0) {
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

    if (totalWindows <= 0) {
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
          brand: 'Not sure - help me decide',
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          source: '/windows-landing sms funnel',
          details: `Window count estimate: ${totalWindows} (single/double-hung:${counts.single_hung_double_hung}, picture:${counts.picture}, sliding:${counts.sliding}, bay/bow:${counts.bay_bow}, patio door:${counts.patio_door}, other:${counts.other}), images analyzed: ${images.length}`,
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
    <div className="windows-landing-v2">
      {step === 1 ? (
        <div className="screen">
          <header className="header">
            <a className="logo" href="/">
              <img
                src="https://images.squarespace-cdn.com/content/v1/67c894550ca45b50d4350eb4/e11fb7cd-e691-4181-a329-40aea8c93872/Luitjens%2BExteriors%2BLogo.jpg?format=1500w"
                alt="Luitjens Exteriors"
                className="logo-image"
              />
            </a>
            <a href={PHONE_HREF} onClick={trackPhoneConversion} className="phone-link"><Phone />Call</a>
          </header>

          <section className="hero">
            <span className="eyebrow">St. Louis Homeowners</span>
            <h1>Lower your energy bills <span className="accent">with the right windows.</span></h1>
            <p className="hero-lead">
              New energy-efficient windows can cut your home&apos;s indoor temperature swing by 2-5 degrees and save hundreds on utility bills. See what it costs for your house in about 3 minutes.
            </p>
            <div className="trust-row">
              <div className="trust-item"><div className="trust-dot" />10+ Years in St. Louis</div>
              <div className="trust-item"><div className="trust-dot" />Family-Owned</div>
              <div className="trust-item"><div className="trust-dot" />Licensed &amp; Insured</div>
              <div className="trust-item"><div className="trust-dot" />BBB A-Rated</div>
            </div>
          </section>

          <div className="owner-card">
            <div className="owner-avatar">
              <img src="/images/owners-couple.jpg" alt="Alexis and Michael Luitjens" className="owner-avatar-image" />
            </div>
            <div className="owner-info">
              <div className="owner-role">Who You&apos;re Working With</div>
              <div className="owner-names">Alexis &amp; Michael Luitjens</div>
              <div className="owner-quote">&quot;Michael is on every install. I answer every text. That&apos;s the whole company and that&apos;s on purpose.&quot;</div>
            </div>
          </div>

          <section className="primary-action-block">
            <div className="action-kicker"><span className="live-dot" /><span className="live-text">Live Pricing Tool</span></div>
            <h2 className="action-title">See Your Pricing in About 3 Minutes.</h2>
            <p className="action-subtitle">Type your address. We&apos;ll find your home, count your windows, and <strong>text you real price ranges</strong> - no $189 bait, no sales calls.</p>
            <form onSubmit={handleAddressStart}>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  ref={addressInputRef}
                  type="text"
                  className="form-input"
                  placeholder="1234 Forsyth Blvd, St. Louis, MO"
                  value={address}
                  autoComplete="street-address"
                  onChange={event => setAddress(event.target.value)}
                />
              </div>
              <button className="cta-btn" type="submit" disabled={status.type === 'loading'}>
                {status.type === 'loading' ? 'Finding Home...' : 'Find My Home'} <ArrowRight size={16} />
              </button>
              <p className="cta-fineprint">Free, no-obligation estimate. Takes about 3 minutes.</p>
              {status.type === 'error' ? <p className="status status-error">{status.message}</p> : null}
            </form>
          </section>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="screen">
          <section className="analyzing-screen">
            <div className="house-preview">
              <img src={previewImage} alt="Property preview" className="property-preview-image" />
            </div>
            <h2 className="analyzing-title">Analyzing your home...</h2>
            <p className="analyzing-sub">This takes about 3 minutes.</p>
            <div className="progress-list">
              {progressItems.map((item, idx) => (
                <div key={item.label} className={`progress-item ${item.done ? 'done' : ''} ${analysisPulse === idx ? 'active' : ''}`}>
                  <div className="progress-check" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="screen">
          <section className="breakdown-screen">
            <div className="breakdown-header-row">
              <div className="breakdown-kicker">Step 2 of 3</div>
              <h2 className="breakdown-title">Here&apos;s what we found. Look right?</h2>
              <p className="breakdown-sub">Tap +, -, or type directly to adjust any count so it matches your home.</p>
              <div className="address-chip"><MapPin size={14} />{address.trim() || '1234 Forsyth Blvd'}</div>
            </div>

            <div className="breakdown-preview-card">
              <img
                src={previewImage}
                alt="Detected property preview"
                className="breakdown-preview-image"
              />
            </div>

            <div className="narrative-card" role="status" aria-live="polite">
              <span className="sticker-badge sticker-warning">Not 100% accurate</span>
              <div className="narrative-label"><Eye size={14} />Here&apos;s what I found</div>
              <p className="narrative-text">{narrative || fallbackNarrative}</p>
            </div>

            <div className="window-list">
              <div className="window-list-header">
                <span className="sticker-badge sticker-confirm">Please confirm</span>
              </div>
              <div className="window-row">
                <div className="window-type">Single / Double Hung<span className="window-type-hint">Standard vertical slider windows</span></div>
                <div className="counter">
                  <button type="button" className="counter-btn" onClick={() => updateCount('single_hung_double_hung', -1)}><Minus size={14} /></button>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={counts.single_hung_double_hung}
                    onChange={event => setCountValue('single_hung_double_hung', event.target.value)}
                    className="counter-input"
                    aria-label="Single and double hung window count"
                  />
                  <button type="button" className="counter-btn" onClick={() => updateCount('single_hung_double_hung', 1)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="window-row">
                <div className="window-type">Picture<span className="window-type-hint">Large fixed windows</span></div>
                <div className="counter">
                  <button type="button" className="counter-btn" onClick={() => updateCount('picture', -1)}><Minus size={14} /></button>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={counts.picture}
                    onChange={event => setCountValue('picture', event.target.value)}
                    className="counter-input"
                    aria-label="Picture window count"
                  />
                  <button type="button" className="counter-btn" onClick={() => updateCount('picture', 1)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="window-row">
                <div className="window-type">Sliding<span className="window-type-hint">Horizontal sliding windows</span></div>
                <div className="counter">
                  <button type="button" className="counter-btn" onClick={() => updateCount('sliding', -1)}><Minus size={14} /></button>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={counts.sliding}
                    onChange={event => setCountValue('sliding', event.target.value)}
                    className="counter-input"
                    aria-label="Sliding window count"
                  />
                  <button type="button" className="counter-btn" onClick={() => updateCount('sliding', 1)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="window-row">
                <div className="window-type">Bay / Bow<span className="window-type-hint">Projected bay or bow windows</span></div>
                <div className="counter">
                  <button type="button" className="counter-btn" onClick={() => updateCount('bay_bow', -1)}><Minus size={14} /></button>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={counts.bay_bow}
                    onChange={event => setCountValue('bay_bow', event.target.value)}
                    className="counter-input"
                    aria-label="Bay and bow window count"
                  />
                  <button type="button" className="counter-btn" onClick={() => updateCount('bay_bow', 1)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="window-row">
                <div className="window-type">Sliding Patio Door / French Doors<span className="window-type-hint">Confirm patio and exterior door glass units</span></div>
                <div className="counter">
                  <button type="button" className="counter-btn" onClick={() => updateCount('patio_door', -1)}><Minus size={14} /></button>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={counts.patio_door}
                    onChange={event => setCountValue('patio_door', event.target.value)}
                    className="counter-input"
                    aria-label="Patio and French door count"
                  />
                  <button type="button" className="counter-btn" onClick={() => updateCount('patio_door', 1)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="window-row">
                <div className="window-type">Other<span className="window-type-hint">Anything that doesn&apos;t fit the categories above</span></div>
                <div className="counter">
                  <button type="button" className="counter-btn" onClick={() => updateCount('other', -1)}><Minus size={14} /></button>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={counts.other}
                    onChange={event => setCountValue('other', event.target.value)}
                    className="counter-input"
                    aria-label="Other window count"
                  />
                  <button type="button" className="counter-btn" onClick={() => updateCount('other', 1)}><Plus size={14} /></button>
                </div>
              </div>
            </div>

            <div className="total-bar">
              <span className="total-label">Total</span>
              <span className="total-count">{totalWindows} windows</span>
            </div>

            <p className="counter-helper">These are starting estimates - adjust any number to match your home. Alexis or Michael will verify everything during your free in-home consultation.</p>

            <button type="button" className="cta-btn cta-link" onClick={handleProceedFromCounts}>
              Looks Right - Continue <ArrowRight size={16} />
            </button>

            {status.type === 'error' ? <p className="status status-error">{status.message}</p> : null}
          </section>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="screen">
          <section className="phone-screen">
            <div className="breakdown-kicker">Step 3 of 3 - Last Step</div>
            <h2 className="phone-heading">Where should we <span className="accent">text your ranges?</span></h2>
            <p className="phone-intro">We built a custom price range for your home across 4 brands. Drop your number and we&apos;ll text it over in under a minute.</p>
            <div className="preview-card">
              <div className="preview-header">You&apos;ll receive a text with:</div>
              <div className="preview-item"><div className="preview-check" /><span>Your project range with all-in pricing</span></div>
              <div className="preview-item"><div className="preview-check" /><span>Pricing for each brand:</span></div>
              <div className="brand-row">
                <span className="brand-pill">Wincore</span>
                <span className="brand-pill">Simonton</span>
                <span className="brand-pill">Pella</span>
                <span className="brand-pill">Andersen</span>
              </div>
              <div className="preview-item"><div className="preview-check" /><span>What similar St. Louis homes actually paid</span></div>
            </div>
            <form onSubmit={handleLeadSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" placeholder="Sarah Johnson" value={name} onChange={event => setName(event.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input type="tel" className="form-input" placeholder="(314) 555-0199" value={phone} onChange={event => setPhone(event.target.value)} />
              </div>
              <button className="cta-btn" type="submit" disabled={status.type === 'loading'}>
                {status.type === 'loading' ? 'Sending...' : 'Text Me My Ranges'} <ArrowRight size={16} />
              </button>
              <p className="cta-fineprint">Free. No sales calls unless you ask.</p>
              {status.message ? (
                <p className={`status ${status.type === 'success' ? 'status-success' : 'status-error'}`}>{status.message}</p>
              ) : null}
            </form>
          </section>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="screen">
          <section className="confirmation-screen">
            <div className="confirm-badge"><Check size={40} /></div>
            <h2 className="confirm-title">Texting you now{ name ? `, ${name.split(' ')[0]}` : ''}.</h2>
            <p className="confirm-sub">Check your phone in a few seconds. Here&apos;s a preview of what lands in your messages:</p>
            <div className="sms-preview">
              <div className="sms-header">
                <div className="sms-avatar">A</div>
                <div className="sms-name">Alexis · Luitjens Exteriors</div>
                <div className="sms-number">{PHONE}</div>
              </div>
              <div className="sms-time">Today 10:43 AM</div>
              <div className="sms-bubble">Hey{ name ? ` ${name.split(' ')[0]}` : ''}! Here&apos;s your window pricing for <strong>{address.trim() || '1234 Forsyth Blvd'}</strong> ??</div>
              <div className="sms-bubble">
                <strong>{totalWindows} windows identified</strong>
                <span className="divider">----------</span>
                <div className="sms-price-line"><span className="sms-brand-label">Wincore</span><span className="sms-brand-price">{formatRange(priceRanges.wincore)}</span></div>
                <div className="sms-price-line"><span className="sms-brand-label">Simonton ?</span><span className="sms-brand-price">{formatRange(priceRanges.simonton)}</span></div>
                <div className="sms-price-line"><span className="sms-brand-label">Pella</span><span className="sms-brand-price">{formatRange(priceRanges.pella)}</span></div>
                <div className="sms-price-line"><span className="sms-brand-label">Andersen</span><span className="sms-brand-price">{formatRange(priceRanges.andersen)}</span></div>
              </div>
              <div className="sms-bubble">Want me to verify the count in person and lock in a final number? Reply YES and I&apos;ll text times. - Alexis</div>
            </div>
            <div className="confirm-below">Want to skip the text and talk now?</div>
            <a href={PHONE_HREF} onClick={trackPhoneConversion} className="cta-btn cta-link call-btn">Call {PHONE}</a>
          </section>
        </div>
      ) : null}

      <div className="landing-copyright">
        © 2026 Luitjens Exteriors. All rights reserved.{' '}
        <a href="#" className="landing-legal-link">Privacy Policy</a>
        {' '}·{' '}
        <a href="#" className="landing-legal-link">Terms of Service</a>
      </div>
    </div>
  );
}

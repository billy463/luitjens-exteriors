import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, MapPin, Minus, Phone, Plus } from 'lucide-react';
import { trackLeadConversion, trackPhoneConversion } from '../lib/googleAds';
import { trackMetaLead } from '../lib/metaPixel';
import './WindowsLanding.css';

const PHONE = '(314) 882-0973';
const PHONE_HREF = 'tel:+13148820973';

const initialCounts = {
  doubleHung: 8,
  casement: 2,
  picture: 1,
  specialty: 1,
};

const perWindowRange = {
  wincore: [600, 800],
  simonton: [800, 1100],
  pella: [1200, 1650],
  andersen: [1400, 1900],
};

const emptyProgress = {
  foundProperty: false,
  pulledImages: false,
  countedWindows: false,
  matchedPricing: false,
  builtRanges: false,
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function formatRange([low, high]) {
  return `$${low.toLocaleString()} - $${high.toLocaleString()}`;
}

function mapModelCountsToUi(counts = {}) {
  const get = key => Number(counts?.[key] || 0);
  return {
    doubleHung: get('double-hung'),
    casement: get('casement') + get('awning'),
    picture: get('picture') + get('sliding'),
    specialty: get('bay-bow') + get('garden') + get('egress'),
  };
}

export default function WindowsLanding() {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [counts, setCounts] = useState(initialCounts);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [progress, setProgress] = useState(emptyProgress);
  const [previewImage, setPreviewImage] = useState('/images/windows-landing-hero-house.jpg');
  const [images, setImages] = useState([]);
  const [analysisConfidence, setAnalysisConfidence] = useState('low');
  const [analysisNotes, setAnalysisNotes] = useState([]);
  const [manualMode, setManualMode] = useState(false);
  const addressInputRef = useRef(null);

  const totalWindows = useMemo(
    () => Object.values(counts).reduce((sum, count) => sum + count, 0),
    [counts],
  );

  const priceRanges = useMemo(
    () => ({
      wincore: [perWindowRange.wincore[0] * totalWindows, perWindowRange.wincore[1] * totalWindows],
      simonton: [perWindowRange.simonton[0] * totalWindows, perWindowRange.simonton[1] * totalWindows],
      pella: [perWindowRange.pella[0] * totalWindows, perWindowRange.pella[1] * totalWindows],
      andersen: [perWindowRange.andersen[0] * totalWindows, perWindowRange.andersen[1] * totalWindows],
    }),
    [totalWindows],
  );

  useEffect(() => {
    const title = 'Luitjens Exteriors - See Your Window Pricing in 30 Seconds';
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

  const updateCount = (key, delta) => {
    setCounts(current => ({
      ...current,
      [key]: Math.max(0, current[key] + delta),
    }));
  };

  const handleAddressStart = async event => {
    event.preventDefault();
    if (!address.trim()) {
      setStatus({ type: 'error', message: 'Please enter your street address to continue.' });
      return;
    }

    setStatus({ type: 'loading', message: '' });
    setProgress(emptyProgress);
    setManualMode(false);
    setAnalysisConfidence('low');
    setAnalysisNotes([]);
    setStep(2);

    const startedAt = Date.now();

    try {
      setProgress(current => ({ ...current, foundProperty: true }));

      const imageResponse = await fetch(`/api/property-images?address=${encodeURIComponent(address.trim())}`);
      const imagePayload = await imageResponse.json().catch(() => ({}));
      if (!imageResponse.ok) {
        throw new Error(imagePayload?.error || 'Could not load property photos for that address.');
      }

      const availableImages = Array.isArray(imagePayload.images) ? imagePayload.images.filter(Boolean) : [];
      setImages(availableImages);
      if (availableImages[0]) {
        setPreviewImage(availableImages[0]);
      }
      setProgress(current => ({ ...current, pulledImages: true }));

      const countResponse = await fetch('/api/window-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: availableImages }),
      });
      const countPayload = await countResponse.json().catch(() => ({}));
      if (!countResponse.ok) {
        throw new Error(countPayload?.error || 'Could not estimate window counts.');
      }

      setProgress(current => ({ ...current, countedWindows: true, matchedPricing: true, builtRanges: true }));
      const mappedCounts = mapModelCountsToUi(countPayload.counts);
      const mappedTotal = Object.values(mappedCounts).reduce((sum, val) => sum + val, 0);
      const confidence = `${countPayload?.confidence || 'low'}`.toLowerCase();
      setAnalysisConfidence(confidence);
      setAnalysisNotes(Array.isArray(countPayload?.notes) ? countPayload.notes.slice(0, 3) : []);
      if (mappedTotal > 0) {
        setCounts(mappedCounts);
      }
      if (!mappedTotal || confidence === 'low') {
        setManualMode(true);
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed < 15000) {
        await wait(15000 - elapsed);
      }

      setStep(3);
      setStatus({ type: 'idle', message: '' });
    } catch (error) {
      setManualMode(true);
      setAnalysisConfidence('low');
      setAnalysisNotes(['We could not confidently detect all window types from the listing photos.']);
      setProgress(current => ({ ...current, countedWindows: true, matchedPricing: true, builtRanges: true }));
      setStatus({ type: 'idle', message: '' });
      const elapsed = Date.now() - startedAt;
      if (elapsed < 15000) {
        await wait(15000 - elapsed);
      }
      setStep(3);
    }
  };

  const handleLeadSubmit = async event => {
    event.preventDefault();

    if (!address.trim() || !name.trim() || !phone.trim()) {
      setStatus({ type: 'error', message: 'Please complete address, full name, and mobile number.' });
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
          details: `Window count estimate: ${totalWindows} (DH:${counts.doubleHung}, Casement:${counts.casement}, Picture:${counts.picture}, Specialty:${counts.specialty}), images analyzed: ${images.length}`,
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
              <div className={`progress-item ${progress.foundProperty ? 'done' : 'active'}`}><div className="progress-check" />Found your property</div>
              <div className={`progress-item ${progress.pulledImages ? 'done' : ''}`}><div className="progress-check" />Pulled listing photos</div>
              <div className={`progress-item ${progress.countedWindows ? 'done' : ''}`}><div className="progress-check" />Counting windows by type...</div>
              <div className={`progress-item ${progress.matchedPricing ? 'done' : ''}`}><div className="progress-check" />Matching St. Louis price data</div>
              <div className={`progress-item ${progress.builtRanges ? 'done' : ''}`}><div className="progress-check" />Building your ranges</div>
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
              <p className="breakdown-sub">Tap + or - to correct anything we missed. Back-side windows are the most common miss.</p>
              <div className="address-chip"><MapPin size={14} />{address.trim() || '1234 Forsyth Blvd'}</div>
              <div className={`confidence-chip confidence-${analysisConfidence}`}>
                Confidence: {analysisConfidence.toUpperCase()}
              </div>
              {manualMode ? (
                <p className="manual-mode-note">
                  We need your help to finish this accurately. Please adjust the window counts below before continuing.
                </p>
              ) : null}
              {analysisNotes.length ? (
                <ul className="analysis-notes">
                  {analysisNotes.map(note => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="window-list">
              <div className="window-row">
                <div className="window-type">Double-hung<span className="window-type-hint">Slides up &amp; down</span></div>
                <div className="counter">
                  <button type="button" className="counter-btn" onClick={() => updateCount('doubleHung', -1)}><Minus size={14} /></button>
                  <span className="counter-val">{counts.doubleHung}</span>
                  <button type="button" className="counter-btn" onClick={() => updateCount('doubleHung', 1)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="window-row">
                <div className="window-type">Casement<span className="window-type-hint">Cranks outward</span></div>
                <div className="counter">
                  <button type="button" className="counter-btn" onClick={() => updateCount('casement', -1)}><Minus size={14} /></button>
                  <span className="counter-val">{counts.casement}</span>
                  <button type="button" className="counter-btn" onClick={() => updateCount('casement', 1)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="window-row">
                <div className="window-type">Picture / fixed<span className="window-type-hint">Large, does not open</span></div>
                <div className="counter">
                  <button type="button" className="counter-btn" onClick={() => updateCount('picture', -1)}><Minus size={14} /></button>
                  <span className="counter-val">{counts.picture}</span>
                  <button type="button" className="counter-btn" onClick={() => updateCount('picture', 1)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="window-row">
                <div className="window-type">Specialty<span className="window-type-hint">Arched, bay, custom</span></div>
                <div className="counter">
                  <button type="button" className="counter-btn" onClick={() => updateCount('specialty', -1)}><Minus size={14} /></button>
                  <span className="counter-val">{counts.specialty}</span>
                  <button type="button" className="counter-btn" onClick={() => updateCount('specialty', 1)}><Plus size={14} /></button>
                </div>
              </div>
            </div>
            <div className="total-bar">
              <span className="total-label">Total Windows</span>
              <span className="total-count">{totalWindows}</span>
            </div>
            <button type="button" className="cta-btn cta-link" onClick={() => setStep(4)}>
              Looks Right - Continue <ArrowRight size={16} />
            </button>
            <p className="cta-fineprint">Still no phone number needed. One more step.</p>
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
              <div className="sms-bubble">Hey{ name ? ` ${name.split(' ')[0]}` : ''}! Here&apos;s your window pricing for <strong>{address.trim() || '1234 Forsyth Blvd'}</strong> 👇</div>
              <div className="sms-bubble">
                <strong>{totalWindows} windows identified</strong>
                <span className="divider">──────────</span>
                <div className="sms-price-line"><span className="sms-brand-label">Wincore</span><span className="sms-brand-price">{formatRange(priceRanges.wincore)}</span></div>
                <div className="sms-price-line"><span className="sms-brand-label">Simonton ⭐</span><span className="sms-brand-price">{formatRange(priceRanges.simonton)}</span></div>
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

    </div>
  );
}

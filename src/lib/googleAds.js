const env = import.meta.env;

export const GOOGLE_ADS_ID = env.NEXT_PUBLIC_GOOGLE_ADS_ID || env.VITE_GOOGLE_ADS_ID || '';
const LEAD_LABEL = env.NEXT_PUBLIC_GADS_LEAD_LABEL || env.VITE_GADS_LEAD_LABEL || '';
const PHONE_LABEL = env.NEXT_PUBLIC_GADS_PHONE_LABEL || env.VITE_GADS_PHONE_LABEL || '';

function ensureDataLayer() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
}

export function initGoogleAdsTag() {
  if (typeof window === 'undefined' || !GOOGLE_ADS_ID) return;

  if (window.__luitjensGoogleAdsInitialized) return;

  ensureDataLayer();
  window.gtag('js', new Date());
  window.gtag('config', GOOGLE_ADS_ID);

  if (!document.getElementById('google-ads-gtag-script')) {
    const script = document.createElement('script');
    script.id = 'google-ads-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
    document.head.appendChild(script);
  }

  window.__luitjensGoogleAdsInitialized = true;
}

function fireConversion(label, extra = {}) {
  if (typeof window === 'undefined' || !GOOGLE_ADS_ID || !label || typeof window.gtag !== 'function') {
    return false;
  }

  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
    ...extra,
  });

  return true;
}

export function trackLeadConversion() {
  return fireConversion(LEAD_LABEL, {
    value: 1.0,
    currency: 'USD',
  });
}

export function trackPhoneConversion() {
  return fireConversion(PHONE_LABEL);
}

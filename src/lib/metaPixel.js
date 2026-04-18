const env = import.meta.env;

export const META_PIXEL_ID =
  env.NEXT_PUBLIC_META_PIXEL_ID || env.VITE_META_PIXEL_ID || '3430663590429933';

export function initMetaPixel() {
  if (typeof window === 'undefined' || !META_PIXEL_ID) return;
  if (window.fbq) return;

  // Meta's base bootstrap snippet.
  (function initFbq(f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function fbqProxy() {
      if (n.callMethod) n.callMethod.apply(n, arguments);
      else n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

export function trackMetaPageView() {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', 'PageView');
}

export function trackMetaLead() {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', 'Lead');
}

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Roofing from './pages/Roofing';
import Siding from './pages/Siding';
import Windows from './pages/Windows';
import Doors from './pages/Doors';
import Gutters from './pages/Gutters';
import WhyUs from './pages/WhyUs';
import StormDamage from './pages/StormDamage';
import WindowsLanding from './pages/WindowsLanding';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ScrollToTop from './components/ScrollToTop';
import { Phone } from 'lucide-react';
import GoogleAdsTag from './components/GoogleAdsTag';
import MetaPixelTracker from './components/MetaPixelTracker';
import { trackPhoneConversion } from './lib/googleAds';

const GHL_WIDGET_ID = '69e6e3741024ff61765950bf';
const GHL_SCRIPT_ID = 'ghl-chat-widget-loader';
const GHL_LOADER_SRC = 'https://widgets.leadconnectorhq.com/loader.js';
const GHL_RESOURCES_URL = 'https://widgets.leadconnectorhq.com/chat-widget/loader.js';

const CHAT_WIDGET_BLOCKED_PATHS = [
  '/windows-landing',
  '/window-landing',
  '/may-discount',
  '/speed-pricing',
];

const GHL_CLEANUP_SELECTOR = [
  `script#${GHL_SCRIPT_ID}`,
  `script[src="${GHL_LOADER_SRC}"]`,
  'chat-widget',
  'iframe[src*="leadconnectorhq.com"]',
  '[id^="lc-"]',
  '[class*="lead-connector"]',
  '[class*="leadconnector"]',
].join(',');

function removeGoHighLevelWidget() {
  document.querySelectorAll(GHL_CLEANUP_SELECTOR).forEach(node => node.remove());
}

function getLandingVariant(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/may-discount') return 'mayDiscount';
  if (normalizedPath === '/speed-pricing') return 'speedPricing';
  if (normalizedPath === '/windows-landing' || normalizedPath === '/window-landing') return 'default';
  return null;
}

function AppShell() {
  const location = useLocation();
  const landingVariant = getLandingVariant(location.pathname);

  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    const isBlocked = CHAT_WIDGET_BLOCKED_PATHS.some(blocked => path === blocked || path.startsWith(`${blocked}/`));

    if (isBlocked) {
      removeGoHighLevelWidget();
      return;
    }

    if (document.getElementById(GHL_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = GHL_SCRIPT_ID;
    script.src = GHL_LOADER_SRC;
    script.dataset.resourcesUrl = GHL_RESOURCES_URL;
    script.dataset.widgetId = GHL_WIDGET_ID;
    script.async = true;
    document.body.appendChild(script);
  }, [location.pathname]);

  if (landingVariant) {
    return (
      <div className="flex flex-col min-h-screen bg-dark text-white font-sans">
        <main className="flex-grow">
          <WindowsLanding variant={landingVariant} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark text-white font-sans">
      <Header />

      <main className="flex-grow pt-[84px] md:pt-[96px]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/storm-damage" element={<StormDamage />} />
          <Route path="/roofing" element={<Roofing />} />
          <Route path="/siding" element={<Siding />} />
          <Route path="/windows" element={<Windows />} />
          <Route path="/windows-landing/*" element={<WindowsLanding />} />
          <Route path="/window-landing/*" element={<WindowsLanding />} />
          <Route path="/doors" element={<Doors />} />
          <Route path="/gutters" element={<Gutters />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </main>

      <Footer />

      <a
        href="tel:+13148820973"
        onClick={trackPhoneConversion}
        className="md:hidden fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-2xl z-50 flex items-center justify-center hover:bg-primary-dark transition-colors"
        aria-label="Call Now"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
}

function App() {
  return (
    <Router>
      <GoogleAdsTag />
      <MetaPixelTracker />
      <ScrollToTop />
      <AppShell />
    </Router>
  );
}

export default App;

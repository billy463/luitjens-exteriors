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
import ScrollToTop from './components/ScrollToTop';
import { Phone } from 'lucide-react';
import GoogleAdsTag from './components/GoogleAdsTag';
import MetaPixelTracker from './components/MetaPixelTracker';
import { trackPhoneConversion } from './lib/googleAds';

function AppShell() {
  const location = useLocation();
  const isStandaloneLanding = location.pathname === '/windows-landing';

  return (
    <div className="flex flex-col min-h-screen bg-dark text-white font-sans">
      {!isStandaloneLanding && <Header />}

      <main className={isStandaloneLanding ? 'flex-grow' : 'flex-grow pt-[84px] md:pt-[96px]'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/storm-damage" element={<StormDamage />} />
          <Route path="/roofing" element={<Roofing />} />
          <Route path="/siding" element={<Siding />} />
          <Route path="/windows" element={<Windows />} />
          <Route path="/windows-landing" element={<WindowsLanding />} />
          <Route path="/doors" element={<Doors />} />
          <Route path="/gutters" element={<Gutters />} />
          <Route path="/why-us" element={<WhyUs />} />
        </Routes>
      </main>

      {!isStandaloneLanding && <Footer />}

      {!isStandaloneLanding && (
        <a
          href="tel:+13148820973"
          onClick={trackPhoneConversion}
          className="md:hidden fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-2xl z-50 flex items-center justify-center hover:bg-primary-dark transition-colors"
          aria-label="Call Now"
        >
          <Phone className="w-6 h-6" />
        </a>
      )}
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

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ScrollToTop from './components/ScrollToTop';
import { Phone } from 'lucide-react';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-dark text-white font-sans">
        <Header />
        
        <main className="flex-grow pt-[84px] md:pt-[96px]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/storm-damage" element={<StormDamage />} />
            <Route path="/roofing" element={<Roofing />} />
            <Route path="/siding" element={<Siding />} />
            <Route path="/windows" element={<Windows />} />
            <Route path="/doors" element={<Doors />} />
            <Route path="/gutters" element={<Gutters />} />
            <Route path="/why-us" element={<WhyUs />} />
          </Routes>
        </main>

        <Footer />
        
        {/* Floating Mobile CTA */}
        <a 
          href="tel:+13145550123" 
          className="md:hidden fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-2xl z-50 flex items-center justify-center hover:bg-primary-dark transition-colors"
          aria-label="Call Now"
        >
          <Phone className="w-6 h-6" />
        </a>
      </div>
    </Router>
  );
}

export default App;

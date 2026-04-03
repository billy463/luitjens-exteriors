import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToContact = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (!isHome) navigate('/#contact');
    else document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'Storm Damage', path: '/storm-damage' },
    { name: 'Roofing', path: '/roofing' },
    { name: 'Siding', path: '/siding' },
    { name: 'Windows', path: '/windows' },
    { name: 'Doors', path: '/doors' },
    { name: 'Gutters', path: '/gutters' },
    { name: 'Why Us', path: '/why-us' },
  ];

  return (
    <header className="fixed top-0 w-full z-40 transition-all duration-300 bg-darker shadow-lg py-3 border-b border-primary/20">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        
        {/* Logo (Left) */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="https://images.squarespace-cdn.com/content/v1/67c894550ca45b50d4350eb4/e11fb7cd-e691-4181-a329-40aea8c93872/Luitjens%2BExteriors%2BLogo.jpg?format=1500w" 
            alt="Luitjens Exteriors" 
            className="h-10 md:h-14 w-auto object-contain rounded-sm"
          />
          <div className="flex flex-col items-start leading-none">
            <span className="text-xl md:text-2xl font-extrabold tracking-tight text-primary uppercase">LUITJENS</span>
            <span className="text-[10px] md:text-xs tracking-[0.2em] font-bold text-primary uppercase mt-1">Exteriors</span>
          </div>
        </Link>
        
        {/* Desktop Nav (Right) */}
        <div className="hidden lg:flex items-center space-x-8 ml-auto">
          <nav className="flex space-x-6">
            {navLinks.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className="text-sm font-bold hover:text-primary transition-colors text-gray-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <button 
            onClick={handleScrollToContact}
            className="flex items-center space-x-2 bg-primary text-white px-5 py-2.5 rounded hover:bg-primary-dark transition-all font-bold shadow-lg shadow-primary/30"
          >
            <span>Get a Quote</span>
          </button>
        </div>

        {/* Mobile Toggle (Right) */}
        <button 
          className="lg:hidden p-2 rounded-md focus:outline-none ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>

      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-darker shadow-xl flex flex-col py-4 px-6 space-y-4 rounded-b-xl pb-6 z-50 border-t border-gray-800">
          {navLinks.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className="text-gray-200 font-bold text-lg hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <button 
            onClick={handleScrollToContact}
            className="mt-4 w-full flex items-center justify-center space-x-2 bg-primary text-white px-5 py-3 rounded font-bold"
          >
            <Phone className="w-4 h-4" />
            <span>Call Now</span>
          </button>
        </div>
      )}
    </header>
  );
}

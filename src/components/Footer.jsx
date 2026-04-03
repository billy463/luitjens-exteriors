import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-darker text-slate-300 py-12 border-t text-sm border-dark">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex flex-col mb-4">
              <span className="text-2xl font-extrabold tracking-tight text-white">LUITJENS</span>
              <span className="text-sm tracking-widest uppercase font-semibold text-primary">Exteriors</span>
            </Link>
            <p className="text-slate-400 max-w-sm mb-4 leading-relaxed">
              We aren't a big company, we have that small business family touch. We want to earn your trust.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Services</h3>
            <ul className="space-y-3">
              <li><Link to="/roofing" className="hover:text-primary transition font-medium">Roofing</Link></li>
              <li><Link to="/siding" className="hover:text-primary transition font-medium">Siding</Link></li>
              <li><Link to="/windows" className="hover:text-primary transition font-medium">Windows</Link></li>
              <li><Link to="/doors" className="hover:text-primary transition font-medium">Doors</Link></li>
              <li><Link to="/gutters" className="hover:text-primary transition font-medium">Gutters</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/why-us" className="hover:text-primary transition font-medium">Why Us</Link></li>
              <li><Link to="/#contact" className="hover:text-primary transition font-medium">Get a Quote</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contact</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>St. Louis, MO</li>
              <li>Jefferson County</li>
              <li>Phone: (314) 555-0123</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 text-xs text-center text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Luitjens Exteriors. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

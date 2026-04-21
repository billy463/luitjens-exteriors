import { MapPin, Phone } from 'lucide-react';
import { trackPhoneConversion } from '../lib/googleAds';

export default function ContactForm() {
  return (
    <section id="contact" data-phone-collecting-form="true" className="py-24 bg-dark border-t border-gray-800">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="bg-darker rounded-3xl shadow-2xl overflow-hidden shadow-dark/50 border border-gray-800">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left Info Column */}
            <div className="lg:w-5/12 bg-darker p-10 md:p-14 text-white flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-800">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Ready for Your <br/><span className="text-primary">Free Inspection?</span></h2>
              <p className="text-gray-300 text-lg mb-10 leading-relaxed">
                We offer free, no-obligation property inspections at your convenience. Fill out the form, and we'll reach out to schedule a time that fits perfectly in your schedule. Inspections typically take 30 minutes to 1 hour.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start">
                <div className="bg-primary/20 p-3 rounded-full mr-5 text-primary border border-primary/20">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Serving The Area</h4>
                    <p className="text-gray-400">St. Louis City and County, Jefferson County, St. Charles County, and Metro East.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/20 p-3 rounded-full mr-5 text-primary border border-primary/20">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Call Us Directly</h4>
                    <a
                      href="tel:+13148820973"
                      onClick={trackPhoneConversion}
                      className="text-gray-400 text-lg hover:text-white transition"
                    >
                      (314) 882-0973
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Form Column */}
            <div className="lg:w-7/12 p-8 md:p-14 bg-dark">
              <h3 className="text-2xl font-bold text-white mb-8">Get A Quote</h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-bold text-gray-300 mb-2">First Name *</label>
                    <input type="text" id="firstName" className="w-full px-4 py-3 rounded-lg border border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm bg-darker text-white" placeholder="John" required />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-bold text-gray-300 mb-2">Last Name *</label>
                    <input type="text" id="lastName" className="w-full px-4 py-3 rounded-lg border border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm bg-darker text-white" placeholder="Doe" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2">Email Address *</label>
                    <input type="email" id="email" className="w-full px-4 py-3 rounded-lg border border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm bg-darker text-white" placeholder="john@example.com" required />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-gray-300 mb-2">Phone Number *</label>
                    <input type="tel" id="phone" className="w-full px-4 py-3 rounded-lg border border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm bg-darker text-white" placeholder="(314) 000-0000" required />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="service" className="block text-sm font-bold text-gray-300 mb-2">Service Needed</label>
                  <select id="service" className="w-full px-4 py-3 rounded-lg border border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm bg-darker text-white">
                    <option>Select a service...</option>
                    <option>Roofing</option>
                    <option>Siding</option>
                    <option>Windows</option>
                    <option>Doors</option>
                    <option>Gutters</option>
                    <option>Storm Damage Inspection</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-300 mb-2">How can we help?</label>
                  <textarea id="message" rows="4" className="w-full px-4 py-3 rounded-lg border border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm bg-darker text-white resize-none" placeholder="Briefly describe your project or issue..."></textarea>
                </div>
                
                <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-lg text-lg transition-transform hover:scale-[1.02] shadow-lg shadow-primary/30">
                  Request Free Inspection
                </button>
              </form>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

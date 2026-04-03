import { ArrowRight, ShieldCheck, Wrench, Umbrella } from 'lucide-react';
import { motion } from 'framer-motion';
import Services from '../components/Services';
import ContactForm from '../components/ContactForm';

export default function Home() {
  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative w-full min-h-[85vh] flex items-center bg-dark py-24 overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-darker to-dark/50 opacity-80 z-10" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 hidden md:block">
              Your Complete <span className="text-primary">Exterior Renovation</span> Solution
            </h1>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4 md:hidden">
              Exterior <br/><span className="text-primary">Renovation</span> Solution
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 font-medium max-w-2xl leading-relaxed">
              Providing our neighbors with exceptional quality, from the first nail to the final detail. Honest work. Exceptional service. No surprises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded font-bold text-lg text-center flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 w-full sm:w-auto">
                Get a Free Inspection <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#services" className="bg-darker/10 backdrop-blur-sm border border-white/20 hover:bg-darker/20 text-white px-8 py-4 rounded font-bold text-lg text-center transition-colors w-full sm:w-auto">
                Our Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST BANNER */}
      <section className="py-12 bg-darker relative -mt-8 mx-4 lg:mx-auto max-w-5xl rounded-xl shadow-2xl z-30 border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 text-primary mb-3" />
            <h3 className="font-bold text-white text-lg mb-1">Owner On-Site</h3>
            <p className="text-gray-400 text-sm">Every project meets our high standards.</p>
          </div>
          <div className="flex flex-col items-center md:border-l md:border-r border-gray-800 px-4">
            <Umbrella className="w-12 h-12 text-primary mb-3" />
            <h3 className="font-bold text-white text-lg mb-1">Storm Experts</h3>
            <p className="text-gray-400 text-sm">From insurance claim to complete repair.</p>
          </div>
          <div className="flex flex-col items-center">
            <Wrench className="w-12 h-12 text-primary mb-3" />
            <h3 className="font-bold text-white text-lg mb-1">Honest Work</h3>
            <p className="text-gray-400 text-sm">No pushy sales, no surprise costs.</p>
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section id="about" className="py-24 bg-darker">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Proudly Serving <span className="text-primary">St. Louis</span> & Beyond</h2>
          <p className="text-xl text-gray-400 leading-relaxed mb-4">
            From our home base about 30 miles south of St. Louis City, we proudly deliver exceptional quality exterior renovations and outstanding customer service to St. Louis City and County, Jefferson County, St. Charles County, and the Metro East.
          </p>
          <p className="text-lg text-gray-200 font-bold font-serif mb-10 italic">"We aren't a big company, we still have that small business family touch. We want to earn your trust."</p>
          <img src="/images/st+louis+arch+skyline.jpg" alt="St. Louis Skyline or Aerial" className="w-full h-80 object-cover rounded-2xl shadow-lg border border-gray-800" onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070"}} />
        </div>
      </section>

      <Services />

      <ContactForm />

    </div>
  );
}

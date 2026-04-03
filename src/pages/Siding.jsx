import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle, Flame, Droplets, Wind } from 'lucide-react';

export default function Siding() {
  return (
    <div className="w-full bg-dark text-gray-200">
      
      {/* 1. Empathy Hook Hero */}
      <section className="bg-darker text-white py-24 px-6 relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-[url('/images/Siding-installation.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Drafty Rooms & <br className="md:hidden"/><span className="text-primary">Fading Exteriors?</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Failing siding causes skyrocketing energy bills and exposes your home's framework to rot. Upgrading your siding solves both problems instantly while fundamentally transforming your curb appeal.
          </p>
          <div className="pt-4">
           <a href="/#contact" className="inline-flex items-center gap-2 bg-primary/10 border border-primary text-primary font-bold px-8 py-3 rounded-md shadow-lg hover:bg-primary hover:text-white transition-all">
             Evaluate My Home <ArrowRight className="w-5 h-5"/>
           </a>
          </div>
        </div>
      </section>

      {/* 2. Educational Breakdown */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Honest Education</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6">More Than Just Aesthetics: <br className="md:hidden" />The Thermal Envelope</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              When most homeowners think about siding, they look at paint colors. While curb appeal is incredibly important, siding fundamentally acts as the armor of your home. It protects against moisture intrusion, resists pests, and forms your home's "thermal envelope." 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-darker p-8 rounded-2xl border border-gray-800 text-center">
              <div className="bg-dark w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 border border-gray-700">
                <Wind className="w-8 h-8 text-primary"/>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Eliminating Drafts</h4>
              <p className="text-gray-400 leading-relaxed">Insulated siding prevents winter winds from bypassing your framework, instantly upgrading your home's energy retention and lowering utility bills.</p>
            </div>

            <div className="bg-darker p-8 rounded-2xl border border-gray-800 text-center">
              <div className="bg-dark w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 border border-gray-700">
                <Droplets className="w-8 h-8 text-primary"/>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Moisture Defense</h4>
              <p className="text-gray-400 leading-relaxed">Cracked or warped siding allows rain to silently penetrate your wall cavities, feeding mold and severe structural rot long before you notice it inside.</p>
            </div>

            <div className="bg-darker p-8 rounded-2xl border border-border-gray-800 text-center">
              <div className="bg-dark w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 border border-gray-700">
                <Flame className="w-8 h-8 text-primary"/>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Property Protection</h4>
              <p className="text-gray-400 leading-relaxed">Outdated materials can be fire hazards. Modern Fiber Cement options are non-combustible and heavily resistant to midwest storm damage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Transparent Process & Materials */}
      <section className="py-24 bg-darker border-y border-gray-800">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <div className="lg:w-1/2 w-full space-y-8">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-4">Our Material Standards</h2>
                <p className="text-lg text-gray-400 leading-relaxed">
                  We refuse to install cheap, builder-grade vinyl that will warp in the summer heat or shatter during a hail storm. We partner exclusively with premium manufacturers.
                </p>
              </div>

              <div className="bg-dark p-6 rounded-xl border border-gray-800 hover:border-primary/50 transition">
                <h3 className="text-2xl font-bold text-white mb-2">James Hardie Fiber Cement</h3>
                <p className="text-gray-400 mb-4">The undisputed leader in premium siding. Hardie board is engineered for your exact climate, protecting against rot, fire, and pests.</p>
                <div className="flex items-center text-sm font-bold text-primary"><CheckCircle className="w-4 h-4 mr-2"/> ColorPlus® Technology prevents fading</div>
              </div>

              <div className="bg-dark p-6 rounded-xl border border-gray-800 hover:border-primary/50 transition">
                <h3 className="text-2xl font-bold text-white mb-2">Premium Insulated Vinyl</h3>
                <p className="text-gray-400 mb-4">The highest quality choice for long-lasting, low-maintenance beauty. Insulated vinyl provides an incredible ROI.</p>
                <div className="flex items-center text-sm font-bold text-primary"><CheckCircle className="w-4 h-4 mr-2"/> Extreme impact resistance against hail</div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="bg-dark p-8 rounded-2xl border-2 border-primary/20 shadow-2xl">
                <ShieldCheck className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">The Process Is Simple</h3>
                <p className="text-gray-300 leading-relaxed mb-6 font-medium">When you schedule an evaluation, we won't show up to pressure you into signing a contract. We arrive to listen, measure your property, and run the thermal diagnostics.</p>
                <p className="text-gray-300 leading-relaxed font-medium">Once we understand your goals, we will provide a comprehensive, transparent breakdown of the exact costs and timeline required to upgrade your exterior safely and beautifully. You decide when you are ready.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Softened Empathetic CTA */}
      <section className="py-24 bg-dark text-center px-6 border-t-[6px] border-primary">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Let's Upgrade Your Perimeter</h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">Siding upgrades are significant investments. Let's start the conversation by evaluating your home's current needs, entirely free of charge.</p>
          <a href="/#contact" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-10 py-5 rounded-md shadow-[0_10px_30px_rgba(158,130,84,0.3)] hover:bg-primary-dark hover:-translate-y-1 transition-all text-xl">
            Schedule Free Evaluation <ArrowRight className="w-6 h-6"/>
          </a>
        </div>
      </section>
    </div>
  )
}

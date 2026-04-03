import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle, Home, Wrench} from 'lucide-react';

export default function Doors() {
  return (
    <div className="w-full bg-dark text-gray-200">
      
      {/* 1. Empathy Hook Hero */}
      <section className="bg-darker text-white py-24 px-6 relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Unrivaled <br className="md:hidden"/><span className="text-primary">First Impressions.</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your front door is the absolute focal point of your home. A failing threshold creates security vulnerabilities and drafts, whereas a premium upgrade instantly transforms your curb appeal. 
          </p>
          <div className="pt-4">
           <a href="/#contact" className="inline-flex items-center gap-2 bg-primary/10 border border-primary text-primary font-bold px-8 py-3 rounded-md shadow-lg hover:bg-primary hover:text-white transition-all">
             Begin Your Project <ArrowRight className="w-5 h-5"/>
           </a>
          </div>
        </div>
      </section>

      {/* 2. Educational Breakdown */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Honest Education</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Beyond Aesthetics: <br className="md:hidden" />Security & Tolerances</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              It is incredibly common for homeowners to underestimate the engineering complexity of a premium entryway. It’s not simply a piece of wood on hinges. A high-end fiberglass entryway is a massive kinetic component engineered with locking tolerances measured in mere millimeters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="bg-darker p-8 rounded-2xl border border-gray-800 text-left">
              <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Wrench className="text-primary w-6 h-6"/> Why Cheap Installs Fail
              </h4>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Many contractors install "builder-grade" slabs directly into warped frames. This immediately leads to light entering under the threshold, aggressive heat loss, and locks that require you to "lift and push" just to secure the deadbolt. We absolutely refuse to execute a compromised installation.
              </p>
            </div>

            <div className="bg-darker p-8 rounded-2xl border border-gray-800 text-left">
              <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Home className="text-primary w-6 h-6"/> The Custom Approach
              </h4>
              <p className="text-gray-400 mb-6 leading-relaxed">
                We work directly with top-tier brands like **ProVia** and **Therma-Tru**, offering pre-hung fiberglass and reinforced steel mechanisms complete with heavy-duty multi-point locking systems. This forces the door securely into the weather stripping every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Transparent Process */}
      <section className="py-24 bg-darker border-y border-gray-800">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">What Happens When You Call?</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">We eliminate the anxiety of "the long sales pitch." When you look to secure your entryway, here is exactly how we carefully proceed:</p>
          </div>
          
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">1</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Measurement & Design</h3>
                <p className="text-gray-400 leading-relaxed">We arrive with precision tools to ensure your rough opening's absolute specifications are recorded. We then help you navigate hardware, glass accents, and finishes to perfectly accent your home's aesthetic without pressure.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">2</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Honest Sourcing</h3>
                <p className="text-gray-400 leading-relaxed">Custom doors take time to fabricate perfectly. We are completely transparent with our manufacturing timelines. We will not lie about how fast the manufacturer will deliver just to get your signature.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">3</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Flawless Integration</h3>
                <p className="text-gray-400 leading-relaxed">Our owner-supervised framing teams meticulously integrate your new system, guaranteeing absolute plum stability, perfect deadbolt action, and pristine caulking finish.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Softened Empathetic CTA */}
      <section className="py-24 bg-dark text-center px-6 border-t-[6px] border-primary">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Let's Secure the Entryway</h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">Your front door is the core aesthetic anchor of your property. Let's consult on options and designs entirely free of charge.</p>
          <a href="/#contact" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-10 py-5 rounded-md shadow-[0_10px_30px_rgba(158,130,84,0.3)] hover:bg-primary-dark hover:-translate-y-1 transition-all text-xl">
            Schedule a Consultation <ArrowRight className="w-6 h-6"/>
          </a>
        </div>
      </section>
    </div>
  )
}

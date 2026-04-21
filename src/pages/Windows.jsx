import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle, PenTool, Layout} from 'lucide-react';

export default function Windows() {
  return (
    <div className="w-full bg-dark text-gray-200">
      
      {/* 1. Empathy Hook Hero */}
      <section className="bg-darker text-white py-24 px-6 relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544207936-7c2226b25ea6?q=80&w=2072')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Eliminate the <br className="md:hidden"/><span className="text-primary">Winter Drafts.</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Dealing with outdated windows normally means sky-high energy bills and endless drafts. However, hunting for the right window replacement company often feels just as stressful. We are here to change that completely.
          </p>
          <div className="pt-4">
           <a href="/#contact" className="inline-flex items-center gap-2 bg-primary/10 border border-primary text-primary font-bold px-8 py-3 rounded-md shadow-lg hover:bg-primary hover:text-white transition-all">
             Request Honest Evaluation <ArrowRight className="w-5 h-5"/>
           </a>
          </div>
        </div>
      </section>

      {/* 2. Educational Breakdown */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Honest Education</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Rejecting the High-Pressure <br className="md:hidden" />Sales Tactics</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              The window sales industry is notorious for high-pressure gimmicks. Often, salesmen sit at your kitchen table for hours, deploying tactics like "sign today or lose a 30% discount." We vehemently reject this philosophy because it breeds resentment. A true custom window evaluation should be transparent, concise, and absolutely pressure-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="bg-darker p-8 rounded-2xl border border-gray-800 text-left">
              <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <PenTool className="text-primary w-6 h-6"/> Precise Custom Measurements
              </h4>
              <p className="text-gray-400 mb-6 leading-relaxed">
                A window isn't something pulled off a warehouse rack. The fundamental reason old windows fail is poor thermal mapping and shifting framing. We measure your exact openings down to the millimeter and custom-order the units to ensure a hermetic seal. Without precision measurement, a premium material is utterly useless.
              </p>
            </div>

            <div className="bg-darker p-8 rounded-2xl border border-gray-800 text-left">
              <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Layout className="text-primary w-6 h-6"/> Material Selection Matters
              </h4>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Instead of pushing a single proprietary brand, we evaluate your needs. Do you need the incredible thermal insulation of multi-pane fiberglass? Are you upgrading a historic home requiring custom wood frames? We work closely with top-tier brands like Pella and Andersen to match your explicit requirements.
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
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">We eliminate the anxiety of the "long sales pitch." When you request a window evaluation from Luitjens Exteriors, here is exactly how we proceed:</p>
          </div>
          
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">1</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Measurement & Consultation</h3>
                <p className="text-gray-400 leading-relaxed">We arrive precisely on time. We listen to your aesthetic goals, measure the frames currently expanding or rotting in your home, and take exact structural readings to calculate your potential energy efficiency improvements.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">2</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">A Transparent, Pressure-Free Quote</h3>
                <p className="text-gray-400 leading-relaxed">We will rapidly provide you with an incredibly detailed, itemized quote based solely on the measurements and the required materials. No multi-hour presentations. We will provide our findings, answer all of your questions, and step back so you can make a decision.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">3</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Owner-Driven Installation</h3>
                <p className="text-gray-400 leading-relaxed">Improper installation completely voids manufacturer warranties. We don't subcontract your home to the lowest bidder. Our owner-supervised crews execute flawless foaming, caulking, and finishing trims.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Softened Empathetic CTA */}
      <section className="py-24 bg-dark text-center px-6 border-t-[6px] border-primary">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Let's Secure Your Thermal Envelope</h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">Window upgrades are significant investments. Let's start the conversation by evaluating your home's current energy loss, entirely free of charge.</p>
          <a href="/#contact" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-10 py-5 rounded-md shadow-[0_10px_30px_rgba(158,130,84,0.3)] hover:bg-primary-dark hover:-translate-y-1 transition-all text-xl">
            Evaluate My Windows <ArrowRight className="w-6 h-6"/>
          </a>
        </div>
      </section>
    </div>
  )
}

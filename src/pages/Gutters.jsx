import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle, Droplets, Focus} from 'lucide-react';

export default function Gutters() {
  return (
    <div className="w-full bg-dark text-gray-200">
      
      {/* 1. Empathy Hook Hero */}
      <section className="bg-darker text-white py-24 px-6 relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-[url('/images/roof-gutter-inspection.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Protecting Your <br className="md:hidden"/><span className="text-primary">Foundation.</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Finding pooling water in your basement or noticing cracking driveways triggers immediate panic. Most often, the true culprit is silently failing above your head. Don't ignore a compromised gutter system.
          </p>
          <div className="pt-4">
           <a href="/#contact" className="inline-flex items-center gap-2 bg-primary/10 border border-primary text-primary font-bold px-8 py-3 rounded-md shadow-lg hover:bg-primary hover:text-white transition-all">
             Evaluate My Gutters <ArrowRight className="w-5 h-5"/>
           </a>
          </div>
        </div>
      </section>

      {/* 2. Educational Breakdown */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Honest Education</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Gutters Are Not Decor. <br className="md:hidden" />They Are a Critical Utility.</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              Too many contractors treat gutters as an afterthought aesthetic choice. As your local exterior specialists, we understand that improperly pitched or jointed gutters are the leading catalyst for massive foundation repair bills. When rainwater is not purposefully shuttled away from your basement walls, hydrostatic pressure builds and ultimately destroys concrete over time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="bg-darker p-8 rounded-2xl border border-gray-800 text-left">
              <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Focus className="text-primary w-6 h-6"/> Why Sectional Gutters Fail
              </h4>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Cheap "big box store" guttering is constructed in short pieces connected by joint seams. In the Midwest, the continuous freezing and thawing cycles cause these joints to expand and contract constantly, completely shredding the caulking and causing disastrous leaks directly over your walkways and porches.
              </p>
            </div>

            <div className="bg-darker p-8 rounded-2xl border border-gray-800 text-left">
              <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Droplets className="text-primary w-6 h-6"/> Precision Seamless Aluminum
              </h4>
              <p className="text-gray-400 mb-6 leading-relaxed">
                We custom-fabricate thick-gauge seamless aluminum gutters directly on your property. This completely eliminates the joints spanning across your rooflines, removing the mathematical probability of seam failure and guaranteeing smooth, unobstructed water clearance.
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
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">We eliminate the anxiety of "hiring out." When you request a water-divergence evaluation from Luitjens Exteriors, here is exactly how we approach your property:</p>
          </div>
          
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">1</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Evaluation & Math</h3>
                <p className="text-gray-400 leading-relaxed">We look for signs of hydrostatic damage, rotted fascia boards, pooling areas in your yard, and calculate the square footage of roof surface area to determine the correct math needed for proper downspout sizing.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">2</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Transparent Proposals</h3>
                <p className="text-gray-400 leading-relaxed">We clearly explain why we are recommending larger downspouts or leaf-guard protections, providing you with a transparent quote that accurately mitigates future damage liabilities.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">3</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Pristine Execution</h3>
                <p className="text-gray-400 leading-relaxed">We rip down your old gutters, inspect for massive structural rot underneath before proceeding, and deploy our seamless fabrication machine right in the yard to guarantee exact dimensions and heavy-duty hidden hanger strength.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Softened Empathetic CTA */}
      <section className="py-24 bg-dark text-center px-6 border-t-[6px] border-primary">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Let's Guard Your Foundation</h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">An improperly pitched gutter system is an active threat to your property value. Reach out today for a transparent, no-pressure inspection.</p>
          <a href="/#contact" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-10 py-5 rounded-md shadow-[0_10px_30px_rgba(158,130,84,0.3)] hover:bg-primary-dark hover:-translate-y-1 transition-all text-xl">
            Inspect My Gutters <ArrowRight className="w-6 h-6"/>
          </a>
        </div>
      </section>
    </div>
  )
}

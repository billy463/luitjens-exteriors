import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle, Zap, Crosshair, MapPin } from 'lucide-react';

export default function StormDamage() {
  return (
    <div className="w-full bg-dark text-gray-200">
      
      {/* 1. Empathy Hook Hero */}
      <section className="bg-darker text-white py-24 px-6 relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=2163')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">You Don't Have to Hire <br className="md:hidden"/><span className="text-primary">The First Door Knocker.</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            When a severe midwest storm hits, your neighborhood is immediately flooded with out-of-state salespeople using high-pressure tactics. As your local, family-owned neighbor, we are here to offer a calm, transparent, and absolutely honest alternative.
          </p>
          <div className="pt-4">
           <a href="/#contact" className="inline-flex items-center gap-2 bg-primary/10 border border-primary text-primary font-bold px-8 py-3 rounded-md shadow-lg hover:bg-primary hover:text-white transition-all">
             Request Honest Inspection <ArrowRight className="w-5 h-5"/>
           </a>
          </div>
        </div>
      </section>

      {/* 2. Educational Breakdown (The Local Difference) */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Honest Education</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Why Local Matters When <br className="md:hidden" />Navigating Insurance</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              Large corporate "storm chasers" descend on zip codes to maximize volume before disappearing back to another state. If something goes wrong with your roof two years later, they won't answer your calls. We live here. Our reputation is our most valuable asset, and we champion your insurance claim as if it were our own home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="bg-darker p-8 rounded-2xl border border-gray-800 text-left">
              <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Crosshair className="text-primary w-6 h-6"/> "We Pay Your Deductible" Scams
              </h4>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Many aggressive salesmen will illegally promise to waive or "absorb" your insurance deductible. This is fraud, and it forces them to violently cut corners on your materials and installation just to break even. We will never compromise the structural integrity of your home to win a cheap signature.
              </p>
            </div>

            <div className="bg-darker p-8 rounded-2xl border border-primary/30 relative text-left">
              <div className="absolute top-0 right-0 bg-primary/20 text-primary px-4 py-1 text-xs font-bold rounded-bl-lg border-b border-l border-primary/30">The Luitjens Guarantee</div>
              <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <MapPin className="text-primary w-6 h-6"/> Deep Rooted Accountability
              </h4>
              <p className="text-gray-400 mb-6 leading-relaxed">
                We aren't a massive spreadsheet of subcontractors. Luitjens Exteriors is locally owned, and we use top-tier GAF or Owens Corning materials strictly graded to survive St. Louis weather. You will interact with the owner, and if you ever need a warranty claim, we are a single local phone call away.
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
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">We eliminate the anxiety of "the insurance battle." Here is exactly how we navigate the massive bureaucracy of an insurance claim together:</p>
          </div>
          
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">1</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Independent Forensic Verification</h3>
                <p className="text-gray-400 leading-relaxed">Before you even file a claim, we will conduct our own uncompromising drone and physical inspection. We will identify precise hail strikes, wind-torn shingles, and collateral gutter damage, providing you with photographic proof to substantiate your claim to your insurance carrier.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">2</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Adjuster Meeting Representation</h3>
                <p className="text-gray-400 leading-relaxed">When the insurance adjuster visits your property, we want to be there with you on the roof. We act as your knowledgeable advocate, ensuring the adjuster doesn't overlook hidden damages that are heavily outlined in our initial forensic report.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">3</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">The Owner-Supervised Restoration</h3>
                <p className="text-gray-400 leading-relaxed">Once the claim is overwhelmingly approved, we get to work. Our owner directly supervises the replacement of your roof, siding, or gutters. We guarantee a flawless execution that completely reinstates (and upgrades) the protective armor around your home.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Softened Empathetic CTA */}
      <section className="py-24 bg-dark text-center px-6 border-t-[6px] border-primary">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Let's Navigate This Together</h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">You don't need to fight the insurance companies alone, and you certainly don't need to settle for an aggressive door knocker. Schedule your honest evaluation today.</p>
          <a href="/#contact" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-10 py-5 rounded-md shadow-[0_10px_30px_rgba(158,130,84,0.3)] hover:bg-primary-dark hover:-translate-y-1 transition-all text-xl">
            Request Honest Inspection <ArrowRight className="w-6 h-6"/>
          </a>
        </div>
      </section>
    </div>
  )
}

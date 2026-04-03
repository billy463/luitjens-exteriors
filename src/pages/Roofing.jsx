import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle, Search, ClipboardCheck, Hammer } from 'lucide-react';

export default function Roofing() {
  return (
    <div className="w-full bg-dark text-gray-200">
      
      {/* 1. Empathy Hook Hero */}
      <section className="bg-darker text-white py-24 px-6 relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-[url('/images/roofing%2Binstallation.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Finding a Leak <br className="md:hidden"/><span className="text-primary">is Stressful.</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We understand the anxiety of dealing with storm damage or an aging roof. Discovering a problem is overwhelming, but fixing it shouldn't be. 
          </p>
          <div className="pt-4">
           <a href="/#contact" className="inline-flex items-center gap-2 bg-primary/10 border border-primary text-primary font-bold px-8 py-3 rounded-md shadow-lg hover:bg-primary hover:text-white transition-all">
             Request Honest Evaluation <ArrowRight className="w-5 h-5"/>
           </a>
          </div>
        </div>
      </section>

      {/* 2. Educational Breakdown (The 10,000 ft View) */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Honest Education</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Repair vs. Replacement: <br className="md:hidden" />What You Actually Need</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              Countless roofing companies operate with a "replace everything" mentality because it secures a higher commission. As your neighbors, we reject that philosophy. We believe you should understand exactly what is failing on your roof before spending a dime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="bg-darker p-8 rounded-2xl border border-gray-800">
              <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Search className="text-primary w-6 h-6"/> When a Repair Makes Sense
              </h4>
              <p className="text-gray-400 mb-6">If your overall roofing system is structurally sound but sustained localized damage, a full replacement is often an enormous waste of your money.</p>
              <ul className="space-y-4">
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-gray-500 mr-3 mt-1 shrink-0"/> <span className="text-gray-300">Missing or blown-off shingles in specific valleys.</span></li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-gray-500 mr-3 mt-1 shrink-0"/> <span className="text-gray-300">Cracked pipe boots or deteriorated flashing.</span></li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-gray-500 mr-3 mt-1 shrink-0"/> <span className="text-gray-300">Minor puncture damage from fallen limbs.</span></li>
              </ul>
            </div>

            <div className="bg-darker p-8 rounded-2xl border border-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary/20 text-primary px-4 py-1 text-xs font-bold rounded-bl-lg border-b border-l border-primary/30">Total Protection</div>
              <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <ShieldCheck className="text-primary w-6 h-6"/> When Replacement is Required
              </h4>
              <p className="text-gray-400 mb-6">When core materials officially fail, patchwork repairs will only delay inevitable structural damage to your decking and attic.</p>
              <ul className="space-y-4">
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-3 mt-1 shrink-0"/> <span className="text-gray-200">Granule loss severely exposing the fiberglass matting.</span></li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-3 mt-1 shrink-0"/> <span className="text-gray-200">Massive curling, buckling, or widespread hail strikes.</span></li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mr-3 mt-1 shrink-0"/> <span className="text-gray-200">Systemic failure of the underlayment or water barriers.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Transparent Process */}
      <section className="py-24 bg-darker border-y border-gray-800">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">What Happens When You Call?</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">We eliminate the anxiety of the unknown. When you request a roofing evaluation from Luitjens Exteriors, here is exactly how we proceed:</p>
          </div>
          
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">1</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Comprehensive Drone & Physical Inspection</h3>
                <p className="text-gray-400 leading-relaxed">We will arrive on time and conduct a meticulous physical and drone inspection of your entire roofing system. We document every inch of the architecture, focusing specifically on ventilation, structural decking, and flashing integrity—not just the shingles.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">2</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Transparent Diagnosis & No-Pressure Review</h3>
                <p className="text-gray-400 leading-relaxed">We don't do "sales presentations." We simply show you the photos of your roof, explain the findings in plain English, and provide our honest recommendation. If you have storm damage, we can guide you comprehensively through navigating your insurance claim.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-dark shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(158,130,84,0.2)]">3</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Owner-Supervised Execution</h3>
                <p className="text-gray-400 leading-relaxed">If we proceed with a replacement, you aren't handed off to an unknown subcontractor. Our owner directly supervises the tear-off, ensuring your property is protected, the new GAF or Owens Corning materials are perfectly installed, and your yard is magnetically swept for loose nails multiple times.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Softened Empathetic CTA */}
      <section className="py-24 bg-dark text-center px-6 border-t-[6px] border-primary">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Let's Protect Your Home Together</h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">You don't need to commit to a massive project today. Schedule a free, informative evaluation, and let's discover exactly what your home needs to stay secure.</p>
          <a href="/#contact" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-10 py-5 rounded-md shadow-[0_10px_30px_rgba(158,130,84,0.3)] hover:bg-primary-dark hover:-translate-y-1 transition-all text-xl">
            Schedule Free Evaluation <ArrowRight className="w-6 h-6"/>
          </a>
        </div>
      </section>
    </div>
  )
}

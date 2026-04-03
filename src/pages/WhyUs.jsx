import React from 'react';
import { Award, ShieldCheck, Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WhyUs() {
  return (
    <div className="w-full">
      {/* Header */}
      <section className="bg-dark text-white py-20 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Built on <span className="text-primary">Trust</span> & <span className="text-secondary">Family</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We operate on a simple principle: Do honest work, charge a fair price, and treat every property exactly like it's our own home.
          </p>
        </div>
      </section>

      {/* The Family Difference */}
      <section className="py-24 bg-darker">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <img 
              src="/images/Luitjens-Exteriors.jpg" 
              alt="Luitjens Exteriors Family" 
              className="rounded-xl shadow-2xl w-full h-[500px] object-cover border-4 border-gray-50" 
              onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"}} 
            />
          </div>
          <div className="w-full lg:w-1/2 space-y-6">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight">The Small Business <span className="text-primary">Family Touch</span></h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              We aren't a big, faceless corporation. We are a family-first business that refuses to lose the personalized touch. When you call us, you speak to us directly. We are always available to chat because we want to truly earn your trust before we ever earn your business.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed font-bold border-l-4 border-primary pl-4">
              We aren't going to earn your business and then lie to you about how long the project is going to take. Transparency is everything to us.
            </p>
            <div className="pt-4">
              <Link to="/#contact" className="inline-flex items-center bg-primary hover:bg-primary-dark transition text-white px-8 py-4 font-bold rounded shadow-lg text-lg">
                Let's Chat About Your Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20 bg-dark border-t border-gray-800">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-darker border-t-4 border-primary rounded-xl p-10 shadow-lg text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-dark rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Owner On-Site</h3>
              <p className="text-gray-400 leading-relaxed">
                When you hire us, you aren't handed off to an unreliable subcontractor. The owner is heavily involved in your project, ensuring every nail and flashing detail is executed to absolute perfection.
              </p>
            </div>

            <div className="bg-darker border-t-4 border-dark rounded-xl p-10 shadow-lg text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-dark rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Heart className="w-8 h-8 text-gray-200" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No High-Pressure Sales</h3>
              <p className="text-gray-400 leading-relaxed">
                We despise the classic "Sign today or the discount goes away" tactic. We inspect, diagnose, and quote fairly. If your roof just needs a $300 repair, that is exactly what we recommend. 
              </p>
            </div>

            <div className="bg-darker border-t-4 border-secondary rounded-xl p-10 shadow-lg text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-dark rounded-full flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Family Owned & Local</h3>
              <p className="text-gray-400 leading-relaxed">
                We aren't a national chain chasing storms. We live here. We are rooted in the St. Louis community, building lifelong relationships with our neighbors through unparalleled reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

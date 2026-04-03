import { Zap, Home, Layout, Shield, Droplets, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const services = [
  {
    title: 'Storm Damage Restoration',
    description: 'Fast, reliable repairs after severe weather, from roofing and siding to windows and gutters.',
    icon: <Zap className="w-8 h-8 text-primary" />,
    path: '/storm-damage',
    featured: true
  },
  {
    title: 'Roofing',
    description: 'Certified repair and installation of high-quality roofing products from the industry’s top manufacturers.',
    icon: <Home className="w-8 h-8 text-primary" />,
    path: '/roofing',
    featured: false
  },
  {
    title: 'Windows',
    description: 'Upgrade to stylish, energy-efficient windows to enhance comfort and security.',
    icon: <Layout className="w-8 h-8 text-primary" />,
    path: '/windows',
    featured: false
  },
  {
    title: 'Doors',
    description: 'Premium entry, storm, and patio doors offering unparalleled security, thermal insulation, and massive curb appeal.',
    icon: <Wrench className="w-8 h-8 text-primary" />,
    path: '/doors',
    featured: false
  },
  {
    title: 'Siding',
    description: 'Durable, weather-resistant siding solutions designed to boost your home’s curb appeal and longevity.',
    icon: <Shield className="w-8 h-8 text-primary" />,
    path: '/siding',
    featured: false
  },
  {
    title: 'Gutters, Soffit, Fascia',
    description: 'Tough, low-maintenance solutions designed for optimal ventilation, drainage, and curb appeal.',
    icon: <Droplets className="w-8 h-8 text-primary" />,
    path: '/gutters',
    featured: false
  }
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-dark">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Our Capabilities</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Exceptional Quality <br/> for Every Detail</h3>
          <p className="text-gray-400 text-lg">Whether it’s a planned upgrade or emergency storm restoration, we handle every aspect of your home exterior.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-darker rounded-xl shadow-lg border-t-2 border-primary/50 hover:border-primary p-8 transition-all duration-300 h-full flex flex-col"
            >
              <div className="mb-6 bg-dark inline-block p-4 rounded-full self-start">
                {service.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-100 mb-3">{service.title}</h4>
              <p className="text-gray-400 leading-relaxed mb-6">{service.description}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-800">
                <Link to={service.path} className="text-primary font-bold hover:text-primary-dark inline-flex items-center group transition">
                  Learn More 
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

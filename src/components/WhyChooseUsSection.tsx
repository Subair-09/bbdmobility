import React from 'react';
import { ShieldCheck, Package, Percent, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const WhyChooseUsSection: React.FC = () => {
  const points = [
    {
      icon: ShieldCheck,
      title: 'Professional & Verified Riders',
      description: 'Trained, background-checked and ready.',
    },
    {
      icon: Package,
      title: 'Secure Packaging',
      description: 'Your items are handled with care.',
    },
    {
      icon: Percent,
      title: 'Affordable Rates',
      description: 'Great service, fair prices.',
    },
    {
      icon: MapPin,
      title: 'Wide Coverage',
      description: 'Across the city and beyond.',
    },
  ];

  return (
    <section className="relative bg-white overflow-hidden py-10 lg:py-0 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] items-stretch gap-6 lg:gap-0">
          
          {/* LEFT: Delivery Rider on Highway with Navy Text Overlay */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 relative rounded-2xl lg:rounded-none overflow-hidden min-h-[340px] sm:min-h-[380px] lg:min-h-full flex items-center p-6 sm:p-10 shadow-sm lg:shadow-none"
          >
            {/* Background Rider Image (Ultra-sharp, high definition) */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{
                backgroundImage: `url('/assets/highway-rider-sharp.jpg')`,
                backgroundPosition: 'center 40%',
              }}
            />

            {/* Cinematic dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-bbd-navy-dark/95 via-bbd-navy-dark/80 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-bbd-navy-dark/60 via-transparent to-transparent pointer-events-none" />

            {/* Overlay Content Box */}
            <div className="relative z-10 max-w-sm sm:max-w-md space-y-3 sm:space-y-4 my-auto">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-[2.5px] bg-bbd-red rounded-full" />
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight drop-shadow-sm">
                <span className="text-white">Real People.</span>
                <br />
                <span className="text-bbd-red italic">Real Deliveries.</span>
              </h2>

              <p className="text-slate-100 text-xs sm:text-sm leading-relaxed max-w-sm drop-shadow-sm">
                BBD Mobility is built on trust, speed and a commitment to getting your packages where they need to be.
              </p>
            </div>
          </motion.div>

          {/* RIGHT: Why Choose BBD Mobility? Benefits List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 relative bg-white flex flex-col justify-center px-4 sm:px-10 lg:px-12 py-6 sm:py-10 lg:py-14"
          >
            {/* Signature Diagonal Brand Stripes (Bottom Right) */}
            <div className="absolute bottom-0 right-0 w-32 sm:w-48 h-32 sm:h-48 pointer-events-none z-0 overflow-hidden">
              <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none">
                {/* Deep Navy Stripe */}
                <polygon points="0,200 45,200 200,45 200,0" fill="#092957" />
                {/* Red Stripe */}
                <polygon points="55,200 100,200 200,100 200,55" fill="#E30620" />
              </svg>
            </div>

            <div className="relative z-10 space-y-5 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-bbd-navy tracking-tight">
                Why Choose BBD Mobility?
              </h2>

              <div className="space-y-4 sm:space-y-5">
                {points.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: index * 0.08 }}
                      whileHover={{ x: 4 }}
                      className="flex items-start space-x-3.5 group cursor-default"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-bbd-red/30 bg-red-50/50 flex items-center justify-center text-bbd-red flex-shrink-0 group-hover:bg-bbd-red group-hover:text-white transition-all duration-300 shadow-xs">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-base font-bold text-bbd-navy group-hover:text-bbd-red transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs lg:text-sm text-slate-500 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

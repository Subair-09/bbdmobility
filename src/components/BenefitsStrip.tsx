import React from 'react';
import { Clock, ShieldCheck, MapPin, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

export const BenefitsStrip: React.FC = () => {
  const benefits = [
    {
      icon: Clock,
      title: 'Quick Turnaround',
      description: 'Get your items delivered on time, every time.',
    },
    {
      icon: ShieldCheck,
      title: 'Safe & Secure',
      description: 'Your packages are in trusted hands.',
    },
    {
      icon: MapPin,
      title: 'Live Support',
      description: "We're here 24/7 to assist you.",
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: "We're always here to help.",
    },
  ];

  return (
    <section className="bg-white border-y border-gray-100 py-6 sm:py-8 lg:py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-0 lg:divide-x divide-gray-100">
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -3 }}
                className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl sm:rounded-none bg-slate-50/60 lg:bg-transparent border border-slate-100 lg:border-none transition-all duration-200"
              >
                <div className="mb-2.5 sm:mb-3 text-bbd-navy transition-transform hover:scale-110">
                  <Icon className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.75]" />
                </div>
                <h3 className="text-xs sm:text-base font-bold text-bbd-navy mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs lg:text-sm text-slate-500 max-w-[200px] leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

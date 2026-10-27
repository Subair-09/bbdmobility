import React, { useEffect } from 'react';
import {
  FileText,
  UtensilsCrossed,
  Package,
  Gift,
  CalendarClock,
  CheckCircle2,
  Zap,
  ShieldCheck,
  MapPin,
  Headphones,
  ArrowRight,
  Shield,
  Coins,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ServicesPageProps {
  onBackToHome: () => void;
  onBookNow: (serviceName?: string) => void;
  onOpenModal: (type: 'contact' | 'faqs' | 'how-it-works') => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onBookNow,
  onOpenModal,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Delivery Services | BBD Mobility - Move What Matters';
  }, []);

  const serviceCategories = [
    {
      id: 'documents',
      name: 'Documents & Files',
      icon: FileText,
      badge: 'Confidential & Fast',
      description:
        'Contracts, legal papers, official documents, tenders, certificates, and confidential items delivered with complete safety and urgency.',
      features: ['Tamper-evident handling', 'Urgent same-day dispatch', 'Signature on delivery'],
    },
    {
      id: 'food',
      name: 'Food & Groceries',
      icon: UtensilsCrossed,
      badge: 'Fresh & Prompt',
      description:
        'Fresh cooked meals, groceries, restaurant parcels, and daily essentials transported carefully to arrive fresh, hot, and on time.',
      features: ['Careful temperature transit', 'No spillage guarantee', 'Direct doorstep drop-off'],
    },
    {
      id: 'ecommerce',
      name: 'E-Commerce Packages',
      icon: Package,
      badge: 'Merchant Friendly',
      description:
        'Customer orders, fashion items, beauty products, electronics, and merchandise dispatched reliably for businesses and independent sellers.',
      features: ['Reliable parcel logistics', 'Same-day customer fulfillment', 'Customer delivery alert'],
    },
    {
      id: 'personal',
      name: 'Personal Items',
      icon: Gift,
      badge: 'Everyday Errands',
      description:
        'Gifts, keys, gadgets, fashion accessories, forgotten essentials, and personal errands moved across the city without stress.',
      features: ['Door-to-door convenience', 'Fragile item care', 'Direct rider coordination'],
    },
    {
      id: 'scheduled',
      name: 'Scheduled Deliveries',
      icon: CalendarClock,
      badge: 'Plan in Advance',
      description:
        'Set up advance delivery dates or recurring schedules for business runs, batch dispatches, and scheduled pickups that fit your timeline.',
      features: ['Advance date selection', 'Automated rider booking', 'Guaranteed pickup slot'],
    },
  ];

  return (
    <div className="bg-white text-bbd-navy font-sans">
      
      {/* =========================================================================
          SECTION 1: HERO BANNER (Navy Left, Rider Graphic Right with Skew Slash)
         ========================================================================= */}
      <section className="relative overflow-hidden bg-[#092957] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px] sm:min-h-[360px] items-stretch">
            
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 py-10 sm:py-14 flex flex-col justify-center text-left space-y-4 pr-0 lg:pr-8 z-10"
            >
              <div className="flex items-center space-x-2">
                <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase">
                  OUR SERVICES
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tight leading-[1.1]">
                Fast. Safe. Reliable. <br />
                <span className="text-[#E30620]">Delivery Services for You.</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                From important documents to daily essentials, BBD Mobility delivers with speed, safety and care. Choose the service that fits your needs.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => onBookNow()}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#E30620] hover:bg-[#b8051a] text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-red-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Book a Delivery Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenModal('how-it-works')}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wide backdrop-blur-sm transition-all border border-white/20 cursor-pointer"
                >
                  How It Works
                </button>
              </div>
            </motion.div>

            {/* Right Column Visual */}
            <div className="lg:col-span-5 relative flex items-center justify-end overflow-hidden -mx-4 sm:-mx-6 lg:mx-0">
              <div className="hidden lg:block absolute left-0 inset-y-0 w-16 bg-gradient-to-r from-[#092957] via-[#092957]/80 to-transparent z-10 pointer-events-none" />
              <div className="hidden lg:block absolute left-6 inset-y-0 w-3 bg-[#E30620] transform -skew-x-12 z-10" />

              <img
                src="/assets/services-rider-card.jpg"
                alt="BBD Mobility Courier Services"
                className="w-full h-full min-h-[240px] sm:min-h-[300px] lg:min-h-[360px] object-cover object-center"
              />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: WHAT WE DELIVER (5 Service Cards)
         ========================================================================= */}
      <section className="py-14 sm:py-20 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 mb-2">
              <span className="w-5 h-[2px] bg-[#E30620] inline-block" />
              <span className="text-xs font-bold tracking-widest text-[#E30620] uppercase">
                OUR SERVICES
              </span>
              <span className="w-5 h-[2px] bg-[#E30620] inline-block" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#092957] tracking-tight">
              What We Deliver
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Reliable delivery solutions for individuals and businesses across Lagos and beyond.
            </p>
          </div>

          {/* Cards Grid: 3 on top row, 2 centered on second row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {serviceCategories.slice(0, 3).map((service, index) => {
              const IconComp = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 sm:p-7 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center group-hover:bg-[#E30620] group-hover:text-white transition-colors duration-300 shadow-sm">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {service.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#092957] mb-2 group-hover:text-[#E30620] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                      {service.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-gray-100 mb-6">
                      {service.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center text-[11px] text-gray-500">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E30620] mr-2 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onBookNow(service.name)}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#092957] hover:bg-[#E30620] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Book This Service</span>
                    <ArrowRight className="ml-2 w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Second Row (2 cards centered on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 sm:gap-8 mt-6 sm:mt-8">
            {serviceCategories.slice(3).map((service, index) => {
              const IconComp = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-xl p-6 sm:p-7 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center group-hover:bg-[#E30620] group-hover:text-white transition-colors duration-300 shadow-sm">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {service.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#092957] mb-2 group-hover:text-[#E30620] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                      {service.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-gray-100 mb-6">
                      {service.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center text-[11px] text-gray-500">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E30620] mr-2 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onBookNow(service.name)}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#092957] hover:bg-[#E30620] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Book This Service</span>
                    <ArrowRight className="ml-2 w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: REAL PEOPLE. REAL DELIVERIES & WHY CHOOSE BBD MOBILITY?
         ========================================================================= */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Rider Photograph Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-100">
                <img
                  src="/assets/services-rider-card.jpg"
                  alt="Real BBD Delivery Rider"
                  className="w-full h-auto object-cover max-h-[420px]"
                />
                
                {/* Floating On-Time Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#092957]/95 backdrop-blur-md rounded-xl p-3.5 text-white border border-white/10 shadow-lg flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-[#E30620] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold tracking-tight">100% Commitment</h4>
                    <p className="text-[11px] text-slate-300">Safe, on-time doorstep delivery guarantee</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Why Choose BBD Mobility */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                  <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#E30620] uppercase">
                    BBD MOBILITY ADVANTAGE
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#092957] tracking-tight">
                  Real People. Real Deliveries.
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  BBD Mobility is built on trust, speed and a commitment to getting your packages where they need to be.
                </p>
              </div>

              <div className="pt-2">
                <h3 className="text-base sm:text-lg font-bold text-[#092957] mb-4 flex items-center">
                  <span className="w-2 h-2 bg-[#E30620] rounded-full mr-2" />
                  Why Choose BBD Mobility?
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Professional & Verified Riders',
                      desc: 'Trained, background-checked riders dedicated to handling every package with care.',
                      icon: Users,
                    },
                    {
                      title: 'Affordable & Transparent Rates',
                      desc: 'Clear upfront pricing with no hidden charges, surprise fees, or surge multipliers.',
                      icon: Coins,
                    },
                    {
                      title: 'Wide Coverage Across Lagos',
                      desc: 'Reaching both mainland and island hubs with extensive route efficiency.',
                      icon: MapPin,
                    },
                    {
                      title: 'Secure & Reliable Handling',
                      desc: 'From pickup to destination handover, your items are fully monitored and protected.',
                      icon: Shield,
                    },
                  ].map((benefit, bIdx) => {
                    const BIcon = benefit.icon;
                    return (
                      <div
                        key={bIdx}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-red-200 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 text-[#E30620] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <BIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#092957] leading-snug">
                              {benefit.title}
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                              {benefit.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: NEED A DELIVERY? CTA STRIP (Matching Mockup with 4 Guarantees)
         ========================================================================= */}
      <section className="py-14 bg-[#092957] text-white relative overflow-hidden">
        {/* Subtle decorative accents */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#E30620]/15 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold italic tracking-tight">
              Need a <span className="text-[#E30620]">Delivery?</span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
              Book now and experience fast, safe and reliable delivery services across Lagos and beyond.
            </p>

            <div className="mt-6">
              <button
                onClick={() => onBookNow()}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-[#E30620] hover:bg-[#b8051a] text-white font-bold text-xs uppercase tracking-wider shadow-xl hover:shadow-red-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                Book a Delivery
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* 4 Guarantees Strip */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Fast Delivery', desc: 'Swift pickup & dispatch', icon: Zap },
              { label: 'Safe & Secure', desc: 'Handled with utmost care', icon: ShieldCheck },
              { label: 'Wide Coverage', desc: 'Mainland, Island & beyond', icon: MapPin },
              { label: '24/7 Support', desc: 'Always here to assist', icon: Headphones },
            ].map((item, idx) => {
              const GIcon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#E30620] mb-2">
                    <GIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white">{item.label}</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
};

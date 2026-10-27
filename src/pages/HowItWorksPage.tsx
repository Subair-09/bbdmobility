import React, { useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight,
  Truck,
  Users,
  Smartphone,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';

interface HowItWorksPageProps {
  onBackToHome: () => void;
  onBookNow: () => void;
  onOpenModal: (type: 'contact' | 'faqs' | 'services') => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onBookNow,
  onOpenModal,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const howItWorksSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://www.bbdmobility.com.ng/'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'How It Works',
            'item': 'https://www.bbdmobility.com.ng/how-it-works'
          }
        ]
      },
      {
        '@type': 'HowTo',
        '@id': 'https://www.bbdmobility.com.ng/how-it-works#guide',
        'name': 'How to Book a Delivery with BBD Mobility in Lagos',
        'description': 'Four simple steps to arrange fast and secure courier delivery across Lagos, Nigeria.',
        'step': [
          {
            '@type': 'HowToStep',
            'position': 1,
            'name': 'Book Your Delivery',
            'text': 'Enter your pickup and drop-off addresses, package details, and contact information through the online form.'
          },
          {
            '@type': 'HowToStep',
            'position': 2,
            'name': 'Get Instant Confirmation',
            'text': 'Receive immediate confirmation with your booking reference, route summary, and dispatch notice.'
          },
          {
            '@type': 'HowToStep',
            'position': 3,
            'name': 'Vetted Rider Assigned',
            'text': 'A background-checked BBD courier rider near your pickup location is assigned to collect your parcel.'
          },
          {
            '@type': 'HowToStep',
            'position': 4,
            'name': 'Safe Doorstep Delivery',
            'text': 'Your package is safely transported in a weatherproof box and handed over directly to the recipient.'
          }
        ]
      }
    ]
  };

  const steps = [
    {
      number: '01',
      title: 'Book Your Delivery',
      desc: 'Enter your pickup and drop-off addresses, package details, and contact information through our simple online form in under 2 minutes.',
      icon: Smartphone,
    },
    {
      number: '02',
      title: 'Get Confirmation',
      desc: 'Receive immediate confirmation with your booking details, upfront pricing breakdown, and unique order tracking reference.',
      icon: FileText,
    },
    {
      number: '03',
      title: 'Rider Assigned',
      desc: 'We match your request with the closest vetted and background-checked BBD courier rider stationed near your pickup location.',
      icon: Truck,
    },
    {
      number: '04',
      title: 'Pickup & In-Transit',
      desc: 'The rider arrives at your doorstep, collects your package securely, and heads directly toward the recipient destination.',
      icon: Clock,
    },
    {
      number: '05',
      title: 'Safe Delivery',
      desc: 'Your package is safely delivered into the recipient’s hands with prompt confirmation and seamless communication.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-white text-bbd-navy font-sans">
      <SEO
        title="How It Works — Courier Booking in Lagos | BBD Mobility"
        description="Learn how to book a courier in Lagos with BBD Mobility in 4 simple steps: enter pickup & drop-off details, get confirmation, rider dispatched, and safe delivery."
        canonicalPath="/how-it-works"
        keywords="how to book courier Lagos, parcel delivery process Lagos, book dispatch rider Nigeria, BBD Mobility steps"
        schema={howItWorksSchema}
        image="/assets/ready-to-send-package-hd.jpg"
      />
      
      {/* =========================================================================
          SECTION 1: HERO BANNER (Navy Left, Visual Right with Red Skew Slash)
         ========================================================================= */}
      <section className="relative overflow-hidden bg-[#092957] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px] sm:min-h-[360px] items-stretch">
            
            {/* Left Column Content */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 py-10 sm:py-14 flex flex-col justify-center text-left space-y-4 pr-0 lg:pr-8 z-10"
            >
              <div className="flex items-center space-x-2">
                <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase">
                  THE PROCESS
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tight leading-[1.1]">
                Simple Steps. <br />
                <span className="text-[#E30620]">Fast Delivery.</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                Send and receive items with just a few simple steps. Book online and let BBD Mobility handle the rest with speed, care, and total transparency.
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
                  onClick={() => onOpenModal('faqs')}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wide backdrop-blur-sm transition-all border border-white/20 cursor-pointer"
                >
                  View FAQs
                </button>
              </div>
            </motion.div>

            {/* Right Column Visual: Official BBD Mobility Logo Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-5 relative flex items-center justify-center py-8 sm:py-12"
            >
              {/* Ambient radial red brand glow behind logo */}
              <div className="absolute inset-0 bg-radial from-[#E30620]/25 via-transparent to-transparent blur-3xl pointer-events-none" />

              {/* Branded Showcase Card */}
              <div className="relative w-full max-w-sm rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md p-8 sm:p-10 flex flex-col items-center justify-center text-center shadow-2xl group hover:border-[#E30620]/50 transition-all duration-300">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#E30620] rounded-full shadow-sm" />

                <img
                  src="/assets/logo-white.png"
                  alt="BBD Mobility Logo"
                  className="w-full max-w-[260px] sm:max-w-[290px] h-auto object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
                />

                <div className="mt-5 pt-4 border-t border-white/10 w-full flex items-center justify-center space-x-2.5 text-xs font-semibold text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E30620] animate-pulse" />
                  <span className="italic tracking-wider text-slate-100 font-bold">Move What Matters</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E30620] animate-pulse" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: HOW IT WORKS (5 Numbered Cards)
         ========================================================================= */}
      <section className="py-14 sm:py-20 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 mb-2">
              <span className="w-5 h-[2px] bg-[#E30620] inline-block" />
              <span className="text-xs font-bold tracking-widest text-[#E30620] uppercase">
                HOW IT WORKS
              </span>
              <span className="w-5 h-[2px] bg-[#E30620] inline-block" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#092957] tracking-tight">
              Designed for Convenience
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              From booking to doorstep drop-off, our 5-step process makes city deliveries fast and stress-free.
            </p>
          </div>

          {/* 5 Steps Grid: Top row 3, bottom row 2 centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {steps.slice(0, 3).map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 sm:p-7 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 relative group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black italic text-[#E30620]">
                      {step.number}
                    </span>
                    <div className="w-11 h-11 rounded-lg bg-red-50 text-[#E30620] flex items-center justify-center group-hover:bg-[#E30620] group-hover:text-white transition-colors duration-300">
                      <StepIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#092957] mb-2 group-hover:text-[#E30620] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 sm:gap-8 mt-6 sm:mt-8">
            {steps.slice(3).map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-xl p-6 sm:p-7 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 relative group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black italic text-[#E30620]">
                      {step.number}
                    </span>
                    <div className="w-11 h-11 rounded-lg bg-red-50 text-[#E30620] flex items-center justify-center group-hover:bg-[#E30620] group-hover:text-white transition-colors duration-300">
                      <StepIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#092957] mb-2 group-hover:text-[#E30620] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: READY TO SEND YOUR PACKAGE? (Matching Phone Mockup & Benefits)
         ========================================================================= */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#092957] to-[#04142d] rounded-2xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
            
            {/* Background decorative glow */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#E30620]/10 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center relative z-10">
              
              {/* Left Column: Ultra-Sharp HD Delivery Handover Photograph */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900 group">
                  <img
                    src="/assets/ready-to-send-package-hd.jpg"
                    alt="Customer handing over delivery package to BBD Mobility courier in Lagos"
                    className="w-full h-[300px] sm:h-[360px] lg:h-[390px] object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#092957]/30 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Right Column: Copy & Checklist */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                    <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#E30620] uppercase">
                      EFFORTLESS LOGISTICS
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold italic tracking-tight">
                    Ready to Send Your <span className="text-[#E30620]">Package?</span>
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Experience seamless city logistics built around your schedule. Whether urgent contracts, retail orders, or personal errands, we deliver with precision.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {[
                    'Instant online booking in under 2 minutes',
                    'Affordable, transparent fixed rates with zero hidden fees',
                    'Verified, background-checked professional dispatch couriers',
                    'Same-day express delivery across Lagos and surrounding hubs',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-[#E30620] flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-100 font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => onBookNow()}
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-[#E30620] hover:bg-[#b8051a] text-white font-bold text-xs uppercase tracking-wider shadow-xl hover:shadow-red-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Book a Delivery Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: WHY CHOOSE US - TRUSTED. PROFESSIONAL. ALWAYS.
         ========================================================================= */}
      <section className="py-14 sm:py-20 bg-slate-50 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                  <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#E30620] uppercase">
                    OUR CORE PROMISE
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#092957] tracking-tight">
                  Trusted. Professional. Always.
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We are committed to delivering the best logistics experience with courteous riders, secure package handling, and exceptional customer service every single time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  {
                    title: 'Punctuality First',
                    desc: 'Every delivery is prioritized to reach its destination right on time.',
                    icon: Clock,
                  },
                  {
                    title: 'Safe Custody',
                    desc: 'Careful handling for every package, from fragile to everyday goods.',
                    icon: Shield,
                  },
                  {
                    title: 'Customer Focused',
                    desc: 'Direct communication, friendly riders, and responsive assistance.',
                    icon: Users,
                  },
                ].map((pillar, pIdx) => {
                  const PIcon = pillar.icon;
                  return (
                    <div
                      key={pIdx}
                      className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E30620] flex items-center justify-center mb-2.5">
                        <PIcon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#092957] mb-1">
                        {pillar.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Rider Photo: 1200x896 Ultra-Sharp HD Photography */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-100">
                <img
                  src="/assets/courier-rider-hd.jpg"
                  alt="Verified BBD Mobility dispatch courier rider in Lagos"
                  className="w-full h-auto object-cover max-h-[420px]"
                  loading="lazy"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: STATISTICS STRIP (Exact Match to Mockup)
         ========================================================================= */}
      <section className="py-12 bg-[#092957] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            
            <div className="pt-4 md:pt-0">
              <span className="text-3xl sm:text-4xl font-black text-white italic tracking-tight">
                10,000<span className="text-[#E30620]">+</span>
              </span>
              <p className="text-xs text-slate-300 mt-1 font-semibold uppercase tracking-wider">
                Deliveries Completed
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <span className="text-3xl sm:text-4xl font-black text-white italic tracking-tight">
                5,000<span className="text-[#E30620]">+</span>
              </span>
              <p className="text-xs text-slate-300 mt-1 font-semibold uppercase tracking-wider">
                Happy Customers
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <span className="text-2xl sm:text-3xl font-black text-white italic tracking-tight">
                Lagos <span className="text-[#E30620]">& Beyond</span>
              </span>
              <p className="text-xs text-slate-300 mt-1 font-semibold uppercase tracking-wider">
                Strategic Coverage
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <span className="text-3xl sm:text-4xl font-black text-[#E30620] italic tracking-tight">
                100%
              </span>
              <p className="text-xs text-slate-300 mt-1 font-semibold uppercase tracking-wider">
                Safe & Secure Guarantee
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

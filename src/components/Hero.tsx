import React from 'react';
import { Zap, ShieldCheck, Headphones, Users, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { BookingCard } from './BookingCard';

interface HeroProps {
  onBookClick: () => void;
  selectedServiceType?: string;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, selectedServiceType }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  return (
    <section id="home" className="relative bg-white overflow-hidden pt-4 pb-10 sm:pt-6 sm:pb-14 lg:pt-8 lg:pb-16">
      {/* Signature Diagonal Brand Stripes (Top Right) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute top-0 right-0 w-40 sm:w-56 lg:w-64 h-40 sm:h-56 lg:h-64 pointer-events-none z-0 overflow-hidden"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Deep Navy Stripe */}
          <polygon points="120,0 155,0 200,45 200,80" fill="#092957" />
          {/* Brand Red Stripe */}
          <polygon points="165,0 200,0 200,35" fill="#E30620" />
        </svg>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* LEFT COLUMN: Main copy & feature icons */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-4 xl:col-span-4 space-y-5 sm:space-y-6 text-left"
          >
            {/* Eyebrow badge with live pulse */}
            <motion.div variants={itemVariants} className="flex items-center space-x-2">
              <span className="w-6 h-[2.5px] bg-bbd-red rounded-full" />
              <span className="text-[11px] sm:text-xs font-bold tracking-widest text-bbd-navy uppercase">
                FAST • SAFE • RELIABLE
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl lg:text-[44px] xl:text-[48px] font-extrabold tracking-tight leading-[1.1] text-bbd-navy"
            >
              <span>Your Packages,</span>
              <br />
              <span className="text-bbd-red italic font-black">Our Priority</span>
            </motion.h1>

            {/* Supporting text */}
            <motion.p
              variants={itemVariants}
              className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-sm sm:max-w-md"
            >
              BBD Mobility delivers your packages, documents and essentials quickly and safely — anywhere in the city.
            </motion.p>

            {/* Four compact icon-and-label features */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 max-w-sm"
            >
              {/* Feature 1 */}
              <motion.div
                whileHover={{ y: -3 }}
                className="flex flex-col items-center text-center group cursor-default"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-50 flex items-center justify-center text-bbd-red mb-1.5 transition-transform group-hover:scale-110 shadow-xs">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-bbd-red/20 stroke-bbd-red" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-bbd-navy leading-tight">
                  Fast<br />Delivery
                </span>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                whileHover={{ y: -3 }}
                className="flex flex-col items-center text-center group cursor-default"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-50 flex items-center justify-center text-bbd-red mb-1.5 transition-transform group-hover:scale-110 shadow-xs">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-bbd-red" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-bbd-navy leading-tight">
                  Safe &amp;<br />Secure
                </span>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                whileHover={{ y: -3 }}
                className="flex flex-col items-center text-center group cursor-default"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-50 flex items-center justify-center text-bbd-red mb-1.5 transition-transform group-hover:scale-110 shadow-xs">
                  <Headphones className="w-4 h-4 sm:w-5 sm:h-5 stroke-bbd-red" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-bbd-navy leading-tight">
                  Real-time<br />Support
                </span>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                whileHover={{ y: -3 }}
                className="flex flex-col items-center text-center group cursor-default"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-50 flex items-center justify-center text-bbd-red mb-1.5 transition-transform group-hover:scale-110 shadow-xs">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 stroke-bbd-red" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-bbd-navy leading-tight">
                  Trusted<br />Riders
                </span>
              </motion.div>
            </motion.div>

            {/* Red Rounded Button with subtle pulse */}
            <motion.div variants={itemVariants} className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onBookClick}
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 bg-bbd-red hover:bg-bbd-red-hover active:bg-bbd-red-hover text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all group"
              >
                <span>Book a Delivery</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </motion.button>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-bbd-red" />
                <span>Instant dispatch response</span>
              </div>
            </motion.div>
          </motion.div>

          {/* CENTER: Photographic visual with gentle floating motion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-4 xl:col-span-4 relative flex items-center justify-center order-3 lg:order-2"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full max-w-[380px] sm:max-w-[420px] lg:max-w-none"
            >
              <img
                src="/assets/hero-composite.jpg"
                alt="BBD Mobility courier delivering package to customer"
                className="w-full h-auto object-contain mx-auto drop-shadow-md rounded-xl"
              />
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: The Floating Booking Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-4 xl:col-span-4 flex justify-center lg:justify-end order-2 lg:order-3 w-full"
          >
            <BookingCard initialServiceType={selectedServiceType} />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

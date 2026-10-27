import React, { useState, useEffect } from 'react';
import { Phone, ArrowRight, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onOpenModal: (modalType: 'how-it-works' | 'about-us' | 'faqs' | 'contact') => void;
  onBookNowClick: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenModal,
  onBookNowClick,
  activeNav,
  setActiveNav,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#home', type: 'scroll' },
    { name: 'Services', href: '#services', type: 'scroll' },
    { name: 'How It Works', modal: 'how-it-works' as const, type: 'modal' },
    { name: 'About Us', modal: 'about-us' as const, type: 'modal' },
    { name: 'FAQs', modal: 'faqs' as const, type: 'modal' },
    { name: 'Contact', modal: 'contact' as const, type: 'modal' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveNav(item.name);
    setMobileMenuOpen(false);
    if (item.type === 'modal' && item.modal) {
      onOpenModal(item.modal);
    } else if (item.type === 'scroll') {
      const el = document.querySelector(item.href!);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100 py-1'
          : 'bg-white border-b border-gray-100 py-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Official Logo + Live Dispatch Pill */}
          <div className="flex-shrink-0 flex items-center space-x-3">
            <a href="#home" className="flex items-center group">
              <img
                src="/assets/logo.png"
                alt="BBD Mobility"
                className="h-9 sm:h-11 md:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </a>
            
            {/* Live Dispatch Indicator (Desktop) */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Dispatch</span>
            </div>
          </div>

          {/* Center: Desktop Navigation links with animated active underline */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => {
              const isActive = activeNav === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  className={`relative py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-bbd-navy font-bold'
                      : 'text-slate-600 hover:text-bbd-navy'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.span
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-bbd-red rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Phone & Book Now CTA */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <a
              href="tel:+2348123456789"
              className="flex items-center text-xs lg:text-sm font-semibold text-bbd-navy hover:text-bbd-red transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-bbd-navy/5 flex items-center justify-center mr-2 text-bbd-navy group-hover:bg-bbd-red/10 group-hover:text-bbd-red transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <span className="tracking-tight">+234 812 345 6789</span>
            </a>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBookNowClick}
              className="inline-flex items-center justify-center px-5 lg:px-6 py-2.5 bg-bbd-navy text-white text-xs lg:text-sm font-semibold rounded-full hover:bg-bbd-navy-light shadow-sm hover:shadow transition-all group"
            >
              <span>Book Now</span>
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>

          {/* Mobile Actions: Call Button + Hamburger Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <a
              href="tel:+2348123456789"
              className="p-2 rounded-full bg-slate-100 text-bbd-navy hover:bg-red-50 hover:text-bbd-red transition-colors"
              aria-label="Call Dispatch"
            >
              <Phone className="w-4 h-4" />
            </a>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBookNowClick}
              className="px-3 py-1.5 bg-bbd-red text-white text-xs font-bold rounded-full shadow-sm"
            >
              Book Now
            </motion.button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-bbd-navy hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Sleek Animated Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-gray-100 bg-white/98 backdrop-blur-lg px-4 pt-4 pb-6 shadow-2xl overflow-hidden"
          >
            {/* Status indicator inside drawer */}
            <div className="flex items-center justify-between mb-3 px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-600 font-medium">BBD Dispatch Status:</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Active across Nigeria
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              {navItems.map((item, idx) => {
                const isActive = activeNav === item.name;
                return (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => handleNavClick(item)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-red-50 text-bbd-red font-bold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-bbd-navy'
                    }`}
                  >
                    <span>{item.name}</span>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-bbd-red' : 'text-slate-400'}`} />
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col space-y-3">
              <a
                href="tel:+2348123456789"
                className="flex items-center justify-center py-3 px-4 bg-slate-100 hover:bg-slate-200 text-bbd-navy text-xs font-bold rounded-xl transition-colors gap-2"
              >
                <Phone className="w-4 h-4 text-bbd-red" />
                <span>Call Hotline: +234 812 345 6789</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBookNowClick();
                }}
                className="w-full flex items-center justify-center py-3.5 bg-bbd-red hover:bg-bbd-red-hover active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-lg transition-all"
              >
                <span>Book a Delivery</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

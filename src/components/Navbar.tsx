import React, { useState, useEffect } from 'react';
import { Phone, ArrowRight, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onOpenModal: (modalType: 'how-it-works' | 'about-us' | 'faqs' | 'contact') => void;
  onBookNowClick: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onNavigateHome: (targetId?: string) => void;
  onNavigateAbout: () => void;
  onNavigateContact: () => void;
  onNavigateServices: () => void;
  onNavigateHowItWorks: () => void;
  onNavigateFaqs: () => void;
  currentView: 'home' | 'about' | 'contact' | 'services' | 'how-it-works' | 'faqs';
}

export const Navbar: React.FC<NavbarProps> = ({
  onBookNowClick,
  activeNav,
  setActiveNav,
  onNavigateHome,
  onNavigateAbout,
  onNavigateContact,
  onNavigateServices,
  onNavigateHowItWorks,
  onNavigateFaqs,
  currentView,
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
    { name: 'Home', type: 'home' as const },
    { name: 'Services', type: 'services' as const },
    { name: 'How It Works', type: 'how-it-works' as const },
    { name: 'About Us', type: 'about' as const },
    { name: 'FAQs', type: 'faqs' as const },
    { name: 'Contact', type: 'contact' as const },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveNav(item.name);
    setMobileMenuOpen(false);

    if (item.type === 'contact') {
      onNavigateContact();
    } else if (item.type === 'about') {
      onNavigateAbout();
    } else if (item.type === 'services') {
      onNavigateServices();
    } else if (item.type === 'how-it-works') {
      onNavigateHowItWorks();
    } else if (item.type === 'faqs') {
      onNavigateFaqs();
    } else if (item.type === 'home') {
      if (currentView !== 'home') {
        onNavigateHome();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
          
          {/* Left: Official Logo */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => onNavigateHome()}
              className="flex items-center group text-left cursor-pointer focus:outline-none"
              aria-label="BBD Mobility Home"
            >
              <img
                src="/assets/logo.png"
                alt="BBD Mobility - Courier & Delivery Services Lagos"
                className="h-9 sm:h-11 md:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                width={160}
                height={48}
              />
            </button>
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
          <div className="hidden sm:flex items-center space-x-3 md:space-x-4">
            <a
              href="tel:+2347087531198"
              className="flex items-center space-x-2 text-xs md:text-sm font-semibold text-bbd-navy hover:text-bbd-red transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-red-50">
                <Phone className="w-4 h-4 text-bbd-red" />
              </div>
              <span className="hidden xl:inline">+234 708 753 1198</span>
            </a>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBookNowClick}
              className="inline-flex items-center justify-center px-4 md:px-5 py-2.5 bg-bbd-red hover:bg-bbd-red-hover active:bg-bbd-red-hover text-white text-xs md:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </motion.button>
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={onBookNowClick}
              className="px-3 py-1.5 bg-bbd-red text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-bbd-navy" />
              ) : (
                <Menu className="w-6 h-6 text-bbd-navy" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Sleek Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-gray-100 bg-white/98 backdrop-blur-lg px-4 pt-4 pb-6 shadow-2xl overflow-hidden"
          >
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
                href="tel:+2347087531198"
                className="flex items-center justify-center py-3 px-4 bg-slate-100 hover:bg-slate-200 text-bbd-navy text-xs font-bold rounded-xl transition-colors gap-2"
              >
                <Phone className="w-4 h-4 text-bbd-red" />
                <span>Call Hotline: +234 708 753 1198</span>
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

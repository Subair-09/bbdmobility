import { useState, useEffect } from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BenefitsStrip } from './components/BenefitsStrip';
import { ServicesSection } from './components/ServicesSection';
import { WhyChooseUsSection } from './components/WhyChooseUsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { AllServicesModal } from './components/AllServicesModal';
import { ReviewsModal } from './components/ReviewsModal';
import { InfoModal, ModalType } from './components/InfoModal';

export function App() {
  const [activeNav, setActiveNav] = useState('Home');
  const [selectedService, setSelectedService] = useState('Documents & Files');
  const [allServicesOpen, setAllServicesOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<ModalType | null>(null);
  const [showMobileStickyBar, setShowMobileStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show mobile sticky bar when scrolled past 350px
      setShowMobileStickyBar(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookNowClick = () => {
    const el = document.getElementById('booking-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el.classList.add('ring-2', 'ring-bbd-red');
      setTimeout(() => el.classList.remove('ring-2', 'ring-bbd-red'), 1200);
    }
  };

  const handleSelectService = (serviceName: string) => {
    setSelectedService(serviceName);
    handleBookNowClick();
  };

  return (
    <div className="min-h-screen bg-white text-bbd-text-navy font-sans flex flex-col selection:bg-bbd-red selection:text-white relative">
      {/* 1. Header & Navigation */}
      <Navbar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenModal={(type) => setInfoModalType(type)}
        onBookNowClick={handleBookNowClick}
      />

      <main className="flex-grow">
        {/* 2. Hero Section with Rider Image & Booking Card */}
        <Hero
          onBookClick={handleBookNowClick}
          selectedServiceType={selectedService}
        />

        {/* 3. Horizontal Benefits Strip */}
        <BenefitsStrip />

        {/* 4. Our Services Section */}
        <ServicesSection
          onSelectService={handleSelectService}
          onOpenAllServices={() => setAllServicesOpen(true)}
        />

        {/* 5. Split Section: Highway Rider Image & Why Choose Us */}
        <WhyChooseUsSection />

        {/* 6. Customer Testimonials */}
        <TestimonialsSection
          onOpenReviewsModal={() => setReviewsOpen(true)}
        />
      </main>

      {/* 7. Professional Corporate Footer */}
      <Footer
        onOpenModal={(type) => setInfoModalType(type)}
        onSelectService={handleSelectService}
      />

      {/* Floating Mobile Sticky Action Bar */}
      <AnimatePresence>
        {showMobileStickyBar && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-3 inset-x-3 z-30 md:hidden bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-gray-200/80 flex items-center gap-2"
          >
            <a
              href="tel:+2348123456789"
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-bbd-navy transition-colors flex items-center justify-center flex-shrink-0"
              aria-label="Call Dispatch"
            >
              <Phone className="w-5 h-5 text-bbd-red" />
            </a>

            <button
              onClick={handleBookNowClick}
              className="flex-1 py-3 px-4 bg-bbd-red hover:bg-bbd-red-hover active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <span>Book a Delivery Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AllServicesModal
        isOpen={allServicesOpen}
        onClose={() => setAllServicesOpen(false)}
        onSelectService={handleSelectService}
      />

      <ReviewsModal
        isOpen={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
      />

      <InfoModal
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
        onBookNow={handleBookNowClick}
      />
    </div>
  );
}

export default App;

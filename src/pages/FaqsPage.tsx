import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  HelpCircle,
  Phone,
  MessageSquare,
  ArrowRight,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Headphones,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqsPageProps {
  onBackToHome: () => void;
  onBookNow: () => void;
  onNavigateContact: () => void;
}

interface FaqItem {
  id: string;
  category: 'booking' | 'delivery' | 'pricing' | 'coverage' | 'support';
  question: string;
  answer: string;
}

export const FaqsPage: React.FC<FaqsPageProps> = ({
  onBookNow,
  onNavigateContact,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('b-1');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Frequently Asked Questions | BBD Mobility - Move What Matters';
  }, []);

  const categories = [
    { id: 'all', label: 'All FAQs', icon: HelpCircle },
    { id: 'booking', label: 'Booking & Orders', icon: Package },
    { id: 'delivery', label: 'Delivery & Riders', icon: Truck },
    { id: 'pricing', label: 'Payments & Pricing', icon: CreditCard },
    { id: 'coverage', label: 'Coverage Area', icon: MapPin },
    { id: 'support', label: 'Account & Support', icon: Headphones },
  ];

  const faqItems: FaqItem[] = [
    // Booking & Orders
    {
      id: 'b-1',
      category: 'booking',
      question: 'How do I book a delivery with BBD Mobility?',
      answer:
        'Booking is quick and straightforward! Simply fill out our instant online booking form on the homepage with your pickup and drop-off addresses, package type, and recipient contact details. You will receive immediate on-screen confirmation and an automated email with your booking summary.',
    },
    {
      id: 'b-2',
      category: 'booking',
      question: 'Can I edit or cancel my delivery after booking?',
      answer:
        'Yes, you can modify or cancel your booking as long as a rider has not yet been dispatched. Please contact our support team immediately via phone or WhatsApp at +234 912 345 6789 with your booking reference.',
    },
    {
      id: 'b-3',
      category: 'booking',
      question: 'Can I schedule a delivery for a future date and time?',
      answer:
        'Absolutely. During booking, simply select "Scheduled Delivery" and specify your preferred date and pickup time window. A courier will be assigned in advance to ensure prompt arrival.',
    },
    {
      id: 'b-4',
      category: 'booking',
      question: 'Will I receive a confirmation email after booking?',
      answer:
        'Yes. Every confirmed booking immediately triggers an official BBD Mobility confirmation email containing your order reference, route details, fare summary, and customer care contact.',
    },

    // Delivery & Riders
    {
      id: 'd-1',
      category: 'delivery',
      question: 'How fast will my package be delivered?',
      answer:
        'For same-day deliveries within Lagos, most packages are picked up within 30 to 45 minutes and delivered directly depending on distance and city traffic. Express priority options are available for urgent requests.',
    },
    {
      id: 'd-2',
      category: 'delivery',
      question: 'Who are the delivery riders? Are they verified?',
      answer:
        'All BBD Mobility courier riders are fully background-checked, vetted, professionally trained in safety and package handling, and equipped with official BBD gear and secure delivery boxes.',
    },
    {
      id: 'd-3',
      category: 'delivery',
      question: 'What kinds of items do you deliver?',
      answer:
        'We deliver official documents, business contracts, food & grocery items, e-commerce retail parcels, fashion items, electronics, gifts, and personal errands that fit safely within our courier boxes.',
    },
    {
      id: 'd-4',
      category: 'delivery',
      question: 'What items are prohibited from being delivered?',
      answer:
        'In compliance with state and national regulations, we do not transport illegal substances, firearms, explosives, hazardous chemicals, perishable raw meat without packaging, or live animals.',
    },

    // Payments & Pricing
    {
      id: 'p-1',
      category: 'pricing',
      question: 'How are delivery rates calculated?',
      answer:
        'Delivery rates are calculated based on the distance between the pickup and drop-off addresses, package weight/size, and delivery urgency. We provide transparent upfront quotes before you confirm your order.',
    },
    {
      id: 'p-2',
      category: 'pricing',
      question: 'What payment methods do you accept?',
      answer:
        'We accept secure online debit card payments, direct bank transfers, and pay-on-pickup/delivery upon prior verification.',
    },
    {
      id: 'p-3',
      category: 'pricing',
      question: 'Are there any hidden fees or surge pricing?',
      answer:
        'No. BBD Mobility is committed to 100% price transparency. The price quoted on your booking confirmation is the exact price you pay—no unexpected fuel surcharges or surge markups.',
    },

    // Coverage Area
    {
      id: 'c-1',
      category: 'coverage',
      question: 'Which areas in Lagos does BBD Mobility cover?',
      answer:
        'We provide comprehensive coverage across Lagos State, including Ikeja, Victoria Island, Lekki, Ikoyi, Surulere, Yaba, Maryland, Ajah, Festac, Oshodi, Alausa, and surrounding mainland and island districts.',
    },
    {
      id: 'c-2',
      category: 'coverage',
      question: 'Do you offer interstate deliveries outside Lagos?',
      answer:
        'Yes, we handle express interstate deliveries to major cities including Ibadan, Abeokuta, and Abuja through our logistics partner network. Inquire with our support team for schedules and rates.',
    },
    {
      id: 'c-3',
      category: 'coverage',
      question: 'What are your operating delivery hours?',
      answer:
        'Our couriers operate Monday through Saturday from 7:00 AM to 8:00 PM, and Sundays from 9:00 AM to 6:00 PM. Special after-hours scheduled runs can be arranged with advance booking.',
    },

    // Account & Support
    {
      id: 's-1',
      category: 'support',
      question: 'What should I do if my package is delayed?',
      answer:
        'While our on-time delivery rate is above 98%, unexpected road conditions or weather can occasionally cause delays. If this occurs, our dispatch team will contact both sender and recipient with real-time updates.',
    },
    {
      id: 's-2',
      category: 'support',
      question: 'How can I speak directly with customer care?',
      answer:
        'You can call our dedicated support hotline at +234 912 345 6789, email info@bbdmobility.com, or use our Contact Us page. Our representatives are available 24/7 to help.',
    },
  ];

  // Filtered FAQs based on category & search query
  const filteredFaqs = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white text-bbd-navy font-sans">
      
      {/* =========================================================================
          SECTION 1: HERO BANNER (Navy Left, Representative Right with Red Skew Slash)
         ========================================================================= */}
      <section className="relative overflow-hidden bg-[#092957] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px] sm:min-h-[360px] items-stretch">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 py-10 sm:py-14 flex flex-col justify-center text-left space-y-4 pr-0 lg:pr-8 z-10"
            >
              <div className="flex items-center space-x-2">
                <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase">
                  HELP & SUPPORT
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tight leading-[1.1]">
                Frequently Asked <br />
                <span className="text-[#E30620]">Questions.</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                Find clear answers to common questions about our booking process, delivery rates, rider services, and coverage areas across Lagos and beyond.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => onBookNow()}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#E30620] hover:bg-[#b8051a] text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-red-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  Book a Delivery
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <button
                  onClick={onNavigateContact}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wide backdrop-blur-sm transition-all border border-white/20 cursor-pointer"
                >
                  Contact Support
                </button>
              </div>
            </motion.div>

            {/* Right Visual (Female CSR in uniform looking at phone) */}
            <div className="lg:col-span-5 relative flex items-center justify-end overflow-hidden -mx-4 sm:-mx-6 lg:mx-0">
              <div className="hidden lg:block absolute left-0 inset-y-0 w-16 bg-gradient-to-r from-[#092957] via-[#092957]/80 to-transparent z-10 pointer-events-none" />
              <div className="hidden lg:block absolute left-6 inset-y-0 w-3 bg-[#E30620] transform -skew-x-12 z-10" />

              <img
                src="/assets/faq-hero-support.jpg"
                alt="BBD Mobility Customer Service Representative"
                className="w-full h-full min-h-[240px] sm:min-h-[300px] lg:min-h-[360px] object-cover object-center"
              />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: MAIN FAQS SECTION (Sidebar + Interactive Accordion)
         ========================================================================= */}
      <section className="py-14 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ---------------- LEFT SIDEBAR (Category filter + Need Help card) ---------------- */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Category Filter Box */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 px-2">
                  Quick Links
                </h3>
                <nav className="space-y-1">
                  {categories.map((cat) => {
                    const CatIcon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    const count =
                      cat.id === 'all'
                        ? faqItems.length
                        : faqItems.filter((i) => i.category === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#E30620] text-white shadow-sm'
                            : 'text-gray-700 hover:bg-slate-100 hover:text-[#092957]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <CatIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#E30620]'}`} />
                          <span>{cat.label}</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-gray-500'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Need Help? Box (Matching Mockup) */}
              <div className="bg-[#092957] text-white rounded-xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-[#E30620]/20 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E30620] flex items-center justify-center">
                    <Headphones className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-sm font-bold tracking-tight">Need Help?</h4>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed mt-2 mb-4">
                  Can't find what you are looking for? Our friendly customer support team is always ready to assist you.
                </p>

                <button
                  onClick={onNavigateContact}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#E30620] hover:bg-[#b8051a] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="ml-2 w-3.5 h-3.5" />
                </button>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1 text-[#E30620]" />
                    +234 912 345 6789
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-3.5 h-3.5 mr-1 text-[#E30620]" />
                    WhatsApp Available
                  </span>
                </div>
              </div>

            </div>

            {/* ---------------- RIGHT CONTENT (Search + Accordions) ---------------- */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions or keywords... (e.g., booking, price, tracking, prohibited)"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E30620] focus:border-transparent shadow-sm transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Active Filter Pill & Count */}
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>
                  Showing <strong className="text-[#092957]">{filteredFaqs.length}</strong> questions
                  {selectedCategory !== 'all' && (
                    <> in <strong className="text-[#E30620]">{categories.find((c) => c.id === selectedCategory)?.label}</strong></>
                  )}
                  {searchQuery && (
                    <> matching "<strong className="text-[#092957]">{searchQuery}</strong>"</>
                  )}
                </span>
                {(selectedCategory !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="text-[#E30620] hover:underline font-semibold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Accordion List */}
              {filteredFaqs.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center border border-gray-200">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-[#092957]">No matching questions found</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Try different keywords or contact our 24/7 support team directly for immediate assistance.
                  </p>
                  <button
                    onClick={onNavigateContact}
                    className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-[#E30620] text-white text-xs font-bold"
                  >
                    Ask Support Directly
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq) => {
                    const isOpen = expandedId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                          isOpen
                            ? 'border-red-200 shadow-md ring-1 ring-red-100'
                            : 'border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                      >
                        <button
                          onClick={() => toggleAccordion(faq.id)}
                          className="w-full px-5 py-4 text-left flex items-center justify-between space-x-4 cursor-pointer focus:outline-none"
                        >
                          <span className={`text-xs sm:text-sm font-bold transition-colors ${
                            isOpen ? 'text-[#E30620]' : 'text-[#092957]'
                          }`}>
                            {faq.question}
                          </span>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                            isOpen ? 'bg-red-50 text-[#E30620] rotate-180' : 'bg-slate-100 text-gray-500'
                          }`}>
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                            >
                              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: STILL HAVE QUESTIONS? CTA STRIP (Matching Mockup with Diagonal Stripes)
         ========================================================================= */}
      <section className="py-14 bg-[#092957] text-white relative overflow-hidden border-t border-white/10">
        {/* Subtle diagonal brand pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#E30620]/20 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold italic tracking-tight">
              Still Have <span className="text-[#E30620]">Questions?</span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
              We're here to help! Reach out directly to our friendly support team and get a prompt response within minutes.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={onNavigateContact}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-[#E30620] hover:bg-[#b8051a] text-white font-bold text-xs uppercase tracking-wider shadow-xl hover:shadow-red-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Contact Us
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
              <button
                onClick={() => onBookNow()}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wide backdrop-blur-sm transition-all border border-white/20 cursor-pointer"
              >
                Book a Delivery
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

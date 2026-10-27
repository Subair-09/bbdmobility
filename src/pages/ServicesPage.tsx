import React, { useEffect } from 'react';
import {
  FileText,
  ShoppingCart,
  Package,
  User,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Coins,
  MapPin,
  Headphones,
  Truck,
  UserCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';

interface ServicesPageProps {
  onBackToHome: () => void;
  onBookNow: (serviceName?: string) => void;
  onOpenModal: (type: 'contact' | 'faqs' | 'how-it-works') => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onBookNow,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const servicesSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://bbdmobility.com.ng/'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Services',
            'item': 'https://bbdmobility.com.ng/services'
          }
        ]
      },
      {
        '@type': 'ItemList',
        '@id': 'https://bbdmobility.com.ng/services#catalog',
        'name': 'BBD Mobility Delivery Services in Lagos',
        'itemListElement': [
          {
            '@type': 'Service',
            'position': 1,
            'name': 'Documents & Files Delivery',
            'description': 'Safe, confidential delivery of contracts, documents, legal papers, and forms across Lagos.',
            'provider': {
              '@type': 'Organization',
              'name': 'BBD Mobility',
              'url': 'https://bbdmobility.com.ng'
            },
            'areaServed': 'Lagos, Nigeria'
          },
          {
            '@type': 'Service',
            'position': 2,
            'name': 'Food & Groceries Delivery',
            'description': 'Quick, clean transportation of cooked food, groceries, and perishables across Lagos.',
            'provider': {
              '@type': 'Organization',
              'name': 'BBD Mobility',
              'url': 'https://bbdmobility.com.ng'
            },
            'areaServed': 'Lagos, Nigeria'
          },
          {
            '@type': 'Service',
            'position': 3,
            'name': 'E-commerce Packages Delivery',
            'description': 'Reliable last-mile delivery service for online shops, social vendors, and retail customers.',
            'provider': {
              '@type': 'Organization',
              'name': 'BBD Mobility',
              'url': 'https://bbdmobility.com.ng'
            },
            'areaServed': 'Lagos, Nigeria'
          },
          {
            '@type': 'Service',
            'position': 4,
            'name': 'Personal Items Delivery',
            'description': 'Discreet, safe errand courier service for gifts, personal essentials, and urgent handovers.',
            'provider': {
              '@type': 'Organization',
              'name': 'BBD Mobility',
              'url': 'https://bbdmobility.com.ng'
            },
            'areaServed': 'Lagos, Nigeria'
          },
          {
            '@type': 'Service',
            'position': 5,
            'name': 'Same-Day & Scheduled Delivery',
            'description': 'Flexible courier scheduling for urgent same-day dispatches or planned future delivery slots.',
            'provider': {
              '@type': 'Organization',
              'name': 'BBD Mobility',
              'url': 'https://bbdmobility.com.ng'
            },
            'areaServed': 'Lagos, Nigeria'
          }
        ]
      }
    ]
  };

  const services = [
    {
      id: 'docs',
      name: 'Documents & Files',
      desc: 'Contracts, papers, forms and more.',
      image: '/assets/service-card-docs.jpg',
      icon: FileText,
      serviceKey: 'Documents & Files',
    },
    {
      id: 'food',
      name: 'Food & Groceries',
      desc: 'Fresh food, groceries and essentials.',
      image: '/assets/service-card-food.jpg',
      icon: ShoppingCart,
      serviceKey: 'Food & Groceries',
    },
    {
      id: 'ecom',
      name: 'E-commerce Packages',
      desc: 'Online orders and retail items.',
      image: '/assets/service-card-ecom.jpg',
      icon: Package,
      serviceKey: 'E-commerce Packages',
    },
    {
      id: 'personal',
      name: 'Personal Items',
      desc: 'Gifts, valuables and more.',
      image: '/assets/service-card-personal.jpg',
      icon: User,
      serviceKey: 'Personal Items',
    },
    {
      id: 'scheduled',
      name: 'Same-Day & Scheduled',
      desc: 'Book now or schedule for later.',
      image: '/assets/service-card-scheduled.jpg',
      icon: Calendar,
      serviceKey: 'Same-Day & Scheduled',
    },
  ];

  return (
    <div className="bg-white text-bbd-navy font-sans">
      <SEO
        title="Courier & Package Delivery Services in Lagos | BBD Mobility"
        description="Explore BBD Mobility delivery services in Lagos: documents & files, food & groceries, e-commerce packages, personal items, and same-day delivery. Book online today."
        canonicalPath="/services"
        keywords="delivery services Lagos, courier services Lagos, parcel delivery Ikeja Lagos, same day courier Lagos, e-commerce dispatch Lagos"
        schema={servicesSchema}
        image="/assets/service-hero-rider.jpg"
      />
      
      {/* =========================================================================
          SECTION 1: HERO BANNER (Exact Mockup Match)
          - Navy Left (#092957) with Red & White angled accent
          - Rider on highway seen from rear with BBD box on Right
         ========================================================================= */}
      <section className="relative overflow-hidden bg-[#092957] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] items-stretch">
            
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 py-12 sm:py-16 flex flex-col justify-center text-left space-y-4 pr-0 lg:pr-8 z-10"
            >
              {/* Category Pill Tag */}
              <div className="flex items-center space-x-2">
                <span className="w-6 h-[2px] bg-[#E30620] inline-block" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-100 uppercase">
                  OUR SERVICES
                </span>
              </div>

              {/* Exact Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tight leading-[1.08] text-white">
                Fast. Safe. Reliable. <br />
                <span className="text-[#E30620]">Delivery Services</span> <br />
                for You.
              </h1>

              {/* Exact Subtitle */}
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-md pt-1">
                From important documents to daily essentials, BBD Mobility delivers with speed, safety and care. Choose the service that fits your needs.
              </p>
            </motion.div>

            {/* Right Visual Column (Courier Rider from behind with BBD Box + Red Skew Angle) */}
            <div className="lg:col-span-5 relative flex items-center justify-end overflow-hidden -mx-4 sm:-mx-6 lg:mx-0">
              {/* Diagonal transition effect matching mockup */}
              <div className="hidden lg:block absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-[#092957] via-[#092957]/80 to-transparent z-10 pointer-events-none" />
              <div className="hidden lg:block absolute left-8 inset-y-0 w-4 bg-[#E30620] transform -skew-x-12 z-10 shadow-lg" />
              <div className="hidden lg:block absolute bottom-0 left-0 w-24 h-16 bg-[#E30620] transform -skew-x-12 z-10" />

              <img
                src="/assets/service-hero-rider.jpg"
                alt="BBD Mobility courier rider on highway in Lagos"
                className="w-full h-full min-h-[260px] sm:min-h-[320px] lg:min-h-[420px] object-cover object-center"
              />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: WHAT WE DELIVER (Exact Mockup Match: 5 Cards in a Row)
         ========================================================================= */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-left mb-8 sm:mb-10">
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="w-5 h-[2px] bg-[#E30620] inline-block" />
              <span className="text-[11px] font-bold tracking-widest text-[#E30620] uppercase">
                OUR SERVICES
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black italic text-[#092957] tracking-tight">
              What We <span className="text-[#E30620]">Deliver</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Reliable delivery solutions for individuals and businesses.
            </p>
          </div>

          {/* 5-Column Responsive Cards Grid matching mockup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {services.map((item, index) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    {/* Top Photographic Crop from Mockup */}
                    <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.image}
                        alt={`BBD Mobility ${item.name} delivery service in Lagos`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    {/* Floating Circular Icon Badge Overlapping Card Photo */}
                    <div className="-mt-5 ml-4 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#092957] group-hover:bg-[#E30620] group-hover:text-white transition-colors duration-300">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 pt-2.5 text-left">
                      <h3 className="text-xs sm:text-sm font-bold text-[#092957] group-hover:text-[#E30620] transition-colors leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Circular Red Arrow Button at bottom */}
                  <div className="p-4 pt-0 text-left">
                    <button
                      onClick={() => onBookNow(item.serviceKey)}
                      aria-label={`Book ${item.name}`}
                      className="w-7 h-7 rounded-full bg-[#E30620] hover:bg-[#b8051a] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-xs cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: SPLIT SECTION (Exact Mockup Match)
          - Left: Courier Rider Photo with Slanted Navy Box ("Real People. Real Deliveries.")
          - Right: "Why Choose BBD Mobility?" + 4 Feature Rows
         ========================================================================= */}
      <section className="py-10 sm:py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Composite Rider Photo + Slanted Navy Overlay */}
            <div className="lg:col-span-6 relative overflow-hidden rounded-2xl shadow-xl bg-[#092957] min-h-[300px] sm:min-h-[360px] flex items-stretch">
              {/* Background Rider Photo */}
              <div className="w-1/2 relative overflow-hidden">
                <img
                  src="/assets/service-split-rider.jpg"
                  alt="Real BBD Mobility dispatch courier rider in Lagos"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>

              {/* Slanted Navy Panel with Text Overlay */}
              <div className="w-1/2 bg-[#092957] text-white p-6 sm:p-8 flex flex-col justify-center text-left relative">
                {/* Diagonal angle slice into photo */}
                <div className="absolute -left-6 inset-y-0 w-12 bg-[#092957] transform -skew-x-12 pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-[2px] bg-[#E30620] inline-block" />
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-200 uppercase">
                      WHY CHOOSE US
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black italic tracking-tight leading-tight">
                    Real People. <br />
                    <span className="text-[#E30620]">Real Deliveries.</span>
                  </h3>

                  <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed pt-1">
                    BBD Mobility is built on trust, speed and a commitment to getting your packages where they need to be.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: "Why Choose BBD Mobility?" + 4 Feature Rows */}
            <div className="lg:col-span-6 text-left space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black italic text-[#092957] tracking-tight">
                  Why Choose <span className="text-[#E30620]">BBD Mobility?</span>
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: 'Professional & Verified Riders',
                    desc: 'Trained, background-checked and ready.',
                    icon: UserCheck,
                  },
                  {
                    title: 'Secure Packaging',
                    desc: 'Your items are handled with care.',
                    icon: ShieldCheck,
                  },
                  {
                    title: 'Affordable Rates',
                    desc: 'Great service, fair prices.',
                    icon: Coins,
                  },
                  {
                    title: 'Wide Coverage',
                    desc: 'Across the city and beyond.',
                    icon: MapPin,
                  },
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={idx} className="flex items-center space-x-4">
                      {/* Pink/Red Circular Icon Badge matching mockup */}
                      <div className="w-11 h-11 rounded-full bg-red-50 text-[#E30620] flex items-center justify-center flex-shrink-0">
                        <ItemIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#092957]">
                          {item.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: NEED A DELIVERY? CTA STRIP (Exact Mockup Match)
          - Left: White box with 3D package icon + "Need a Delivery?" + Red pill button
          - Center: Red & White diagonal transition slash
          - Right: Navy background (#092957) with 4 Guarantees in a row
         ========================================================================= */}
      <section className="bg-white border-t border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Left Portion (White background with 3D package + Copy + Red Pill Button) */}
            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex items-center text-left">
              <div className="flex items-start sm:items-center space-x-4">
                {/* 3D Package Box Icon with motion lines */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#092957] flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-[#092957]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-black text-[#092957] tracking-tight">
                    Need a Delivery?
                  </h3>
                  <p className="text-xs text-gray-600">
                    Book now and experience fast, safe and reliable delivery services.
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={() => onBookNow()}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#E30620] hover:bg-[#b8051a] text-white font-bold text-xs shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span>Book a Delivery</span>
                      <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Portion (Deep Navy background with 4 Guarantees) */}
            <div className="lg:col-span-6 bg-[#092957] text-white p-6 sm:p-8 lg:p-10 relative flex items-center">
              {/* Red Diagonal Slash Divider at boundary */}
              <div className="hidden lg:block absolute -left-6 inset-y-0 w-8 bg-[#E30620] transform -skew-x-12 z-10 shadow-md" />
              <div className="hidden lg:block absolute -left-12 inset-y-0 w-8 bg-white transform -skew-x-12 z-0" />

              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 text-center relative z-10">
                {[
                  { label: 'Fast Delivery', icon: Truck },
                  { label: 'Safe & Secure', icon: ShieldCheck },
                  { label: 'Wide Coverage', icon: MapPin },
                  { label: '24/7 Support', icon: Headphones },
                ].map((g, gIdx) => {
                  const GIcon = g.icon;
                  return (
                    <div key={gIdx} className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white mb-2">
                        <GIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-100 leading-tight">
                        {g.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

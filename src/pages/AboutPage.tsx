import React, { useEffect } from 'react';
import {
  Zap,
  Shield,
  MapPin,
  Users,
  Target,
  Eye,
  Award,
  Package,
  ShieldCheck,
  Coins,
  Headphones,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AboutPageProps {
  onBackToHome: () => void;
  onBookNow: () => void;
  onOpenModal: (type: 'contact' | 'faqs') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onBookNow,
  onOpenModal,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'About Us | BBD Mobility - Move What Matters';
  }, []);

  return (
    <div className="bg-white text-bbd-navy font-sans">
      
      {/* =========================================================================
          SECTION 1: HERO BANNER (Exact Match: Navy Left, Rider Right with Diagonal Cut)
         ========================================================================= */}
      <section className="relative overflow-hidden bg-[#092957] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[280px] sm:min-h-[340px] items-stretch">
            
            {/* Left Content (Navy Gradient with Headline) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 py-10 sm:py-14 flex flex-col justify-center text-left space-y-4 pr-0 lg:pr-8 z-10"
            >
              <div className="flex items-center space-x-2">
                <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase">
                  ABOUT US
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tight leading-[1.1]">
                More Than Just <br />
                <span className="text-[#E30620]">Deliveries.</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                BBD Mobility is a fast, safe and reliable delivery service provider, connecting people, businesses and communities across the city and beyond. We move what matters — your packages, your documents and your trust.
              </p>
            </motion.div>

            {/* Right Visual (Courier Rider on Expressway with Red Diagonal Slash) */}
            <div className="lg:col-span-6 relative flex items-center justify-end overflow-hidden -mx-4 sm:-mx-6 lg:mx-0">
              {/* Red Diagonal Accent Slice */}
              <div className="hidden lg:block absolute left-0 inset-y-0 w-16 bg-gradient-to-r from-[#092957] via-[#092957]/80 to-transparent z-10 pointer-events-none" />
              <div className="hidden lg:block absolute left-8 inset-y-0 w-3 bg-[#E30620] transform -skew-x-12 z-10" />

              <img
                src="/assets/highway-rider-sharp.jpg"
                alt="BBD Mobility Courier Rider"
                className="w-full h-full min-h-[220px] sm:min-h-[280px] lg:min-h-[340px] object-cover object-center"
              />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: WHO WE ARE (Exact Match: Text + 4 Icons on Left, Team on Right)
         ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            
            {/* Left Column: Text & 4 Features */}
            <div className="lg:col-span-6 space-y-5 text-left">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#092957] uppercase">
                  WHO WE ARE
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#092957] tracking-tight">
                We're BBD Mobility <br />
                and <span className="text-[#E30620]">We Deliver</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                BBD Mobility is a dedicated delivery service provider focused on speed, safety and customer satisfaction. We understand how important your packages are, which is why we go the extra mile to ensure they reach their destination on time and in perfect condition.
              </p>

              {/* 4 Feature Badges in a Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
                <div className="flex flex-col items-center text-center space-y-2 p-2">
                  <div className="w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center text-[#092957] bg-slate-50">
                    <Zap className="w-5 h-5 text-[#092957]" />
                  </div>
                  <span className="text-xs font-bold text-[#092957]">Fast<br />Delivery</span>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 p-2">
                  <div className="w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center text-[#092957] bg-slate-50">
                    <Shield className="w-5 h-5 text-[#092957]" />
                  </div>
                  <span className="text-xs font-bold text-[#092957]">Safe &amp;<br />Secure</span>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 p-2">
                  <div className="w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center text-[#092957] bg-slate-50">
                    <MapPin className="w-5 h-5 text-[#092957]" />
                  </div>
                  <span className="text-xs font-bold text-[#092957]">Wide<br />Coverage</span>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 p-2">
                  <div className="w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center text-[#092957] bg-slate-50">
                    <Users className="w-5 h-5 text-[#092957]" />
                  </div>
                  <span className="text-xs font-bold text-[#092957]">Customer<br />Focused</span>
                </div>
              </div>
            </div>

            {/* Right Column: Ultra-Sharp HD Couriers in Uniform Photo */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-slate-100">
                <img
                  src="/assets/courier-delivery-hd.jpg"
                  alt="BBD Mobility Couriers Team"
                  className="w-full h-[260px] sm:h-[340px] lg:h-[360px] object-cover object-center"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: OUR STORY & JOURNEY & MISSION/VISION/VALUES (Exact Match)
         ========================================================================= */}
      <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Column 1: Ultra-Sharp HD Courier on Motorcycle Photo */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-slate-100 h-full">
                <img
                  src="/assets/courier-rider-hd.jpg"
                  alt="BBD Mobility Courier Rider"
                  className="w-full h-[240px] sm:h-[300px] lg:h-[340px] object-cover object-center"
                />
              </div>
            </div>

            {/* Column 2: Our Story / Our Journey */}
            <div className="lg:col-span-4 space-y-3.5 text-left">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#092957] uppercase">
                  OUR STORY
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#092957] tracking-tight">
                Our Journey
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                BBD Mobility started with a simple idea — to make delivery easier, faster and more reliable for everyone. What began as a small local service has grown into a trusted delivery partner for individuals, businesses and communities across the city.
              </p>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Today, we continue to grow, powered by our commitment to excellence, technology and a team of dedicated riders.
              </p>
            </div>

            {/* Column 3: Mission, Vision, Values */}
            <div className="lg:col-span-4 space-y-4 text-left">
              
              {/* Mission */}
              <div className="flex items-start space-x-3.5 p-1">
                <div className="w-10 h-10 rounded-full bg-[#E30620] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#092957]">Our Mission</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    To provide fast, safe and reliable delivery solutions that make life easier for individuals and businesses.
                  </p>
                </div>
              </div>

              {/* Vision */}
              <div className="flex items-start space-x-3.5 p-1">
                <div className="w-10 h-10 rounded-full bg-[#E30620] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#092957]">Our Vision</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    To be the most trusted and preferred delivery service provider in Nigeria and beyond.
                  </p>
                </div>
              </div>

              {/* Values */}
              <div className="flex items-start space-x-3.5 p-1">
                <div className="w-10 h-10 rounded-full bg-[#E30620] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#092957]">Our Values</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Integrity, Reliability, Customer Focus, Innovation and Excellence in everything we do.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: STATISTICS STRIP (Exact Match: Deep Navy, 4 Red Icons & Numbers)
         ========================================================================= */}
      <section className="bg-[#092957] text-white py-10 sm:py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            
            {/* Stat 1 */}
            <div className="flex flex-col items-center space-y-2">
              <Package className="w-6 h-6 text-[#E30620]" />
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">10,000+</div>
              <div className="text-xs text-slate-300 font-medium">Deliveries Completed</div>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center space-y-2">
              <Users className="w-6 h-6 text-[#E30620]" />
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">5,000+</div>
              <div className="text-xs text-slate-300 font-medium">Happy Customers</div>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center space-y-2">
              <MapPin className="w-6 h-6 text-[#E30620]" />
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">Lagos &amp; Beyond</div>
              <div className="text-xs text-slate-300 font-medium">Coverage</div>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#E30620]" />
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">100%</div>
              <div className="text-xs text-slate-300 font-medium">Commitment to Safety</div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: THE BBD MOBILITY DIFFERENCE (Exact Match: Text Left, Cards Right)
         ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            
            {/* Left Column: Difference Text & Book Button */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#092957] uppercase">
                  WHY CHOOSE US
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#092957] tracking-tight">
                The BBD Mobility <br />
                <span className="text-[#E30620]">Difference</span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We go beyond just delivering packages. We deliver peace of mind. Our combination of professional riders, secure handling and affordable rates makes us the preferred choice for all your delivery needs.
              </p>

              <div className="pt-2">
                <button
                  onClick={onBookNow}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#E30620] hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <span>Book a Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: 4 Cards (3 in row/grid + 1 wide) */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                
                {/* Card 1: Verified Riders */}
                <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white hover:border-slate-200 transition-all text-left space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#092957]">
                    <ShieldCheck className="w-4 h-4 text-[#092957]" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#092957]">Verified Riders</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Trained, background-checked and ready.
                  </p>
                </div>

                {/* Card 2: Secure Handling */}
                <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white hover:border-slate-200 transition-all text-left space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#092957]">
                    <Package className="w-4 h-4 text-[#092957]" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#092957]">Secure Handling</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Your items are safe with us.
                  </p>
                </div>

                {/* Card 3: Affordable Rates */}
                <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white hover:border-slate-200 transition-all text-left space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#092957]">
                    <Coins className="w-4 h-4 text-[#092957]" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#092957]">Affordable Rates</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Great service, fair prices.
                  </p>
                </div>

                {/* Card 4 (Wide): Wide Coverage */}
                <div className="sm:col-span-3 p-4 rounded-xl border border-gray-100 shadow-sm bg-white hover:border-slate-200 transition-all text-left flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#092957] flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#092957]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#092957]">Wide Coverage</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Across the city and beyond.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: NEED HELP STRIP (Exact Match: Navy with Red/White Diagonal Stripes)
         ========================================================================= */}
      <section className="bg-[#092957] text-white py-5 relative overflow-hidden">
        {/* Left Corner Brand Diagonal Stripes */}
        <div className="absolute left-0 inset-y-0 flex space-x-1.5 transform -skew-x-12 -ml-6 pointer-events-none">
          <div className="w-2.5 h-full bg-[#E30620]" />
          <div className="w-2.5 h-full bg-white" />
          <div className="w-2.5 h-full bg-[#E30620]" />
        </div>

        {/* Right Corner Brand Diagonal Stripes */}
        <div className="absolute right-0 inset-y-0 flex space-x-1.5 transform -skew-x-12 -mr-6 pointer-events-none">
          <div className="w-2.5 h-full bg-white" />
          <div className="w-2.5 h-full bg-[#E30620]" />
          <div className="w-2.5 h-full bg-white" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center flex-shrink-0 text-white">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                Need Help or Have Questions?
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Our team is ready to assist you. Call us at{' '}
                <a href="tel:+2348123456789" className="text-white font-semibold underline decoration-slate-400">
                  +234 812 345 6789
                </a>{' '}
                or send us an email at{' '}
                <a href="mailto:info@bbdautosng.com" className="text-white font-semibold underline decoration-slate-400">
                  info@bbdautosng.com
                </a>.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenModal('contact')}
            className="px-5 py-2 rounded-full border border-white/60 hover:border-white hover:bg-white hover:text-[#092957] text-white text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Contact Us</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>
      </section>

    </div>
  );
};

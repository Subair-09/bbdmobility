import React, { useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  PackageCheck,
  Headphones,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Bike,
  Sparkles,
  MapPin,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AboutPageProps {
  onBackToHome: () => void;
  onBookNow: () => void;
  onOpenModal: (type: 'contact' | 'faqs') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onBackToHome,
  onBookNow,
  onOpenModal,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'About Us | BBD Mobility - Move What Matters';
  }, []);

  const stats = [
    { label: 'Successful Deliveries', value: '50,000+', desc: 'Across Lagos Mainland & Island' },
    { label: 'On-Time Rate', value: '99.4%', desc: 'Swift & predictable dispatch' },
    { label: 'Verified Courier Fleet', value: '100%', desc: 'Background-screened riders' },
    { label: 'Active Business Clients', value: '1,200+', desc: 'Trusting us daily' },
  ];

  const corePillars = [
    {
      icon: <Clock className="w-6 h-6 text-bbd-red" />,
      title: 'Precision & Speed',
      description:
        'In a bustling metropolis like Lagos, time is everything. Our sector-based rider distribution ensures minimal wait times and expedited deliveries.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-bbd-red" />,
      title: 'Vetted Courier Network',
      description:
        'Every BBD Mobility rider undergoes strict identity validation, background profiling, and continuous defensive road training.',
    },
    {
      icon: <PackageCheck className="w-6 h-6 text-bbd-red" />,
      title: 'Weatherproof Handling',
      description:
        'Our custom reinforced, thermal insulated delivery boxes protect delicate documents, food items, fragile gifts, and electronics from weather and transit impacts.',
    },
    {
      icon: <Headphones className="w-6 h-6 text-bbd-red" />,
      title: 'Human-Centered Support',
      description:
        'No endless automated bots. Real human dispatch coordinators oversee each request, following up to confirm smooth pickup and delivery handovers.',
    },
  ];

  const milestones = [
    {
      year: 'Enterprise Foundation',
      title: 'Rooted in Automotive & Logistics Discipline',
      text: 'BBD Mobility was created to address the critical gap in Lagos urban delivery: combining corporate reliability, verified rider safety, and customer-first accountability.',
    },
    {
      year: 'Fleet Expansion',
      title: 'City-Wide Sector Coverage',
      text: 'From Ikeja, Yaba, and Surulere on the Mainland to Victoria Island, Ikoyi, Lekki, and Ajah on the Island, our couriers cover all commercial hubs.',
    },
    {
      year: 'Zero-Friction Technology',
      title: 'Streamlined Direct Dispatch',
      text: 'A clean booking process requiring no cumbersome app downloads or forced password setups. Fast direct booking with instant confirmation to customer and dispatch.',
    },
  ];

  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-bbd-navy to-slate-900 text-white py-16 sm:py-24 lg:py-28">
        {/* Background Decorative Pattern & Ambient Glow */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-bbd-red rounded-full filter blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full filter blur-[100px]" />
        </div>

        {/* Diagonal Brand Accent Stripes (Top Right) */}
        <div className="absolute top-0 right-0 flex space-x-2 transform -skew-x-12 opacity-80 pointer-events-none pr-4 pt-2">
          <div className="w-3 h-24 bg-white/20" />
          <div className="w-3 h-24 bg-bbd-red" />
          <div className="w-3 h-24 bg-white/20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb / Back Navigation */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-5 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-bbd-red tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Move What Matters &bull; Lagos, Nigeria</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Empowering Lagos with <span className="text-bbd-red">Fast, Reliable</span> &amp; Safe Logistics
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                BBD Mobility is a premier logistics service built specifically for the dynamism of Lagos. We bridge businesses, individuals, and families through verified motorcycle courier couriers equipped with weatherproof thermal boxes.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onBookNow}
                  className="px-6 py-3 bg-bbd-red hover:bg-bbd-red-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg hover:shadow-red-500/25 transition-all flex items-center gap-2"
                >
                  <span>Book a Delivery Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="tel:+2348123456789"
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-bbd-red" />
                  <span>Call Dispatch Desk</span>
                </a>
              </div>
            </motion.div>

            {/* Rider Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-slate-800">
                <img
                  src="/assets/highway-rider-sharp.jpg"
                  alt="BBD Mobility Courier Rider in Lagos"
                  className="w-full h-[320px] sm:h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                
                <div className="absolute bottom-0 inset-x-0 p-5 text-left">
                  <div className="flex items-center gap-2 text-bbd-red text-xs font-bold uppercase tracking-wider mb-1">
                    <Bike className="w-4 h-4" />
                    <span>Lagos Verified Fleet</span>
                  </div>
                  <h3 className="text-white text-base sm:text-lg font-bold">
                    Professional Couriers on Every Expressway &amp; Street
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Defensive driving trained, GPS-guided, and equipped for all weather conditions.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Bar */}
      <section className="bg-slate-50 border-b border-gray-100 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="text-2xl sm:text-4xl font-black text-bbd-navy tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-bbd-red mt-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {stat.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Who We Are / Company Story */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-5 text-left">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-[2.5px] bg-bbd-red rounded-full" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-bbd-navy uppercase">
                  OUR STORY &amp; HERITAGE
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-bbd-navy tracking-tight">
                Built for Lagos. Engineered for Trust.
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed">
                Logistics in Lagos presents distinct challenges: unpredictable traffic bottlenecks, intense seasonal rains, and the paramount necessity of package safety. BBD Mobility was established with a clear mandate to solve these challenges through systematic discipline.
              </p>

              <p className="text-slate-600 text-sm leading-relaxed">
                We believe that sending a package—whether an urgent confidential contract, e-commerce order, pharmaceutical item, or family gift—should be frictionless and entirely transparent. You don’t need to download bulky applications or create accounts; our dispatch desk receives your booking and immediately activates the closest courier.
              </p>

              <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Licensed &amp; Registered Operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Dual Notification (Admin + Customer)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Strict Confidentiality Guarantees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Dedicated Lagos Dispatch Hotline</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-bbd-navy text-white flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-bbd-navy text-base">Corporate Backing &amp; High Standards</h3>
                    <p className="text-xs text-slate-500">Corporate excellence you can rely on</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Leveraging established enterprise workflows, BBD Mobility maintains continuous vehicle servicing, standard operating protocols, and verified accountability from point of pickup to destination.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-red-50/60 border border-red-100 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-bbd-red text-white flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-bbd-navy text-base">Extensive Lagos Route Mastery</h3>
                    <p className="text-xs text-slate-500">Island, Mainland, Suburbs &amp; Corridors</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Our riders know every shortcut, bypass, and road network across Lagos State to beat gridlock and deliver right on schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Pillars of Excellence */}
      <section className="py-16 sm:py-20 bg-bbd-grey/60 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="w-6 h-[2.5px] bg-bbd-red rounded-full" />
              <span className="text-[11px] sm:text-xs font-bold tracking-widest text-bbd-navy uppercase">
                WHY BUSINESSES TRUST US
              </span>
              <span className="w-6 h-[2.5px] bg-bbd-red rounded-full" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-bbd-navy tracking-tight">
              The Four Pillars of BBD Mobility
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Every package is handled with precision, care, and guaranteed accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {corePillars.map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  {pillar.icon}
                </div>
                <h3 className="text-base font-bold text-bbd-navy">{pillar.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Company Milestones / Journey */}
      <section className="py-16 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="w-6 h-[2.5px] bg-bbd-red rounded-full" />
              <span className="text-[11px] sm:text-xs font-bold tracking-widest text-bbd-navy uppercase">
                HOW WE OPERATE
              </span>
              <span className="w-6 h-[2.5px] bg-bbd-red rounded-full" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-bbd-navy tracking-tight">
              Our Journey &amp; Operational Standards
            </h2>
          </div>

          <div className="space-y-6">
            {milestones.map((m, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row items-start gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 text-left"
              >
                <div className="px-3.5 py-1.5 rounded-lg bg-bbd-navy text-white text-xs font-bold flex-shrink-0">
                  {m.year}
                </div>
                <div>
                  <h3 className="text-base font-bold text-bbd-navy">{m.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {m.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Call To Action Footer Banner */}
      <section className="py-12 sm:py-16 bg-bbd-navy text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-bbd-red tracking-wider uppercase">
            <span>GET STARTED TODAY</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Ready to Move Your Packages Swiftly &amp; Safely?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Experience the difference of a verified, punctual Lagos delivery service. Book your dispatch in less than 60 seconds.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
            <button
              onClick={onBookNow}
              className="px-7 py-3.5 bg-bbd-red hover:bg-bbd-red-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>Book a Delivery Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenModal('faqs')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-bbd-red" />
              <span>Read Delivery FAQs</span>
            </button>

            <button
              onClick={onBackToHome}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore Homepage</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

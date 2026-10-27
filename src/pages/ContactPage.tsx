import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Headphones,
  Send,
  HelpCircle,
  Clock,
  FileText,
  Shield,
  ChevronRight,
  User,
  List,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';

interface ContactPageProps {
  onBackToHome: () => void;
  onBookNow: () => void;
  onOpenModal: (type: 'how-it-works' | 'faqs' | 'terms' | 'privacy') => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onBookNow,
  onOpenModal,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const contactSchema = {
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
            'name': 'Contact Us',
            'item': 'https://bbdmobility.com.ng/contact'
          }
        ]
      },
      {
        '@type': 'ContactPage',
        '@id': 'https://bbdmobility.com.ng/contact#webpage',
        'url': 'https://bbdmobility.com.ng/contact',
        'name': 'Contact BBD Mobility',
        'description': 'Customer service, dispatch inquiries, and office location for BBD Mobility in Lagos, Nigeria.',
        'mainEntity': {
          '@type': ['DeliveryService', 'LocalBusiness'],
          'name': 'BBD Mobility',
          'telephone': '+2348123456789',
          'email': 'Info@bbdautosng.com',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': '20 Babayanju St, Shogunle',
            'addressLocality': 'Ikeja',
            'addressRegion': 'Lagos',
            'postalCode': '102214',
            'addressCountry': 'NG'
          },
          'hasMap': 'https://maps.app.goo.gl/pjan2ghRaWLWe3Xb8',
          'areaServed': 'Lagos State, Nigeria'
        }
      }
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!formData.fullName.trim()) {
      setStatus({ type: 'error', message: 'Please enter your full name.' });
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (!formData.phone.trim()) {
      setStatus({ type: 'error', message: 'Please enter your phone number.' });
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      setStatus({ type: 'error', message: 'Please enter a message (at least 5 characters).' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject || 'General Inquiry',
          message: formData.message.trim(),
        }),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('[Contact Non-JSON Response]:', text);
        throw new Error('Server returned an unexpected response. Please try again.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully. Our team will contact you shortly.',
      });

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'Unable to connect to dispatch server. Please call us directly.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-bbd-navy font-sans">
      <SEO
        title="Contact Us — BBD Mobility Courier Dispatch Lagos"
        description="Contact BBD Mobility for courier bookings and dispatch support in Lagos. Visit us at 20 Babayanju St, Shogunle, call +234 812 345 6789, or message us online."
        canonicalPath="/contact"
        keywords="contact BBD Mobility, courier phone number Lagos, dispatch service Ikeja, courier office Shogunle Lagos"
        schema={contactSchema}
        image="/assets/contact-hero-hd.jpg"
      />
      
      {/* =========================================================================
          SECTION 1: HERO BANNER (Exact Match: Navy Left, Rider with Script on Right)
         ========================================================================= */}
      <section className="relative overflow-hidden bg-[#092957] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[280px] sm:min-h-[340px] items-stretch">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 py-10 sm:py-14 flex flex-col justify-center text-left space-y-4 pr-0 lg:pr-8 z-10"
            >
              <div className="flex items-center space-x-2">
                <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase">
                  CONTACT US
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tight leading-[1.1]">
                We're Here to <br />
                <span className="text-[#E30620]">Help You</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                Have a question, need support, or want to make a booking? Our team is always ready to assist you. Reach out to us through any of the channels below.
              </p>
            </motion.div>

            {/* Right Visual: Ultra-Sharp HD Contact Hero Photograph */}
            <div className="lg:col-span-6 relative flex items-center justify-end overflow-hidden -mx-4 sm:-mx-6 lg:mx-0">
              {/* Corner Brand Diagonal Stripes */}
              <div className="absolute top-0 right-0 flex space-x-1.5 transform -skew-x-12 pr-4 pt-2 z-20 pointer-events-none">
                <div className="w-2.5 h-16 bg-white/20" />
                <div className="w-2.5 h-16 bg-[#E30620]" />
                <div className="w-2.5 h-16 bg-white/20" />
              </div>

              {/* Red Diagonal Accent Slice */}
              <div className="hidden lg:block absolute left-0 inset-y-0 w-16 bg-gradient-to-r from-[#092957] via-[#092957]/80 to-transparent z-10 pointer-events-none" />
              <div className="hidden lg:block absolute left-8 inset-y-0 w-3 bg-[#E30620] transform -skew-x-12 z-10" />

              <img
                src="/assets/contact-hero-hd.jpg"
                alt="BBD Mobility customer support dispatch representative in Lagos"
                className="w-full h-full min-h-[220px] sm:min-h-[280px] lg:min-h-[340px] object-cover object-center"
              />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 4 CONTACT CHANNELS (Exact Match: 4 White Cards)
         ========================================================================= */}
      <section className="py-10 sm:py-14 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* 1. Phone Support */}
            <div className="p-5 rounded-2xl border border-gray-100 shadow-sm bg-white hover:border-slate-200 transition-all text-left space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#E30620] text-white flex items-center justify-center shadow-sm">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#092957]">Phone Support</h3>
              <p className="text-[11px] text-slate-500">Call us for immediate assistance.</p>
              <div className="pt-1">
                <a
                  href="tel:+2348123456789"
                  className="block font-bold text-xs sm:text-sm text-[#092957] hover:text-[#E30620] transition-colors"
                >
                  +234 812 345 6789
                </a>
                <span className="text-[10px] text-slate-400 block mt-0.5">(Mon – Sat, 8AM – 8PM)</span>
              </div>
            </div>

            {/* 2. Email Support */}
            <div className="p-5 rounded-2xl border border-gray-100 shadow-sm bg-white hover:border-slate-200 transition-all text-left space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#E30620] text-white flex items-center justify-center shadow-sm">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#092957]">Email Support</h3>
              <p className="text-[11px] text-slate-500">Send us an email and we'll get back to you.</p>
              <div className="pt-1">
                <a
                  href="mailto:info@bbdautosng.com"
                  className="block font-bold text-xs sm:text-sm text-[#092957] hover:text-[#E30620] transition-colors truncate"
                >
                  info@bbdautosng.com
                </a>
                <span className="text-[10px] text-slate-400 block mt-0.5">(Within 24 hours)</span>
              </div>
            </div>

            {/* 3. Our Office */}
            <div className="p-5 rounded-2xl border border-gray-100 shadow-sm bg-white hover:border-slate-200 transition-all text-left space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#E30620] text-white flex items-center justify-center shadow-sm">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#092957]">Our Office</h3>
              <p className="text-[11px] text-slate-500">Visit our office for in-person support.</p>
              <div className="pt-1 text-xs sm:text-sm font-bold text-[#092957] leading-snug">
                <div>20, Babayanju Street,</div>
                <div className="text-slate-600 font-medium text-xs">Shogunle, Lagos 102214, Nigeria</div>
              </div>
            </div>

            {/* 4. 24/7 Support */}
            <div className="p-5 rounded-2xl border border-gray-100 shadow-sm bg-white hover:border-slate-200 transition-all text-left space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#E30620] text-white flex items-center justify-center shadow-sm">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#092957]">24/7 Support</h3>
              <p className="text-[11px] text-slate-500">We're always here to help.</p>
              <div className="pt-1">
                <a
                  href="tel:+2348123456789"
                  className="block font-bold text-xs sm:text-sm text-[#092957] hover:text-[#E30620] transition-colors"
                >
                  +234 812 345 6789
                </a>
                <span className="text-[10px] text-slate-400 block mt-0.5">(Emergency &amp; urgent enquiries)</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: FORM & MAP / QUICK LINKS GRID (Exact Match)
         ========================================================================= */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left Column (Span 7): "Send Us A Message" Form Card */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 text-left space-y-5">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                  <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#092957] uppercase">
                    SEND US A MESSAGE
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#092957] tracking-tight mt-1">
                  Get In <span className="text-[#E30620]">Touch</span>
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Fill out the form below and we'll respond as soon as possible.
                </p>
              </div>

              {status && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                    status.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Row 1: Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#092957] mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#092957]/20 focus:border-[#092957] transition-all bg-slate-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#092957] mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email address"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#092957]/20 focus:border-[#092957] transition-all bg-slate-50/50"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Phone & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#092957] mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#092957]/20 focus:border-[#092957] transition-all bg-slate-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#092957] mb-1.5 flex items-center gap-1.5">
                      <List className="w-3.5 h-3.5 text-slate-500" />
                      <span>Subject *</span>
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#092957]/20 focus:border-[#092957] transition-all bg-slate-50/50"
                    >
                      <option value="">Select a subject</option>
                      <option value="Delivery Inquiry">Delivery Inquiry</option>
                      <option value="Urgent Dispatch">Urgent Dispatch</option>
                      <option value="Business Partnership">Business Partnership</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Message Textarea */}
                <div>
                  <label className="block text-xs font-bold text-[#092957] mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span>Message *</span>
                  </label>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Type your message here..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#092957]/20 focus:border-[#092957] transition-all bg-slate-50/50 resize-none"
                    required
                  />
                  <div className="text-right text-[10px] text-slate-400 mt-0.5">
                    {formData.message.length}/500
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#E30620] hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Right Column (Span 5): Map Card & Quick Links */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Interactive Google Map Card */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md bg-white relative group">
                {/* Header bar above map */}
                <div className="bg-slate-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E30620] animate-pulse" />
                    <span className="text-xs font-bold text-[#092957]">
                      BBD Mobility Hub • Shogunle, Lagos
                    </span>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/pjan2ghRaWLWe3Xb8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[#E30620] hover:underline flex items-center gap-0.5"
                  >
                    <span>Open in Maps</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Live Interactive Google Map */}
                <div className="relative w-full h-[230px] sm:h-[260px] bg-slate-100">
                  <iframe
                    title="BBD Mobility Location Map - 20 Babayanju St, Shogunle, Lagos"
                    src="https://maps.google.com/maps?q=20+Babayanju+St,+Shogunle,+Lagos+102214,+Lagos&hl=en&z=16&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Quick Links Card */}
              <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5 text-left space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-[2.5px] bg-[#E30620] rounded-full inline-block" />
                  <span className="text-[11px] font-bold tracking-widest text-[#092957] uppercase">
                    QUICK LINKS
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  <button
                    onClick={() => onOpenModal('faqs')}
                    className="w-full py-2.5 flex items-center justify-between text-xs text-slate-700 hover:text-[#E30620] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-[#E30620]" />
                      <span className="font-semibold">FAQs</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E30620]" />
                  </button>

                  <button
                    onClick={() => onOpenModal('how-it-works')}
                    className="w-full py-2.5 flex items-center justify-between text-xs text-slate-700 hover:text-[#E30620] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-slate-400 group-hover:text-[#E30620]" />
                      <span className="font-semibold">How It Works</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E30620]" />
                  </button>

                  <button
                    onClick={onBookNow}
                    className="w-full py-2.5 flex items-center justify-between text-xs text-slate-700 hover:text-[#E30620] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#E30620]" />
                      <span className="font-semibold">Track Your Order / Book Now</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E30620]" />
                  </button>

                  <button
                    onClick={() => onOpenModal('terms')}
                    className="w-full py-2.5 flex items-center justify-between text-xs text-slate-700 hover:text-[#E30620] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#E30620]" />
                      <span className="font-semibold">Terms &amp; Conditions</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E30620]" />
                  </button>

                  <button
                    onClick={() => onOpenModal('privacy')}
                    className="w-full py-2.5 flex items-center justify-between text-xs text-slate-700 hover:text-[#E30620] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-slate-400 group-hover:text-[#E30620]" />
                      <span className="font-semibold">Privacy Policy</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E30620]" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: NEED URGENT ASSISTANCE BANNER (Exact Match: Navy + WhatsApp Button)
         ========================================================================= */}
      <section className="bg-[#092957] text-white py-6 relative overflow-hidden">
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

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center flex-shrink-0 text-white bg-white/10">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#E30620] uppercase">
                NEED URGENT ASSISTANCE?
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                Talk to Our <span className="text-[#E30620]">Support Team</span>
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Our team is available 24/7 to help with your delivery needs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Phone Button */}
            <a
              href="tel:+2348123456789"
              className="px-4 py-2.5 rounded-full bg-white text-[#092957] text-xs font-bold shadow-md hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-full bg-[#092957] text-white flex items-center justify-center">
                <Phone className="w-3 h-3 text-white" />
              </div>
              <div className="text-left">
                <div className="text-[11px] leading-tight font-extrabold">+234 812 345 6789</div>
                <div className="text-[9px] text-slate-500 font-medium">Call us now</div>
              </div>
            </a>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/2348123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#E30620] hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>Chat on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

    </div>
  );
};

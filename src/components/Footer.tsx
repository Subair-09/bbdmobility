import React, { useState } from 'react';
import { 
  ArrowRight, 
  Phone, 
  Mail, 
  MessageSquare, 
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface FooterProps {
  onOpenModal: (modalType: 'how-it-works' | 'about-us' | 'faqs' | 'contact' | 'privacy' | 'terms' | 'cookies') => void;
  onSelectService: (serviceName: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal, onSelectService }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Subscription failed.');
      }

      setStatus({ type: 'success', message: 'Thank you for subscribing to BBD Mobility!' });
      setEmail('');
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'Unable to subscribe right now. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bbd-navy-dark text-slate-300 pt-12 sm:pt-16 pb-8 border-t border-bbd-navy-light/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 border-b border-slate-700/60">
          
          {/* COLUMN 1: Brand (Span 3 on desktop) */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3.5">
            <div className="flex items-center">
              <img
                src="/assets/logo-white.png"
                alt="BBD Mobility"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </div>
            <p className="text-xs italic text-bbd-red font-bold tracking-wide">
              Move What Matters
            </p>
            <p className="text-xs text-slate-400 leading-relaxed pr-2 max-w-sm">
              Fast, safe and reliable delivery services for individuals and businesses across the city.
            </p>

            {/* Social Media Icons with micro-animations */}
            <div className="flex items-center space-x-2 pt-1">
              {[
                {
                  name: 'Facebook',
                  href: 'https://facebook.com',
                  icon: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  ),
                },
                {
                  name: 'Instagram',
                  href: 'https://instagram.com',
                  icon: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  ),
                },
                {
                  name: 'X',
                  href: 'https://x.com',
                  icon: <span className="font-bold text-xs">𝕏</span>,
                },
                {
                  name: 'LinkedIn',
                  href: 'https://linkedin.com',
                  icon: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  ),
                },
                {
                  name: 'YouTube',
                  href: 'https://youtube.com',
                  icon: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <motion.a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-bbd-red hover:text-white flex items-center justify-center text-slate-300 transition-colors shadow-xs"
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* COLUMN 2: Quick Links (Span 2) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              {['Home', 'Services'].map((name) => (
                <li key={name}>
                  <a href={`#${name.toLowerCase()}`} className="hover:text-white transition-colors block py-0.5">
                    {name}
                  </a>
                </li>
              ))}
              {[
                { label: 'How It Works', modal: 'how-it-works' as const },
                { label: 'About Us', modal: 'about-us' as const },
                { label: 'FAQs', modal: 'faqs' as const },
                { label: 'Contact', modal: 'contact' as const },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => onOpenModal(item.modal)}
                    className="hover:text-white transition-colors text-left block py-0.5"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: Our Services (Span 2) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Our Services
            </h3>
            <ul className="space-y-2 text-xs">
              {[
                'Documents & Files',
                'Food & Groceries',
                'E-commerce Packages',
                'Personal Items',
                'Same-Day & Scheduled',
              ].map((svc) => (
                <li key={svc}>
                  <button
                    onClick={() => {
                      onSelectService(svc);
                      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors text-left block py-0.5"
                  >
                    {svc}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: Support (Span 2) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Support
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onOpenModal('faqs')}
                  className="hover:text-white flex items-center gap-1.5 transition-colors py-0.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-bbd-red flex-shrink-0" />
                  <span>Help Center</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('contact')}
                  className="hover:text-white flex items-center gap-1.5 transition-colors py-0.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-bbd-red flex-shrink-0" />
                  <span>Live Chat</span>
                </button>
              </li>
              <li>
                <a
                  href="tel:+2348123456789"
                  className="hover:text-white flex items-center gap-1.5 transition-colors py-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-bbd-red flex-shrink-0" />
                  <span>+234 812 345 6789</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@bbdmobility.com"
                  className="hover:text-white flex items-center gap-1.5 transition-colors py-0.5"
                >
                  <Mail className="w-3.5 h-3.5 text-bbd-red flex-shrink-0" />
                  <span className="truncate max-w-[170px]">support@bbdmobility.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 5: Newsletter (Span 3) */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Get updates, tips and special offers straight to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative flex items-center max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-3.5 pr-11 py-2.5 sm:py-2.5 bg-white text-slate-900 text-xs rounded-xl focus:outline-none placeholder:text-slate-400 shadow-inner"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  aria-label="Subscribe"
                  className="absolute right-1 top-1 bottom-1 w-9 bg-bbd-red hover:bg-bbd-red-hover active:bg-bbd-red-hover text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                </motion.button>
              </div>

              {status && (
                <div
                  className={`text-[11px] p-2 rounded-lg flex items-center gap-1.5 max-w-sm ${
                    status.type === 'success'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                      : 'bg-red-950/60 text-red-300 border border-red-800'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  <span>{status.message}</span>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
            <p>© {currentYear} BBD Mobility. All rights reserved.</p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onOpenModal('privacy')}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <span>|</span>
              <button
                onClick={() => onOpenModal('terms')}
                className="hover:text-white transition-colors"
              >
                Terms &amp; Conditions
              </button>
              <span>|</span>
              <button
                onClick={() => onOpenModal('cookies')}
                className="hover:text-white transition-colors"
              >
                Cookies
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={scrollToTop}
              className="hover:text-white transition-colors text-slate-400 flex items-center gap-1"
            >
              <span>Back to Top</span>
              <span className="text-xs">↑</span>
            </button>

            {/* Signature Slogan & Diagonal Stripes matching screenshot */}
            <div className="flex items-center space-x-2 pl-2">
              <span className="font-bold italic text-white tracking-wide text-xs">
                Move What Matters
              </span>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-4 bg-white -skew-x-12 rounded-sm inline-block" />
                <span className="w-1.5 h-4 bg-bbd-red -skew-x-12 rounded-sm inline-block" />
                <span className="w-1.5 h-4 bg-white -skew-x-12 rounded-sm inline-block" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

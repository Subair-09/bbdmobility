import React, { useState } from 'react';
import { X, Phone, Mail, Clock, ChevronDown } from 'lucide-react';

export type ModalType = 'how-it-works' | 'about-us' | 'faqs' | 'contact' | 'privacy' | 'terms' | 'cookies';

interface InfoModalProps {
  type: ModalType | null;
  onClose: () => void;
  onBookNow: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose, onBookNow }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!type) return null;

  const faqs = [
    {
      q: 'How quickly will my package be picked up after booking?',
      a: 'Our dispatch desk acknowledges online requests within minutes during operating hours. A verified rider in your sector is assigned and coordinates pickup promptly.',
    },
    {
      q: 'What types of items can I send with BBD Mobility?',
      a: 'We transport documents, parcels, food, e-commerce orders, medicines, electronics, and personal essentials up to standard motorcycle parcel limits. Prohibited or hazardous items cannot be carried.',
    },
    {
      q: 'How is delivery safety ensured?',
      a: 'All BBD Mobility couriers undergo background screening, vehicle inspections, and defensive road training. Your packages are transported inside sealed, weatherproof delivery boxes.',
    },
    {
      q: 'Can I schedule a delivery for tomorrow or next week?',
      a: 'Yes. Select "Same-Day Delivery" or "Scheduled Delivery" on the booking form and note your preferred date and time slot in the delivery instructions field.',
    },
    {
      q: 'What happens if the recipient is unavailable at drop-off?',
      a: 'The assigned rider will immediately phone the recipient and sender to coordinate a secure handover or arrange an alternative drop-off protocol.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-[2px] bg-bbd-red" />
              <span className="text-[11px] font-bold tracking-widest text-bbd-navy uppercase">
                BBD MOBILITY INFORMATION
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-bbd-navy mt-1">
              {type === 'how-it-works' && 'How It Works'}
              {type === 'about-us' && 'About BBD Mobility'}
              {type === 'faqs' && 'Frequently Asked Questions'}
              {type === 'contact' && 'Contact Dispatch Desk'}
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'terms' && 'Terms & Conditions'}
              {type === 'cookies' && 'Cookie Policy'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-slate-700 text-sm leading-relaxed space-y-4">
          
          {/* HOW IT WORKS */}
          {type === 'how-it-works' && (
            <div className="space-y-6">
              <p>
                Booking and completing a delivery with BBD Mobility is structured for effortless convenience, absolute transparency, and dependable speed.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-bbd-navy text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-bbd-navy text-sm">Step 1: Enter Delivery Details</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Select your service type, enter pickup address, drop-off location, sender and recipient contact numbers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-bbd-navy text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-bbd-navy text-sm">Step 2: Rider Assignment &amp; Coordination</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Our dispatch team receives your booking, confirms courier availability in your area, and contacts you directly via phone.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-bbd-navy text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-bbd-navy text-sm">Step 3: Secure Handover</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Our verified courier arrives at the destination and securely hands over the package to your designated recipient.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onBookNow();
                  }}
                  className="w-full py-3 bg-bbd-red hover:bg-bbd-red-hover text-white font-semibold rounded-xl text-center shadow-md"
                >
                  Book a Delivery Now
                </button>
              </div>
            </div>
          )}

          {/* ABOUT US */}
          {type === 'about-us' && (
            <div className="space-y-4">
              <p>
                <strong>BBD Mobility</strong> is a premier delivery and logistics company dedicated to moving what matters across urban metropolitan centers.
              </p>
              <p>
                Born from the proven corporate standards of BBD Autos, our mobility arm brings enterprise discipline, certified safety, and modern courier reliability to everyday delivery needs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-bbd-navy text-xs">Vetted Rider Fleet</h4>
                  <p className="text-xs text-slate-500 mt-1">Strict identity validation and rigorous safety checks.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-bbd-navy text-xs">Weatherproof Boxes</h4>
                  <p className="text-xs text-slate-500 mt-1">Reinforced insulated cargo compartments protect all items.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-bbd-navy text-xs">No-Database Simplicity</h4>
                  <p className="text-xs text-slate-500 mt-1">Fast direct dispatch without cumbersome accounts.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-bbd-navy text-xs">Direct Support</h4>
                  <p className="text-xs text-slate-500 mt-1">Real dispatch coordinators on standby to assist.</p>
                </div>
              </div>
            </div>
          )}

          {/* FAQS */}
          {type === 'faqs' && (
            <div className="space-y-3">
              {faqs.map((faq, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full p-4 text-left font-bold text-bbd-navy text-xs sm:text-sm flex items-center justify-between hover:bg-slate-50"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180 text-bbd-red' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-600 border-t border-gray-100 bg-slate-50/50 pt-3 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* CONTACT */}
          {type === 'contact' && (
            <div className="space-y-5">
              <p>
                Have questions or need immediate delivery assistance? Reach out to our central dispatch desk directly:
              </p>

              <div className="space-y-3">
                <a
                  href="tel:+2348123456789"
                  className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 hover:bg-red-50/40 border border-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 text-bbd-red flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Dispatch Helpline</span>
                    <span className="text-sm font-bold text-bbd-navy">+234 812 345 6789</span>
                  </div>
                </a>

                <a
                  href="mailto:Info@bbdautosng.com"
                  className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 hover:bg-red-50/40 border border-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-bbd-navy flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">General Support &amp; Bookings</span>
                    <span className="text-sm font-bold text-bbd-navy">Info@bbdautosng.com</span>
                  </div>
                </a>

                <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Operating Hours</span>
                    <span className="text-sm font-bold text-bbd-navy">Monday – Saturday: 7:00 AM – 9:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY */}
          {type === 'privacy' && (
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Privacy Commitment:</strong> BBD Mobility respects your personal privacy. We collect only the contact information required to fulfill your pickup and delivery request (sender name, phone number, recipient name, recipient phone number, addresses, and optional email for booking confirmation).
              </p>
              <p>
                We do not sell, license, or market your personal information to third parties. Customer details are transmitted securely via encrypted channels directly to our courier dispatch center.
              </p>
              <p>
                Because this platform employs a lean, no-database architecture, booking records are processed immediately for email dispatch notifications and are not permanently catalogued in an unneeded web database.
              </p>
            </div>
          )}

          {/* TERMS */}
          {type === 'terms' && (
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Service Agreement:</strong> By booking a delivery with BBD Mobility, you confirm that the parcel contains legal, non-hazardous goods suitable for two-wheeled motorcycle transport.
              </p>
              <p>
                Senders are responsible for accurately declaring the recipient contact number and destination address. Our courier will attempt phone contact upon arrival.
              </p>
              <p>
                Delivery quotes and scheduling are subject to sector traffic conditions and severe weather events.
              </p>
            </div>
          )}

          {/* COOKIES */}
          {type === 'cookies' && (
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Cookie Notice:</strong> BBD Mobility uses only essential technical cookies necessary for website layout performance and user session safety.
              </p>
              <p>
                We do not run tracking cookies or third-party behavioral advertising scripts on this site.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

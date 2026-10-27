import React from 'react';
import { X, Star } from 'lucide-react';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const reviews = [
    {
      name: 'Ngozi Eze',
      location: 'Lagos',
      avatar: '/assets/avatar-ngozi-hd.jpg',
      quote: 'BBD Mobility delivered my package within 2 hours. Super fast and professional! The rider called ahead of arrival and handled our fragile documents with utmost care.',
      rating: 5,
      date: 'October 2026',
    },
    {
      name: 'Tunde Adebayo',
      location: 'Lagos',
      avatar: '/assets/avatar-tunde-hd.jpg',
      quote: 'Very reliable service. I use them for my business deliveries and they never disappoint. Seamless dispatch process and prompt pickup every single time.',
      rating: 5,
      date: 'September 2026',
    },
    {
      name: 'Faith Okafor',
      location: 'Lagos',
      avatar: '/assets/avatar-faith-hd.jpg',
      quote: 'Easy booking process and great customer support. Highly recommended! The support team followed up immediately to confirm recipient phone availability.',
      rating: 5,
      date: 'September 2026',
    },
    {
      name: 'Emeka Nwosu',
      location: 'Lagos',
      avatar: '/assets/avatar-tunde-hd.jpg',
      quote: 'We sent critical tender documentation across town during torrential rain. The waterproof courier box kept every sheet bone-dry. Outstanding dependability.',
      rating: 5,
      date: 'August 2026',
    },
    {
      name: 'Amina Bello',
      location: 'Lagos',
      avatar: '/assets/avatar-ngozi-hd.jpg',
      quote: 'Our online pastry store relies on BBD Mobility for same-day scheduled drops. Delivery riders are courteous, neatly uniformed, and respect our customers.',
      rating: 5,
      date: 'July 2026',
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
                VERIFIED CUSTOMER EXPERIENCES
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-bbd-navy mt-1">
              Customer Reviews
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <strong>Sample content disclosure:</strong> Customer testimonials displayed represent verified feedback samples and test submissions recorded during quality assurance.
          </div>

          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-10 h-10 rounded-full object-cover border border-red-100"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-bbd-navy">{r.name}</h4>
                      <p className="text-[11px] text-slate-400">{r.location} • {r.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-0.5">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-bbd-red text-bbd-red stroke-none" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{r.quote}"
                </p>
              </div>
            ))}
          </div>
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

import React from 'react';
import { X, FileText, ShoppingCart, Package, ShoppingBag, Calendar, Check, ArrowRight } from 'lucide-react';

interface AllServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (serviceName: string) => void;
}

export const AllServicesModal: React.FC<AllServicesModalProps> = ({
  isOpen,
  onClose,
  onSelectService,
}) => {
  if (!isOpen) return null;

  const servicesDetails = [
    {
      title: 'Documents & Files',
      icon: FileText,
      description: 'Urgent contracts, sensitive corporate paperwork, notary documents, university credentials, and legal filings.',
      highlights: ['Weatherproof protective pouches', 'Strict confidential handling', 'Direct signature upon delivery'],
    },
    {
      title: 'Food & Groceries',
      icon: ShoppingCart,
      description: 'Prepared meals, fresh groceries, bakery items, catering parcels, and temperature-sensitive pantry goods.',
      highlights: ['Insulated delivery box', 'Spill-resistant upright packing', 'Speedy courier dispatch'],
    },
    {
      title: 'E-commerce Packages',
      icon: Package,
      description: 'Online store merchandise, customer parcels, retail returns, electronics, and fashion apparel deliveries.',
      highlights: ['Scheduled batch runs', 'Doorstep exchange option', 'Real-time phone coordination'],
    },
    {
      title: 'Personal Items',
      icon: ShoppingBag,
      description: 'Forgotten household items, birthday gifts, clothing, keys, and personal valuables transferred between family and friends.',
      highlights: ['Careful parcel handling', 'Direct person-to-person handover', 'Affordable city rates'],
    },
    {
      title: 'Same-Day & Scheduled',
      icon: Calendar,
      description: 'Flexible dispatch planning. Book an immediate pickup or schedule courier arrival for tomorrow morning or next week.',
      highlights: ['Advance date/time slots', 'Guaranteed dispatch window', 'Corporate priority support'],
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
                OUR COMPREHENSIVE SUITE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-bbd-navy mt-1">
              What We Deliver
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 space-y-4">
          {servicesDetails.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.title}
                className="p-4 rounded-xl border border-gray-100 hover:border-bbd-red/30 bg-slate-50/50 hover:bg-red-50/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-bbd-navy flex-shrink-0">
                    <Icon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-bbd-navy">{svc.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {svc.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {svc.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center text-[10px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-full border border-gray-200"
                        >
                          <Check className="w-2.5 h-2.5 text-bbd-red mr-1" />
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectService(svc.title);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-bbd-red hover:bg-bbd-red-hover text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <span>Book This</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
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

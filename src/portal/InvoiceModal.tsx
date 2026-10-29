import React from 'react';
import { X, Printer, CheckCircle, Clock } from 'lucide-react';
import { Booking } from './types';

interface InvoiceModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 relative animate-scaleUp">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6 print:hidden">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Official Invoice • {booking.ref}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-bbd-navy hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="space-y-6 text-gray-800">
          {/* Top Brand & Status */}
          <div className="flex items-start justify-between">
            <div>
              <img 
                src="/assets/logo.png" 
                alt="BBD Mobility" 
                className="h-10 w-auto object-contain mb-1" 
              />
              <p className="text-xs text-gray-500 font-medium">Move What Matters.</p>
              <p className="text-[11px] text-gray-400 mt-1">Lagos, Nigeria • Tel: +234 708 753 1148</p>
            </div>

            <div className="text-right">
              <span className="text-xl font-extrabold text-bbd-navy tracking-tight block">
                INVOICE
              </span>
              <span className="text-xs font-mono font-bold text-gray-600 block mt-0.5">
                {booking.ref}
              </span>
              <span className="text-xs text-gray-400 block mt-1">
                Date: {booking.date}
              </span>
              <div className="mt-2">
                {booking.paymentStatus === 'Paid' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    PAID
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    <Clock className="w-3.5 h-3.5" />
                    PAYMENT PENDING
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Billed To / Delivery Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl text-xs border border-slate-100">
            <div>
              <p className="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-1">Customer / Shipper</p>
              <p className="font-bold text-gray-900 text-sm">{booking.customerName}</p>
              <p className="text-gray-600 mt-0.5">{booking.customerPhone}</p>
              <p className="text-gray-600">{booking.customerEmail}</p>
            </div>

            <div>
              <p className="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-1">Assigned Courier</p>
              <p className="font-bold text-gray-900 text-sm">{booking.riderName || 'BBD Dispatch Desk'}</p>
              <p className="text-gray-600 mt-0.5">{booking.riderPhone || '+234 708 753 1148'}</p>
              <p className="text-gray-600">Verification OTP: <span className="font-mono font-bold text-bbd-red">{booking.verificationOtp}</span></p>
            </div>
          </div>

          {/* Route Overview */}
          <div className="p-3.5 border border-gray-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase block">Pickup Location</span>
                <span className="font-medium text-gray-800">{booking.pickupLocation}</span>
              </div>
            </div>
            <div className="border-l border-dashed border-gray-300 ml-1 h-3" />
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 mt-1 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase block">Drop-off Destination</span>
                <span className="font-medium text-gray-800">{booking.dropoffLocation}</span>
              </div>
            </div>
          </div>

          {/* Charges Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-left">
                <tr>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-gray-800 block">Direct Urban Courier Service</span>
                    <span className="text-gray-500 text-[11px]">{booking.packageDescription}</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 font-medium">{booking.packageWeight}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-800">₦{Number(booking.amount || 5000).toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-gray-200">
                <tr>
                  <td colSpan={2} className="py-3 px-3 text-right text-gray-600">Total Charged:</td>
                  <td className="py-3 px-3 text-right text-base text-bbd-navy">₦{Number(booking.amount || 5000).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Note */}
          <div className="text-[11px] text-gray-400 text-center pt-2">
            Thank you for choosing BBD Mobility. Move What Matters.
          </div>
        </div>
      </div>
    </div>
  );
};

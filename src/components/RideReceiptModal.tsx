import React from 'react';
import { X, Printer } from 'lucide-react';
import { PricingBreakdown } from '../services/mapboxService';

export interface RideReceiptData {
  bookingRef: string;
  senderName: string;
  senderPhone: string;
  receiverName?: string;
  receiverPhone?: string;
  pickupLocation: string;
  dropoffLocation: string;
  packageDetails?: string;
  serviceType: string;
  date: string;
  time: string;
  verificationOtp?: string;
  fareBreakdown: PricingBreakdown;
}

interface RideReceiptModalProps {
  receipt: RideReceiptData | null;
  onClose: () => void;
}

export const RideReceiptModal: React.FC<RideReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const { fareBreakdown } = receipt;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 relative animate-scaleUp">
        {/* Header Controls (Hidden on Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Official Ride Receipt • {receipt.bookingRef}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#0B1B3D] text-white hover:bg-[#122b5e] rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="bbd-ride-receipt" className="space-y-5 text-gray-800">
          {/* Header Brand */}
          <div className="text-center pb-4 border-b border-gray-200">
            <h1 className="text-xl sm:text-2xl font-black text-[#0B1B3D] tracking-tight">
              BBD MOBILITY
            </h1>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-0.5">
              Move What Matters • Urban Dispatch Receipt
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Lagos, Nigeria • Helpline: +234 708 753 1148 • support@bbdmobility.com.ng
            </p>
          </div>

          {/* Reference & Timestamp */}
          <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Booking Reference</span>
              <span className="font-mono font-black text-sm text-[#E30620]">{receipt.bookingRef}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Date & Time</span>
              <span className="font-semibold text-gray-700">{receipt.date} • {receipt.time}</span>
            </div>
          </div>

          {/* Locations */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Pickup Location</span>
                <span className="font-semibold text-gray-800">{receipt.pickupLocation}</span>
              </div>
            </div>
            <div className="border-l border-dashed border-gray-300 ml-1 h-2" />
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E30620] mt-1 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Destination</span>
                <span className="font-semibold text-gray-800">{receipt.dropoffLocation}</span>
              </div>
            </div>
          </div>

          {/* Required Professional Fare Breakdown */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-[#0B1B3D] text-white px-3.5 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span>Fare Calculation Component</span>
              <span>Amount</span>
            </div>
            <div className="divide-y divide-gray-100 text-xs p-3.5 space-y-2">
              <div className="flex justify-between items-center text-gray-600">
                <span>Distance:</span>
                <span className="font-bold text-gray-900">{fareBreakdown.distanceKm} KM</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 pt-1.5">
                <span>Estimated Duration:</span>
                <span className="font-bold text-gray-900">{fareBreakdown.durationMinutes} Minutes</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 pt-1.5">
                <span>Base Booking Fee:</span>
                <span className="font-bold text-gray-900">₦{fareBreakdown.baseFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 pt-1.5">
                <span>Distance Charge ({fareBreakdown.distanceKm} km × ₦{fareBreakdown.pricePerKm}/km):</span>
                <span className="font-bold text-gray-900">₦{fareBreakdown.distanceCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 pt-1.5">
                <span>Time Charge ({fareBreakdown.durationMinutes} mins × ₦{fareBreakdown.pricePerMinute}/min):</span>
                <span className="font-bold text-gray-900">₦{fareBreakdown.timeCharge.toLocaleString()}</span>
              </div>
              {fareBreakdown.waitingCharge > 0 && (
                <div className="flex justify-between items-center text-gray-600 pt-1.5">
                  <span>Waiting Charge:</span>
                  <span className="font-bold text-gray-900">₦{fareBreakdown.waitingCharge.toLocaleString()}</span>
                </div>
              )}
              {fareBreakdown.isMinimumFareApplied && (
                <div className="flex justify-between items-center text-amber-700 bg-amber-50 px-2 py-1 rounded text-[11px] pt-1">
                  <span>Minimum Fare Protection Applied:</span>
                  <span className="font-bold">₦{fareBreakdown.subtotalBeforeVat.toLocaleString()}</span>
                </div>
              )}
              {fareBreakdown.vatAmount > 0 && (
                <div className="flex justify-between items-center text-gray-600 pt-1.5">
                  <span>VAT ({fareBreakdown.vatPercentage}%):</span>
                  <span className="font-bold text-gray-900">₦{fareBreakdown.vatAmount.toLocaleString()}</span>
                </div>
              )}
              {fareBreakdown.fareRoundingIncrement > 1 && (
                <div className="flex justify-between items-center text-gray-400 text-[11px] pt-1.5">
                  <span>Rounding (nearest ₦{fareBreakdown.fareRoundingIncrement}):</span>
                  <span>Applied</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border-t border-gray-200 p-3.5 flex items-baseline justify-between font-black">
              <span className="text-xs uppercase tracking-wider text-[#0B1B3D]">TOTAL AMOUNT:</span>
              <span className="text-lg text-[#0B1B3D]">₦{fareBreakdown.finalFare.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery OTP Verification */}
          {receipt.verificationOtp && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#E30620] block">Receiver Delivery OTP</span>
                <span className="text-gray-600 text-[11px]">Share with rider upon arrival</span>
              </div>
              <span className="font-mono font-black text-base text-[#E30620] tracking-widest bg-white px-3 py-1 rounded border border-red-200">
                {receipt.verificationOtp}
              </span>
            </div>
          )}

          {/* Footer Sign-off */}
          <div className="text-center pt-2 text-[11px] text-gray-400 space-y-0.5">
            <p>Your fare has been automatically calculated based on the driving distance and estimated journey time.</p>
            <p className="font-semibold text-gray-500">Thank you for riding with BBD Mobility.</p>
          </div>
        </div>

        {/* Close Button at bottom */}
        <div className="pt-4 mt-2 print:hidden text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

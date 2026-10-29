import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Search, 
  Download, 
  Calendar, 
  X, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { PaymentRecord, PaymentMethod, Booking } from '../types';

interface PaymentsTabProps {
  payments: PaymentRecord[];
  bookings: Booking[];
  onRecordPayment: (payment: Partial<PaymentRecord>) => void;
  onShowToast: (msg: string) => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  payments,
  bookings,
  onRecordPayment,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [methodFilter, setMethodFilter] = useState('All Payment Methods');
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Add payment form states
  const [targetRef, setTargetRef] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toLocaleDateString('en-GB'));
  const [paymentTime, setPaymentTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [txRef, setTxRef] = useState('');
  const [notes, setNotes] = useState('');

  const selectedBookingObj = bookings.find(b => b.ref === targetRef);

  const handleOpenAddPayment = (presetRef?: string) => {
    const target = presetRef 
      ? bookings.find(b => b.ref === presetRef)
      : (bookings.find(b => b.paymentStatus !== 'Paid') || bookings[0]);

    if (target) {
      setTargetRef(target.ref);
      setCustomerName(target.customerName);
      setCustomerPhone(target.customerPhone);
      setAmount(target.amount > 0 ? String(target.amount) : '');
    } else {
      setTargetRef('');
      setCustomerName('');
      setCustomerPhone('');
      setAmount('');
    }
    setPaymentMethod('Bank Transfer');
    setPaymentStatus('Paid');
    setPaymentDate(new Date().toLocaleDateString('en-GB'));
    setPaymentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setTxRef('');
    setNotes('');
    setIsAddPaymentOpen(true);
  };

  const filteredPayments = payments.filter(p => {
    if (!p) return false;
    const bookingRef = (p.bookingRef || '').toLowerCase();
    const customerName = (p.customerName || '').toLowerCase();
    const customerPhone = (p.customerPhone || '');
    const search = (searchTerm || '').toLowerCase();

    const matchesSearch = 
      bookingRef.includes(search) ||
      customerName.includes(search) ||
      customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All Status' || p.paymentStatus === statusFilter;
    const matchesMethod = methodFilter === 'All Payment Methods' || p.paymentMethod === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRef) {
      onShowToast('Please select a booking to record payment for.');
      return;
    }
    const numAmt = Number(amount);
    if (!numAmt || numAmt <= 0) {
      onShowToast('Please enter a valid payment amount greater than zero.');
      return;
    }

    onRecordPayment({
      bookingRef: targetRef,
      customerName: customerName || selectedBookingObj?.customerName || 'Customer',
      customerPhone: customerPhone || selectedBookingObj?.customerPhone || '',
      pickupLocation: selectedBookingObj?.pickupLocation || 'Lagos',
      dropoffLocation: selectedBookingObj?.dropoffLocation || 'Lagos',
      amount: numAmt,
      paymentMethod,
      paymentStatus,
      paidAt: `${paymentDate} ${paymentTime}`,
      transactionRef: txRef,
      notes
    });

    setIsAddPaymentOpen(false);
  };

  const handleOpenAddForBooking = (p: PaymentRecord) => {
    setTargetRef(p.bookingRef);
    setCustomerName(p.customerName);
    setCustomerPhone(p.customerPhone);
    setAmount(p.amount ? p.amount.toString() : '');
    setPaymentMethod(p.paymentMethod);
    setPaymentStatus(p.paymentStatus);
    setIsAddPaymentOpen(true);
  };

  const handleExport = () => {
    const headers = ['Ref', 'Customer', 'Phone', 'Amount', 'Method', 'Status', 'Paid At', 'Transaction'];
    const rows = filteredPayments.map(p => [
      p.bookingRef,
      `"${p.customerName}"`,
      p.customerPhone,
      p.amount,
      p.paymentMethod,
      p.paymentStatus,
      `"${p.paidAt}"`,
      p.transactionRef || 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bbd_payments_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Payments list exported.');
  };

  // Dynamic metrics calculated purely from live database payments
  const totalPaymentsAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const paidPaymentsAmount = payments.filter(p => p.paymentStatus === 'Paid').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingPaymentsAmount = payments.filter(p => p.paymentStatus !== 'Paid').reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6 relative">
      {/* Header & Date Filter (Screenshot 8) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Payments</h1>
          <p className="text-xs text-gray-500 font-medium">Set delivery prices and record customer payments for all bookings.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenAddPayment()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Record Payment</span>
          </button>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-sm text-xs font-semibold text-gray-700 cursor-pointer hover:border-gray-300">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Live Overview</span>
          </div>
        </div>
      </div>

      {/* 3 Stat KPI Cards (Live Database Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">₦{totalPaymentsAmount.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600">Live</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">From recorded payments</span>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Pending Payments</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">₦{pendingPaymentsAmount.toLocaleString()}</span>
            <span className="text-xs font-bold text-amber-600">Pending</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Awaiting confirmation</span>
        </div>

        {/* Paid Payments */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Paid Payments</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">₦{paidPaymentsAmount.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600">Verified</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Confirmed paid</span>
        </div>
      </div>

      {/* Main Table Card (Screenshot 8) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative rounded-xl border border-gray-200 focus-within:border-bbd-navy text-xs flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by booking ref, customer name, phone or rider..."
              className="w-full pl-9 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl focus:outline-none cursor-pointer"
            >
              <option>All Status</option>
              <option>Paid</option>
              <option>Pending</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl focus:outline-none cursor-pointer"
            >
              <option>All Payment Methods</option>
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>POS</option>
              <option>Card</option>
            </select>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0B1B3D] text-white text-xs font-bold rounded-xl hover:bg-[#07132c] shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-gray-500 uppercase text-[10px] tracking-wider font-bold border-b border-gray-100">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input type="checkbox" className="rounded border-gray-300 text-bbd-navy" />
                </th>
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Booking Ref</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">Payment Status</th>
                <th className="py-3 px-3">Paid At</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400 font-medium text-xs">
                    No payment records found in database. Payments logged for deliveries will appear here.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p, idx) => (
                <tr 
                  key={p.id || p.bookingRef}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3.5 px-3">
                    <input type="checkbox" className="rounded border-gray-300 text-bbd-navy" />
                  </td>
                  <td className="py-3.5 px-3 text-gray-400 font-semibold">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{p.bookingRef}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-gray-700 font-bold flex items-center justify-center text-[10px]">
                        {(p.customerName || 'Customer').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 block leading-tight">{p.customerName || 'Customer'}</span>
                        <span className="text-[10px] text-gray-400">{p.customerPhone || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-gray-900">₦{Number(p.amount || 0).toLocaleString()}</td>
                  <td className="py-3.5 px-3 text-gray-600 font-medium">{p.paymentMethod || 'Cash'}</td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.paymentStatus || 'Paid'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-gray-400 text-[11px]">{p.paidAt || 'Recent'}</td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenAddForBooking(p)}
                        className="px-2.5 py-1 bg-[#0B1B3D] hover:bg-[#07132c] text-white text-[10px] font-bold rounded-lg transition-all shadow-sm"
                      >
                        View
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Showing 1 - {paginatedPayments.length} of {filteredPayments.length} payments</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg border border-gray-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-6 h-6 rounded-lg text-xs font-bold ${
                  currentPage === page ? 'bg-[#0B1B3D] text-white' : 'border border-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg border border-gray-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Add Payment Drawer (Screenshot 8) */}
      {isAddPaymentOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slideLeft">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Record Booking Payment</h3>
                <p className="text-[11px] text-gray-400">Set delivery price & log customer transaction</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddPaymentOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSavePayment} className="p-6 overflow-y-auto flex-grow space-y-4 text-xs text-gray-700">
            {/* Booking Selector Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                Select Customer Booking *
              </label>
              {bookings.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  No bookings found in database. Once orders are placed, they will appear here.
                </div>
              ) : (
                <select
                  required
                  value={targetRef}
                  onChange={(e) => {
                    const ref = e.target.value;
                    setTargetRef(ref);
                    const b = bookings.find(item => item.ref === ref);
                    if (b) {
                      setCustomerName(b.customerName);
                      setCustomerPhone(b.customerPhone);
                      setAmount(b.amount > 0 ? String(b.amount) : '');
                    }
                  }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white font-medium text-xs text-gray-900 focus:outline-none focus:border-bbd-navy shadow-xs"
                >
                  <option value="">-- Choose Booking to Record Payment --</option>
                  {bookings.map(b => (
                    <option key={b.ref} value={b.ref}>
                      {b.ref} — {b.customerName} ({b.pickupLocation} → {b.dropoffLocation}) [{b.amount > 0 ? `₦${b.amount.toLocaleString()}` : 'Price Pending'} | {b.paymentStatus}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Target Booking Info Card */}
            {selectedBookingObj && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Selected Order</span>
                    <span className="font-mono font-black text-gray-900 text-sm">{selectedBookingObj.ref}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {selectedBookingObj.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedBookingObj.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedBookingObj.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs border-t border-slate-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Customer:</span>
                    <span className="font-bold text-gray-800">{selectedBookingObj.customerName} ({selectedBookingObj.customerPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Pickup:</span>
                    <span className="font-medium text-gray-700 truncate max-w-[220px]">{selectedBookingObj.pickupLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Dropoff:</span>
                    <span className="font-medium text-gray-700 truncate max-w-[220px]">{selectedBookingObj.dropoffLocation}</span>
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-lg p-2 text-[11px] text-emerald-800 leading-tight">
                  💡 Recording this payment sets the final delivery fee and marks the order as <strong>Paid</strong> in the Booking Section.
                </div>
              </div>
            )}

            <h4 className="font-bold text-gray-900 text-xs pt-1">Payment & Pricing Details</h4>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Final Agreed Delivery Price / Amount (₦) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy font-bold text-sm text-gray-900 placeholder:font-normal placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white font-medium"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="POS">POS</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Status *</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white font-medium"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Date *</label>
                <input
                  type="text"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Time</label>
                <input
                  type="text"
                  value={paymentTime}
                  onChange={(e) => setPaymentTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Transaction Reference (Optional)</label>
              <input
                type="text"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                placeholder="e.g. Bank slip reference, transaction ID"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Admin Notes (Optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Price agreed with sender; paid via bank transfer..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy resize-none"
              />
            </div>

            <div className="pt-3 space-y-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm & Record Payment (Sync to Booking)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddPaymentOpen(false)}
                className="w-full py-2 px-4 text-gray-500 hover:text-gray-700 text-xs font-semibold rounded-xl text-center block"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

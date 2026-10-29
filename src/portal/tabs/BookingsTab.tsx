import React, { useState } from 'react';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Download, 
  Calendar, 
  ChevronDown, 
  Copy, 
  Check, 
  X, 
  FileText, 
  MapPin, 
  User, 
  Bike, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Ban,
  Trash2,
  CreditCard
} from 'lucide-react';
import { Booking, Rider, PaymentRecord, PaymentMethod } from '../types';

interface BookingsTabProps {
  bookings: Booking[];
  riders: Rider[];
  selectedBooking: Booking | null;
  onSelectBooking: (booking: Booking | null) => void;
  onUpdateBooking: (ref: string, updates: Partial<Booking>) => void;
  onAssignRider: (ref: string, riderId: string, note?: string) => Promise<boolean>;
  onCancelBooking?: (ref: string, reason: string) => Promise<boolean>;
  onDeleteBooking?: (ref: string) => Promise<boolean>;
  onRecordPayment?: (payment: Partial<PaymentRecord>) => void;
  onViewInvoice: (booking: Booking) => void;
  onShowToast: (msg: string) => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({
  bookings,
  riders,
  selectedBooking,
  onSelectBooking,
  onUpdateBooking,
  onAssignRider,
  onCancelBooking,
  onDeleteBooking,
  onRecordPayment,
  onViewInvoice,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [paymentFilter, setPaymentFilter] = useState('All Payment Status');
  const [riderFilter, setRiderFilter] = useState('All Riders');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedRef, setCopiedRef] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Assign Rider Modal States
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [assignmentNote, setAssignmentNote] = useState<string>('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState<boolean>(false);

  // Industry Standard: Cancel Booking Modal States
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelPresetReason, setCancelPresetReason] = useState<string>('Customer requested cancellation');
  const [customCancelReason, setCustomCancelReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // Industry Standard: Safeguarded Delete Modal States
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState<boolean>(false);

  // Record Payment / Set Price Modal States
  const [paymentModalBooking, setPaymentModalBooking] = useState<Booking | null>(null);
  const [modalPaymentAmount, setModalPaymentAmount] = useState<string>('');
  const [modalPaymentMethod, setModalPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [modalPaymentStatus, setModalPaymentStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [modalPaymentNotes, setModalPaymentNotes] = useState<string>('');
  const [isSubmittingRecordPayment, setIsSubmittingRecordPayment] = useState<boolean>(false);

  const handleOpenPaymentModal = (b: Booking) => {
    setPaymentModalBooking(b);
    setModalPaymentAmount(b.amount > 0 ? String(b.amount) : '');
    setModalPaymentMethod(b.paymentMethod || 'Bank Transfer');
    setModalPaymentStatus('Paid');
    setModalPaymentNotes('');
  };

  const handleConfirmRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalBooking) return;
    const numAmt = Number(modalPaymentAmount);
    if (!numAmt || numAmt <= 0) {
      onShowToast('Please enter a valid payment amount greater than zero.');
      return;
    }
    setIsSubmittingRecordPayment(true);
    try {
      if (onRecordPayment) {
        await onRecordPayment({
          bookingRef: paymentModalBooking.ref,
          amount: numAmt,
          paymentMethod: modalPaymentMethod,
          paymentStatus: modalPaymentStatus,
          customerName: paymentModalBooking.customerName,
          customerPhone: paymentModalBooking.customerPhone,
          notes: modalPaymentNotes || 'Price confirmed and payment recorded'
        });
      }
      setPaymentModalBooking(null);
    } finally {
      setIsSubmittingRecordPayment(false);
    }
  };

  const handleOpenAssignModal = (b: Booking) => {
    setAssigningBooking(b);
    const activeRiders = riders.filter(r => r.status === 'Active');
    const existingRider = activeRiders.find(r => r.riderId === b.riderId || r.name === b.riderName);
    setSelectedRiderId(existingRider ? existingRider.riderId : (activeRiders[0]?.riderId || ''));
    setAssignmentNote('');
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingBooking) return;
    const finalReason = cancelPresetReason === 'Other' ? customCancelReason.trim() : cancelPresetReason;
    if (!finalReason) {
      onShowToast('Please provide a reason for cancellation.');
      return;
    }
    setIsSubmittingCancel(true);
    try {
      if (onCancelBooking) {
        await onCancelBooking(cancellingBooking.ref, finalReason);
      }
      setCancellingBooking(null);
      setCustomCancelReason('');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBooking) return;
    setIsSubmittingDelete(true);
    try {
      if (onDeleteBooking) {
        await onDeleteBooking(deletingBooking.ref);
      }
      setDeletingBooking(null);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBooking) return;
    if (!selectedRiderId) {
      onShowToast('Please select an active courier rider.');
      return;
    }
    setIsSubmittingAssign(true);
    try {
      const success = await onAssignRider(assigningBooking.ref, selectedRiderId, assignmentNote);
      if (success) {
        setAssigningBooking(null);
      }
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Unique riders list for filter dropdown
  const uniqueRiders = Array.from(new Set(bookings.map(b => b.riderName).filter(Boolean)));

  // Filter bookings safely
  const filteredBookings = bookings.filter(b => {
    if (!b) return false;
    const ref = (b.ref || '').toLowerCase();
    const customerName = (b.customerName || (b as any).senderName || '').toLowerCase();
    const customerPhone = (b.customerPhone || (b as any).senderPhone || '');
    const pickupLocation = (b.pickupLocation || (b as any).pickupAddress || '').toLowerCase();
    const dropoffLocation = (b.dropoffLocation || (b as any).deliveryAddress || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();

    const matchesSearch = 
      ref.includes(search) ||
      customerName.includes(search) ||
      customerPhone.includes(searchTerm) ||
      pickupLocation.includes(search) ||
      dropoffLocation.includes(search);
    const matchesStatus = statusFilter === 'All Status' || b.status === statusFilter;
    const matchesPayment = paymentFilter === 'All Payment Status' || b.paymentStatus === paymentFilter;
    const matchesRider = riderFilter === 'All Riders' || (b.riderName || (b as any).assignedRiderName) === riderFilter;
    return matchesSearch && matchesStatus && matchesPayment && matchesRider;
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 1500);
    onShowToast(`Booking reference ${ref} copied.`);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedBookings.map(b => b.id || b.ref));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExport = () => {
    const headers = ['Ref', 'Customer', 'Phone', 'Pickup', 'Dropoff', 'Amount', 'Payment', 'Status', 'Rider'];
    const rows = filteredBookings.map(b => [
      b.ref || '',
      `"${b.customerName || (b as any).senderName || 'Customer'}"`,
      b.customerPhone || (b as any).senderPhone || '',
      `"${b.pickupLocation || (b as any).pickupAddress || ''}"`,
      `"${b.dropoffLocation || (b as any).deliveryAddress || ''}"`,
      Number(b.amount || (b as any).totalAmount || 5000),
      b.paymentStatus || 'Unpaid',
      b.status || 'Pending',
      `"${b.riderName || (b as any).assignedRiderName || 'Unassigned'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bbd_bookings_list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Bookings exported to CSV.');
  };

  // Dynamic metrics calculated purely from live database bookings
  const totalBookingsCount = bookings.length;
  const deliveredBookingsCount = bookings.filter(b => b.status === 'Delivered').length;
  const inTransitBookingsCount = bookings.filter(b => b.status === 'In Transit' || b.status === 'Picked Up').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending' || !b.status).length;

  return (
    <div className="space-y-6 relative">
      {/* Top Header & Date Filter (Screenshot 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bookings</h1>
          <p className="text-xs text-gray-500 font-medium">View, manage and track all delivery bookings.</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-sm text-xs font-semibold text-gray-700 cursor-pointer hover:border-gray-300">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Oct 28, 2026 - Nov 28, 2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
        </div>
      </div>

      {/* 4 Stat KPI Cards (Screenshot 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Total Bookings</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{totalBookingsCount}</span>
            <span className="text-xs font-bold text-emerald-600">Live</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Total customer bookings</span>
        </div>

        {/* Delivered */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Delivered</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{deliveredBookingsCount}</span>
            <span className="text-xs font-bold text-emerald-600">Verified</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Successfully delivered</span>
        </div>

        {/* In Transit */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">In Transit</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{inTransitBookingsCount}</span>
            <span className="text-xs font-bold text-amber-600">Active</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Picked up & on the way</span>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Pending</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{pendingBookingsCount}</span>
            <span className="text-xs font-bold text-red-600">Pending</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Awaiting dispatch/pickup</span>
        </div>
      </div>

      {/* Main Filter & Table Card (Screenshot 4) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative rounded-xl border border-gray-200 focus-within:border-bbd-navy text-xs flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by booking ref, customer name, phone or location..."
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
              <option>Delivered</option>
              <option>In Transit</option>
              <option>Picked Up</option>
              <option>Pending</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl focus:outline-none cursor-pointer"
            >
              <option>All Payment Status</option>
              <option>Paid</option>
              <option>Unpaid</option>
              <option>Pending</option>
            </select>

            <select
              value={riderFilter}
              onChange={(e) => setRiderFilter(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl focus:outline-none cursor-pointer"
            >
              <option>All Riders</option>
              {uniqueRiders.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0B1B3D] text-white text-xs font-bold rounded-xl hover:bg-[#07132c] shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-gray-500 uppercase text-[10px] tracking-wider font-bold border-b border-gray-100">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === paginatedBookings.length && paginatedBookings.length > 0}
                    className="rounded border-gray-300 text-bbd-navy focus:ring-bbd-navy"
                  />
                </th>
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Booking Ref</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Pickup Location</th>
                <th className="py-3 px-3">Drop-off Location</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Rider</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-gray-400 font-medium text-xs">
                    No bookings found in database. Customer bookings made on the website will appear here in real-time.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b, idx) => {
                const isSelected = selectedIds.includes(b.id || b.ref);
                const isCurrent = selectedBooking?.ref === b.ref;

                return (
                  <tr 
                    key={b.id || b.ref}
                    className={`hover:bg-slate-50 transition-colors ${isCurrent ? 'bg-blue-50/60' : ''}`}
                  >
                    <td className="py-3.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(b.id || b.ref)}
                        className="rounded border-gray-300 text-bbd-navy focus:ring-bbd-navy"
                      />
                    </td>
                    <td className="py-3.5 px-3 text-gray-400 font-semibold">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{b.ref}</td>
                    <td className="py-3.5 px-3 font-semibold text-gray-800">{b.customerName || (b as any).senderName || 'Customer'}</td>
                    <td className="py-3.5 px-3 text-gray-500">{b.customerPhone || (b as any).senderPhone || '—'}</td>
                    <td className="py-3.5 px-3 text-gray-600 truncate max-w-[130px]">{b.pickupLocation || (b as any).pickupAddress || '—'}</td>
                    <td className="py-3.5 px-3 text-gray-600 truncate max-w-[130px]">{b.dropoffLocation || (b as any).deliveryAddress || '—'}</td>
                    <td className="py-3.5 px-3">
                      {Number(b.amount || 0) > 0 ? (
                        <span className="font-extrabold text-gray-900 text-xs">
                          ₦{Number(b.amount).toLocaleString()}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPaymentModal(b);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all cursor-pointer"
                          title="Price not yet set. Click to record payment & set price."
                        >
                          <CreditCard className="w-2.5 h-2.5" />
                          <span>Pending Price</span>
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        b.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-600'
                      }`}>
                        {b.paymentStatus || 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        b.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'In Transit' ? 'bg-sky-100 text-sky-800' :
                        b.status === 'Picked Up' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {(b.riderName || (b as any).assignedRiderName) ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            <Bike className="w-3 h-3" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-gray-800 block text-xs leading-tight truncate max-w-[110px]">
                              {b.riderName || (b as any).assignedRiderName}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAssignModal(b);
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold inline-block"
                            >
                              Reassign
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAssignModal(b);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all whitespace-nowrap"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Assign Rider</span>
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. Cancel Booking Icon Button (Industry standard: cancel with audit reason) */}
                        {b.status !== 'Delivered' && b.status !== 'Cancelled' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCancellingBooking(b);
                              setCancelPresetReason('Customer requested cancellation');
                              setCustomCancelReason('');
                            }}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-lg transition-all"
                            title="Cancel Booking (Log Reason & Release Rider)"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        ) : null}

                        {/* Record Payment / Set Price Icon Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPaymentModal(b);
                          }}
                          className={`p-1.5 rounded-lg border transition-all ${
                            b.paymentStatus === 'Paid'
                              ? 'text-emerald-700 hover:bg-emerald-50 border-emerald-200 bg-emerald-50/50'
                              : 'text-indigo-600 hover:bg-indigo-50 border-indigo-200 bg-indigo-50/40'
                          }`}
                          title={b.paymentStatus === 'Paid' ? `Payment Recorded: ₦${(b.amount || 0).toLocaleString()}` : "Record Payment & Set Price"}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>

                        {/* 2. Delete Booking Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingBooking(b);
                          }}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-all"
                          title="Delete Booking Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* 3. View Drawer Button */}
                        <button
                          onClick={() => onSelectBooking(b)}
                          className="px-2.5 py-1 bg-[#0B1B3D] hover:bg-[#07132c] text-white text-[11px] font-bold rounded-lg transition-all shadow-sm"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Pagination (Screenshot 4) */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <span>Showing 1 - {paginatedBookings.length} of {filteredBookings.length} bookings</span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                  currentPage === page ? 'bg-[#0B1B3D] text-white' : 'border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            {totalPages > 5 && <span className="px-1 text-gray-400">...</span>}
            {totalPages > 5 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`w-7 h-7 rounded-lg text-xs font-bold ${
                  currentPage === totalPages ? 'bg-[#0B1B3D] text-white' : 'border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Booking Details Drawer (Screenshot 4) */}
      {selectedBooking && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slideLeft">
          {/* Drawer Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Booking Details</h3>
            <button
              onClick={() => onSelectBooking(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-6 overflow-y-auto flex-grow space-y-6 text-xs text-gray-700">
            {/* Booking Ref & Badges */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-[#0B1B3D]">{selectedBooking.ref}</span>
                  <button
                    onClick={() => handleCopyRef(selectedBooking.ref)}
                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedBooking.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedBooking.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedBooking.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-600'
                  }`}>
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400">{selectedBooking.date} • {selectedBooking.time}</p>
            </div>

            {/* Customer Information */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Customer Information</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-bold text-gray-800">{selectedBooking.customerName || (selectedBooking as any).senderName || 'Customer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-800">{selectedBooking.customerPhone || (selectedBooking as any).senderPhone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-800">{selectedBooking.customerEmail || (selectedBooking as any).senderEmail || '—'}</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>Delivery Details</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Pickup Location</span>
                  <p className="font-medium text-gray-800">{selectedBooking.pickupLocation || (selectedBooking as any).pickupAddress || '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Drop-off Location</span>
                  <p className="font-medium text-gray-800">{selectedBooking.dropoffLocation || (selectedBooking as any).deliveryAddress || '—'}</p>
                </div>
              </div>
            </div>

            {/* Package Information */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <Package className="w-3.5 h-3.5 text-amber-600" />
                <span>Package Information</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Description</span>
                  <span className="font-medium text-gray-800">{selectedBooking.packageDescription || 'General Parcel'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-medium text-gray-800">{selectedBooking.packageWeight || '1.0 kg'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-gray-900">₦{Number(selectedBooking.amount ?? (selectedBooking as any).totalAmount ?? 5000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                  <span className="text-gray-500 font-semibold">Verification OTP</span>
                  <span className="font-mono font-bold text-bbd-red bg-red-50 px-2 py-0.5 rounded">
                    {selectedBooking.verificationOtp || '••••••'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rider Information */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-gray-900 font-bold">
                <div className="flex items-center gap-2">
                  <Bike className="w-3.5 h-3.5 text-purple-600" />
                  <span>Rider Information</span>
                </div>
                {(selectedBooking.riderName || (selectedBooking as any).assignedRiderName) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                    Assigned
                  </span>
                )}
              </div>

              {(selectedBooking.riderName || (selectedBooking as any).assignedRiderName) ? (
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rider Name</span>
                    <span className="font-bold text-gray-800">{selectedBooking.riderName || (selectedBooking as any).assignedRiderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-gray-800">{selectedBooking.riderPhone || (selectedBooking as any).assignedRiderPhone || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-800">{selectedBooking.riderEmail || (selectedBooking as any).assignedRiderEmail || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vehicle Type</span>
                    <span className="font-medium text-gray-800">{selectedBooking.riderVehicle || 'Motorcycle'}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200/60">
                    <button
                      onClick={() => handleOpenAssignModal(selectedBooking)}
                      className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-gray-200 text-bbd-navy font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                      <span>Reassign to Another Rider</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-2">
                  <span className="text-xs font-bold text-amber-900 block">No Rider Assigned Yet</span>
                  <p className="text-[11px] text-amber-700">
                    This booking is awaiting dispatch. Assign an active rider to start pickup and transit.
                  </p>
                  <button
                    onClick={() => handleOpenAssignModal(selectedBooking)}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign Courier Rider</span>
                  </button>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-gray-900 font-bold block">Status Timeline</span>
              <div className="p-3 bg-slate-50 rounded-xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                  <div>
                    <span className="font-bold text-gray-800 block">Booked</span>
                    <span className="text-[10px] text-gray-400">{selectedBooking.timeline?.booked || selectedBooking.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    selectedBooking.timeline?.pickedUp ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>✓</div>
                  <div>
                    <span className="font-bold text-gray-800 block">Picked Up</span>
                    <span className="text-[10px] text-gray-400">{selectedBooking.timeline?.pickedUp || 'Pending pickup'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    selectedBooking.status === 'Delivered' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>✓</div>
                  <div>
                    <span className="font-bold text-gray-800 block">Delivered</span>
                    <span className="text-[10px] text-gray-400">{selectedBooking.timeline?.delivered || 'In progress'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Actions (Screenshot 4) */}
          <div className="p-5 border-t border-gray-100 bg-white space-y-2">
            {(!selectedBooking.riderName && !(selectedBooking as any).assignedRiderName) && (
              <button
                onClick={() => handleOpenAssignModal(selectedBooking)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Assign Courier Rider</span>
              </button>
            )}

            {/* Record Payment / Set Price Drawer Action */}
            <button
              onClick={() => handleOpenPaymentModal(selectedBooking)}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>{selectedBooking.paymentStatus === 'Paid' ? `Update Payment (₦${(selectedBooking.amount || 0).toLocaleString()})` : 'Record Payment / Set Price'}</span>
            </button>

            <button
              onClick={() => {
                const nextPayment = selectedBooking.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid';
                onUpdateBooking(selectedBooking.ref, { paymentStatus: nextPayment as any });
                onShowToast(`Booking marked as ${nextPayment}.`);
              }}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span>{selectedBooking.paymentStatus === 'Paid' ? 'Mark as Unpaid' : 'Quick Mark as Paid'}</span>
            </button>

            <button
              onClick={() => onViewInvoice(selectedBooking)}
              className="w-full py-2.5 px-4 bg-white hover:bg-red-50/50 border border-red-200 text-bbd-red font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>View Invoice</span>
            </button>

            <button
              onClick={() => {
                setDeletingBooking(selectedBooking);
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Booking Record</span>
            </button>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal (Industry Standard: Log Reason & Free Rider) */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setCancellingBooking(null)}
              className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full font-mono">
                  {cancellingBooking.ref}
                </span>
                <h3 className="text-base font-black text-gray-900 mt-0.5">Cancel Parcel Booking</h3>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Cancelling will update status to <strong className="text-gray-900">Cancelled</strong>, detach any assigned rider, and record an audit trail event.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Reason for Cancellation *
                </label>
                <select
                  value={cancelPresetReason}
                  onChange={(e) => setCancelPresetReason(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bbd-navy/20 bg-white font-medium text-gray-800"
                >
                  <option value="Customer requested cancellation">Customer requested cancellation</option>
                  <option value="Duplicate booking order">Duplicate booking order</option>
                  <option value="Sender / Receiver unreachable">Sender / Receiver unreachable</option>
                  <option value="Prohibited or hazardous package item">Prohibited or hazardous package item</option>
                  <option value="Pricing / Payment dispute">Pricing / Payment dispute</option>
                  <option value="Test / Demo booking cleanup">Test / Demo booking cleanup</option>
                  <option value="Other">Other (Type custom reason below)</option>
                </select>
              </div>

              {cancelPresetReason === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Custom Justification *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={customCancelReason}
                    onChange={(e) => setCustomCancelReason(e.target.value)}
                    placeholder="Enter detailed reason..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bbd-navy/20 text-xs text-gray-800 resize-none"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCancellingBooking(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCancel}
                  className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  {isSubmittingCancel ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Ban className="w-3.5 h-3.5" />
                  )}
                  <span>Cancel Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safeguarded Delete Booking Modal (Industry Standard: Only Pending / Cancelled) */}
      {deletingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-gray-900 mb-1">Delete Booking Record?</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Are you sure you want to permanently delete booking <strong className="text-gray-900 font-mono">{deletingBooking.ref}</strong>? This removes it permanently from the database.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingBooking(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
              >
                Keep Record
              </button>
              <button
                type="button"
                disabled={isSubmittingDelete}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                {isSubmittingDelete ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Courier Rider Modal */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 my-8 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Courier Dispatch</span>
                <h3 className="text-base font-extrabold text-gray-900">
                  Assign Rider to <span className="font-mono text-bbd-navy">{assigningBooking.ref}</span>
                </h3>
              </div>
              <button
                onClick={() => setAssigningBooking(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery Route Recap */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 mb-4 text-xs border border-slate-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Pickup</span>
                  <p className="font-semibold text-gray-800">{assigningBooking.pickupLocation || (assigningBooking as any).pickupAddress || 'Lagos'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 border-t border-gray-200/60 pt-2">
                <MapPin className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Drop-off Destination</span>
                  <p className="font-semibold text-gray-800">{assigningBooking.dropoffLocation || (assigningBooking as any).deliveryAddress || 'Lagos'}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
              {/* Rider Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Active Courier Rider *
                </label>
                {riders.filter(r => r.status === 'Active').length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                    No active riders available in database. Please create or activate a rider in the Riders tab first.
                  </div>
                ) : (
                  <select
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bbd-navy/20 bg-white font-semibold text-gray-800"
                  >
                    <option value="">-- Choose Courier Rider --</option>
                    {riders.filter(r => r.status === 'Active').map(r => (
                      <option key={r.riderId || r.id} value={r.riderId}>
                        {r.name} ({r.vehicleType || 'Motorcycle'}) • {r.phone} • {r.assignedDeliveries || 0} active orders
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Dispatch Note */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Dispatch Instructions / Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  placeholder="e.g. Fragile package, call sender 15 mins before arriving at pickup..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bbd-navy/20 text-xs text-gray-800 resize-none"
                />
              </div>

              {/* Rider Email Notification Alert Banner */}
              <div className="flex items-center gap-2 p-3 bg-blue-50/90 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse flex-shrink-0" />
                <span>An instant courier dispatch email notification with pickup/dropoff addresses, customer phone contacts, and package manifest will be automatically sent to the assigned rider's email.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAssigningBooking(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAssign || !selectedRiderId || riders.filter(r => r.status === 'Active').length === 0}
                  className="px-5 py-2 bg-[#0B1B3D] hover:bg-[#07132c] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {isSubmittingAssign ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>Confirm Rider Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment & Set Price Modal */}
      {paymentModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setPaymentModalBooking(null)}
              className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full font-mono">
                  {paymentModalBooking.ref}
                </span>
                <h3 className="text-base font-black text-gray-900 mt-0.5">Record Payment & Confirm Price</h3>
              </div>
            </div>

            {/* Quick Context Summary */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-bold text-gray-900">{paymentModalBooking.customerName} ({paymentModalBooking.customerPhone})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Route:</span>
                <span className="font-semibold text-gray-700 truncate max-w-[200px]">
                  {paymentModalBooking.pickupLocation || 'Pickup'} &rarr; {paymentModalBooking.dropoffLocation || 'Dropoff'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-gray-500">Current Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  paymentModalBooking.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {paymentModalBooking.paymentStatus} {paymentModalBooking.amount > 0 ? `(₦${paymentModalBooking.amount.toLocaleString()})` : '(Price Pending)'}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Amount / Delivery Fee (₦) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">₦</span>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={modalPaymentAmount}
                    onChange={(e) => setModalPaymentAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-bold text-gray-900"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  This amount will set the booking's delivery fee and show in the Bookings table and invoice.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={modalPaymentMethod}
                    onChange={(e) => setModalPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white font-medium text-gray-800"
                  >
                    <option value="Bank Transfer">Bank Transfer (Admin Account)</option>
                    <option value="Cash">Direct Cash (Admin/Office)</option>
                    <option value="POS">POS Terminal</option>
                    <option value="Card">Online Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Payment Status
                  </label>
                  <select
                    value={modalPaymentStatus}
                    onChange={(e) => setModalPaymentStatus(e.target.value as 'Paid' | 'Pending')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white font-medium text-gray-800"
                  >
                    <option value="Paid">Paid (Confirmed)</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Internal Notes / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={modalPaymentNotes}
                  onChange={(e) => setModalPaymentNotes(e.target.value)}
                  placeholder="e.g. Confirmed via Stanbic Bank alert"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs text-gray-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalBooking(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRecordPayment || !modalPaymentAmount}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {isSubmittingRecordPayment ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save & Record Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  UserX, 
  Search, 
  Calendar, 
  ChevronDown, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowUpRight, 
  Ban, 
  Send, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { Customer } from '../types';

interface CustomersTabProps {
  customers: Customer[];
  onUpdateCustomer?: (id: string, updates: Partial<Customer>) => Promise<boolean> | void;
  onDeleteCustomer?: (id: string) => Promise<boolean> | void;
  onShowToast: (msg: string) => void;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({ 
  customers, 
  onUpdateCustomer, 
  onDeleteCustomer, 
  onShowToast 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'bookings' | 'payments'>('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete / Anonymize Modal State
  const [deleteTargetCustomer, setDeleteTargetCustomer] = useState<Customer | null>(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);

  const handleConfirmDeleteCustomer = async () => {
    if (!deleteTargetCustomer) return;
    setIsDeletingCustomer(true);
    try {
      if (onDeleteCustomer) {
        await onDeleteCustomer(deleteTargetCustomer.customerId || deleteTargetCustomer.id);
      }
      setDeleteTargetCustomer(null);
    } finally {
      setIsDeletingCustomer(false);
    }
  };

  // Filter customers safely
  const filteredCustomers = customers.filter(c => {
    if (!c) return false;
    const name = (c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || '');
    const customerId = (c.customerId || c.id || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();

    const matchesSearch = 
      name.includes(search) ||
      email.includes(search) ||
      phone.includes(searchTerm) ||
      customerId.includes(search);
    const matchesStatus = statusFilter === 'All Status' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Dynamic metrics calculated purely from live database customers
  const totalCustomersCount = customers.length;
  const activeCustomersCount = customers.filter(c => c.status === 'Active').length;
  const newThisPeriodCount = customers.length;
  const inactiveCustomersCount = customers.filter(c => c.status === 'Inactive').length;

  return (
    <div className="space-y-6 relative">
      {/* Top Header & Date Filter (Screenshot 6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customers</h1>
          <p className="text-xs text-gray-500 font-medium">Manage your customers, view their booking history and account details.</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-sm text-xs font-semibold text-gray-700 cursor-pointer hover:border-gray-300">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Oct 28, 2026 - Nov 28, 2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
        </div>
      </div>

      {/* 4 Stat KPI Cards (Live Database Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Total Customers</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{totalCustomersCount}</span>
            <span className="text-xs font-bold text-emerald-600">Active DB</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Registered & booking senders</span>
        </div>

        {/* Active Customers */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Active Customers</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{activeCustomersCount}</span>
            <span className="text-xs font-bold text-emerald-600">Verified</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Active account status</span>
        </div>

        {/* New This Period */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">New This Period</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{newThisPeriodCount}</span>
            <span className="text-xs font-bold text-emerald-600">Real-time</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Recent shippers on platform</span>
        </div>

        {/* Inactive Customers */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Inactive Customers</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{inactiveCustomersCount}</span>
            <span className="text-xs font-bold text-gray-400">0</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Suspended or dormant</span>
        </div>
      </div>

      {/* Main Customers Table Card (Screenshot 6) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative rounded-xl border border-gray-200 focus-within:border-bbd-navy text-xs flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone number or customer ID..."
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
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <select className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl focus:outline-none cursor-pointer">
              <option>All Customers</option>
            </select>

            <select className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl focus:outline-none cursor-pointer">
              <option>All Time</option>
            </select>

            <button
              onClick={() => onShowToast('Filters applied.')}
              className="px-3.5 py-2 bg-[#0B1B3D] text-white text-xs font-bold rounded-xl hover:bg-[#07132c] shadow-sm transition-all"
            >
              Apply
            </button>

            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('All Status'); }}
              className="px-3.5 py-2 bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-gray-500 uppercase text-[10px] tracking-wider font-bold border-b border-gray-100">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input type="checkbox" className="rounded border-gray-300 text-bbd-navy" />
                </th>
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Customer Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Phone Number</th>
                <th className="py-3 px-3 text-center">Total Bookings</th>
                <th className="py-3 px-3">Total Spent</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Joined</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400 font-medium text-xs">
                    No customers found in database. Customer accounts will automatically appear from bookings.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c, idx) => (
                  <tr 
                    key={c.id || c.customerId || idx}
                    className={`hover:bg-slate-50 transition-colors ${selectedCustomer?.customerId === c.customerId ? 'bg-blue-50/60' : ''}`}
                  >
                    <td className="py-3.5 px-3">
                      <input type="checkbox" className="rounded border-gray-300 text-bbd-navy" />
                    </td>
                    <td className="py-3.5 px-3 text-gray-400 font-semibold">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-gray-700 font-bold flex items-center justify-center text-[10px]">
                          {(c.name || 'Customer').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block leading-tight">{c.name || 'Customer'}</span>
                          <span className="text-[10px] font-mono text-gray-400">{c.customerId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-gray-600">{c.email || '—'}</td>
                    <td className="py-3.5 px-3 text-gray-500">{c.phone || '—'}</td>
                    <td className="py-3.5 px-3 text-gray-800 font-semibold text-center">{c.totalBookings || 0}</td>
                    <td className="py-3.5 px-3 font-bold text-gray-900">₦{Number(c.totalSpent || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-600'
                      }`}>
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-gray-400 text-[11px]">{c.joinedDate || 'Recent'}</td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. Blacklist / Reactivate Icon Button */}
                        <button
                          onClick={() => {
                            const nextStatus = c.status === 'Active' ? 'Blacklisted' : 'Active';
                            if (onUpdateCustomer) {
                              onUpdateCustomer(c.customerId || c.id, { status: nextStatus as any });
                            }
                            onShowToast(`Customer ${c.name} is now ${nextStatus}.`);
                          }}
                          className={`p-1.5 rounded-lg border transition-all ${
                            c.status === 'Active'
                              ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                          }`}
                          title={c.status === 'Active' ? 'Blacklist / Deactivate Customer' : 'Reactivate Customer'}
                        >
                          {c.status === 'Active' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>

                        {/* 2. Safeguarded Delete / NDPR Anonymize Icon Button */}
                        <button
                          onClick={() => setDeleteTargetCustomer(c)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-all"
                          title="Delete / Anonymize Customer Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* 3. View Customer Details */}
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-gray-700 text-[10px] font-bold rounded-lg transition-all"
                          title="View Details"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Showing 1 - {paginatedCustomers.length} of {filteredCustomers.length} customers</span>
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

      {/* Slide-over Customer Details Drawer (Screenshot 6) */}
      {selectedCustomer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slideLeft">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Customer Details</h3>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-grow space-y-6 text-xs text-gray-700">
            {/* Customer Avatar & Primary Info */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-slate-200 text-gray-700 font-bold flex items-center justify-center text-lg">
                {selectedCustomer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-gray-900">{selectedCustomer.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {selectedCustomer.status}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-gray-400 block">{selectedCustomer.customerId}</span>
                <div className="mt-1 space-y-0.5 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{selectedCustomer.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Joined {selectedCustomer.joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-tabs: Overview, Bookings, Payments */}
            <div className="flex items-center border-b border-gray-200 gap-4 text-xs font-bold">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`pb-2 transition-colors ${selectedTab === 'overview' ? 'text-bbd-navy border-b-2 border-bbd-navy' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedTab('bookings')}
                className={`pb-2 transition-colors ${selectedTab === 'bookings' ? 'text-bbd-navy border-b-2 border-bbd-navy' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Bookings
              </button>
              <button
                onClick={() => setSelectedTab('payments')}
                className={`pb-2 transition-colors ${selectedTab === 'payments' ? 'text-bbd-navy border-b-2 border-bbd-navy' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Payments
              </button>
            </div>

            {/* Overview Content */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Total Bookings</span>
                <span className="text-xl font-black text-gray-900">{selectedCustomer.totalBookings}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Total Spent</span>
                <span className="text-xl font-black text-gray-900">₦{selectedCustomer.totalSpent.toLocaleString()}</span>
              </div>
            </div>

            {/* Last booking callout */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">Last Booking</span>
                <span className="font-semibold">{selectedCustomer.lastBookingDate || 'Nov 25, 2026'} ({selectedCustomer.lastBookingRef || 'BBD-20261028-012'})</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full">Completed</span>
            </div>

            {/* Recent Bookings List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-gray-900 text-xs">Recent Bookings</h5>
                <span className="text-blue-600 font-semibold cursor-pointer text-[11px] flex items-center gap-0.5">
                  View All <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-gray-900 block">BBD-20261028-012</span>
                    <span className="text-[10px] text-gray-400">Nov 25, 2026 • Delivered</span>
                  </div>
                  <span className="font-bold text-gray-900">₦5,000</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-gray-900 block">BBD-20261027-011</span>
                    <span className="text-[10px] text-gray-400">Nov 23, 2026 • Paid</span>
                  </div>
                  <span className="font-bold text-gray-900">₦4,500</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-gray-900 block">BBD-20261026-009</span>
                    <span className="text-[10px] text-gray-400">Nov 20, 2026 • Delivered</span>
                  </div>
                  <span className="font-bold text-gray-900">₦6,200</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Screenshot 6) */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h5 className="font-bold text-gray-900 text-xs mb-2">Quick Actions</h5>

              <button
                onClick={() => onShowToast(`Viewing profile of ${selectedCustomer.name}`)}
                className="w-full py-2.5 px-3 bg-[#0B1B3D] text-white font-bold rounded-xl text-xs hover:bg-[#07132c] transition-all flex items-center justify-center gap-2"
              >
                <span>View Full Profile</span>
              </button>

              <button
                onClick={() => onShowToast(`Opening booking history for ${selectedCustomer.name}`)}
                className="w-full py-2.5 px-3 bg-slate-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <span>View Booking History</span>
              </button>

              <button
                onClick={() => onShowToast(`Message window opened for ${selectedCustomer.email}`)}
                className="w-full py-2.5 px-3 bg-slate-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>

              <button
                onClick={() => {
                  onShowToast(`Customer ${selectedCustomer.name} has been blocked.`);
                  setSelectedCustomer(null);
                }}
                className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Block Customer</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Safeguarded Delete Customer Modal (Industry Standard: NDPR Right-to-Erasure & Accounting Preservation) */}
      {deleteTargetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-gray-900 mb-1">Delete Customer Account?</h3>
            <p className="text-xs text-gray-600 font-semibold mb-2">
              {deleteTargetCustomer.name} (<span className="font-mono">{deleteTargetCustomer.customerId}</span>)
            </p>

            {deleteTargetCustomer.totalBookings > 0 ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-left text-[11px] text-blue-900 mb-4 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>NDPR Data Privacy & Accounting Protection:</span>
                </div>
                <p>
                  This customer has <strong>{deleteTargetCustomer.totalBookings}</strong> delivery records. Their personal identity (phone, email) will be anonymized and erased, while financial ledgers remain preserved for statutory compliance.
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                This customer has no completed delivery history and will be permanently removed from MongoDB.
              </p>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetCustomer(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingCustomer}
                onClick={handleConfirmDeleteCustomer}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                {isDeletingCustomer ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{deleteTargetCustomer.totalBookings > 0 ? 'Erase & Archive' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

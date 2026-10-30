import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  Clock, 
  DollarSign, 
  Search, 
  Download, 
  MoreVertical, 
  ArrowRight, 
  UserPlus, 
  ShieldCheck, 
  Calendar,
  ChevronDown,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Key,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { Booking, PortalTab, Rider } from '../types';
import { useNigerianGreeting } from '../timeGreeting';

interface DashboardTabProps {
  bookings: Booking[];
  onViewBooking: (booking: Booking) => void;
  onNavigateTab: (tab: PortalTab) => void;
  onCreateRider: (rider: Partial<Rider> & { password?: string; plateNumber?: string }) => Promise<any> | void;
  onCreateUser: (user: { name: string; email: string; role: 'Admin' | 'Support' | 'Finance' }) => void;
  onShowToast: (msg: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  bookings,
  onViewBooking,
  onNavigateTab,
  onCreateRider,
  onCreateUser,
  onShowToast
}) => {
  const { greeting, timeFormatted } = useNigerianGreeting();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateRange] = useState('Oct 28, 2026 - Nov 28, 2026');

  // Quick form states
  const [riderName, setRiderName] = useState('');
  const [riderEmail, setRiderEmail] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [riderVehicle, setRiderVehicle] = useState('Select vehicle type');
  const [riderPassword, setRiderPassword] = useState('');
  const [showRiderPassword, setShowRiderPassword] = useState(false);
  const [isSubmittingRider, setIsSubmittingRider] = useState(false);

  // Credentials dialog states
  const [createdCredentials, setCreatedCredentials] = useState<{
    riderId: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    loginUrl?: string;
  } | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerateRiderPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789#$';
    let pass = 'BBD@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRiderPassword(pass);
    setShowRiderPassword(true);
    onShowToast('Secure temporary password generated.');
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
    onShowToast(`Copied ${fieldName} to clipboard!`);
  };

  const copyFullDispatchMessage = () => {
    if (!createdCredentials) return;
    const portalUrl = createdCredentials.loginUrl || `${window.location.origin}/rider`;
    const message = `🚴 *WELCOME TO BBD MOBILITY FLEET, ${createdCredentials.name.toUpperCase()}!*

Your official Courier Rider Account is now activated. Please find your login details below:

• *Rider ID:* ${createdCredentials.riderId}
• *Login Portal:* ${portalUrl}
• *Login Username:* ${createdCredentials.riderId} (or ${createdCredentials.phone})
• *Password:* ${createdCredentials.password || '(use existing)'}

*Next Steps:*
1. Open the portal: ${portalUrl}
2. Log in using your Rider ID and Password.
3. Keep your phone active to receive assigned pickups and deliveries.
4. Always request and verify the receiver's 6-digit OTP before completing delivery.

Dispatch Support Hotline: 0708 753 1148`;

    navigator.clipboard.writeText(message);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 3000);
    onShowToast('Full WhatsApp/SMS message copied! Send to rider.');
  };

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'Admin' | 'Support' | 'Finance'>('Admin');

  // Dynamic metrics calculated purely from live database bookings
  const totalBookingsCount = bookings.length;
  const completedDeliveriesCount = bookings.filter(b => b.status === 'Delivered').length;
  const pendingDeliveriesCount = bookings.filter(b => b.status !== 'Delivered' && b.status !== 'Cancelled').length;
  const totalRevenueAmount = bookings.reduce((sum, b) => sum + (b.paymentStatus === 'Paid' ? Number(b.amount || (b as any).totalAmount || 0) : 0), 0);

  // Filter bookings safely with fallbacks
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
    return matchesSearch && matchesStatus;
  }).slice(0, 10);

  const handleExport = () => {
    const headers = ['Ref', 'Customer', 'Phone', 'Pickup', 'Dropoff', 'Amount', 'Status', 'Payment'];
    const rows = filteredBookings.map(b => [
      b.ref || '',
      `"${b.customerName || (b as any).senderName || 'Customer'}"`,
      b.customerPhone || (b as any).senderPhone || '',
      `"${b.pickupLocation || (b as any).pickupAddress || ''}"`,
      `"${b.dropoffLocation || (b as any).deliveryAddress || ''}"`,
      Number(b.amount || (b as any).totalAmount || 5000),
      b.status || 'Pending',
      b.paymentStatus || 'Unpaid'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bbd_bookings_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Bookings exported to CSV successfully.');
  };

  const handleCreateRiderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderName || !riderEmail || !riderPhone) return;

    setIsSubmittingRider(true);
    try {
      const res = await onCreateRider({
        name: riderName,
        email: riderEmail,
        phone: riderPhone,
        vehicleType: riderVehicle === 'Select vehicle type' ? 'Motorcycle' : riderVehicle,
        password: riderPassword.trim() || undefined,
        status: 'Active',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });

      if (res && res.credentials) {
        setCreatedCredentials(res.credentials);
        setRiderName('');
        setRiderEmail('');
        setRiderPhone('');
        setRiderPassword('');
        setRiderVehicle('Select vehicle type');
        onShowToast(`Rider ${riderName} registered!`);
      } else {
        setRiderName('');
        setRiderEmail('');
        setRiderPhone('');
        setRiderPassword('');
        setRiderVehicle('Select vehicle type');
        onShowToast('New rider created successfully.');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Failed to create rider.');
    } finally {
      setIsSubmittingRider(false);
    }
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) return;
    onCreateUser({
      name: userName,
      email: userEmail,
      role: userRole
    });
    setUserName('');
    setUserEmail('');
    onShowToast('New staff user account created.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Date Filter (Screenshot 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {greeting}, Admin
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {timeFormatted} WAT
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Overview of your deliveries and operations</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-sm text-xs font-semibold text-gray-700 cursor-pointer hover:border-gray-300">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{dateRange}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
        </div>
      </div>

      {/* 4 Stat KPI Cards (Live Database Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500">Total Bookings</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{totalBookingsCount}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">Live</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Total customer bookings</span>
        </div>

        {/* Completed Deliveries */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500">Completed Deliveries</span>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{completedDeliveriesCount}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">Verified</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Successfully delivered via OTP</span>
        </div>

        {/* Pending Deliveries */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500">Pending Deliveries</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{pendingDeliveriesCount}</span>
            <span className="text-xs font-bold text-amber-600 flex items-center">Active</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Awaiting pickup or transit</span>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">₦{totalRevenueAmount.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">Settled</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">From confirmed payments</span>
        </div>
      </div>

      {/* Recent Bookings Section (Screenshot 3) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Section Header & Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Bookings</h2>
            <p className="text-xs text-gray-500">View and manage all delivery bookings</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative rounded-xl border border-gray-200 focus-within:border-bbd-navy text-xs w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by reference, customer or phone..."
                className="w-full pl-9 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer"
              >
                <option>All Status</option>
                <option>Delivered</option>
                <option>In Transit</option>
                <option>Picked Up</option>
                <option>Pending</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0B1B3D] text-white text-xs font-bold rounded-xl hover:bg-[#07132c] shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-gray-500 uppercase text-[10px] tracking-wider font-bold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Pickup Location</th>
                <th className="py-3 px-4">Drop-off Location</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400 font-medium text-xs">
                    No bookings found in database. New customer bookings will appear here in real-time.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b, idx) => {
                const displayName = b.customerName || (b as any).senderName || 'Customer';
                const displayPhone = b.customerPhone || (b as any).senderPhone || '—';
                const displayPickup = b.pickupLocation || (b as any).pickupAddress || '—';
                const displayDropoff = b.dropoffLocation || (b as any).deliveryAddress || '—';
                const displayAmount = Number(b.amount ?? (b as any).totalAmount ?? (b as any).deliveryFee ?? 5000);

                return (
                  <tr key={b.id || b.ref || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-gray-400 font-semibold">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{b.ref}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">{displayName}</td>
                    <td className="py-3.5 px-4 text-gray-500">{displayPhone}</td>
                    <td className="py-3.5 px-4 text-gray-600 truncate max-w-[140px]">{displayPickup}</td>
                    <td className="py-3.5 px-4 text-gray-600 truncate max-w-[140px]">{displayDropoff}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">₦{displayAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        b.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'In Transit' ? 'bg-sky-100 text-sky-800' :
                        b.status === 'Picked Up' ? 'bg-indigo-100 text-indigo-800' :
                        b.status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        b.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-600'
                      }`}>
                        {b.paymentStatus || 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {(!b.riderName && !(b as any).assignedRiderName && b.status !== 'Delivered' && b.status !== 'Cancelled') ? (
                          <button
                            onClick={() => onViewBooking(b)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm whitespace-nowrap"
                          >
                            Assign Rider
                          </button>
                        ) : (
                          <button
                            onClick={() => onViewBooking(b)}
                            className="px-2.5 py-1 bg-[#0B1B3D] hover:bg-[#07132c] text-white text-[11px] font-bold rounded-lg transition-all shadow-sm"
                          >
                            View
                          </button>
                        )}
                        <button 
                          onClick={() => onViewBooking(b)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Quick Actions, Add New Rider, Add New User (Screenshot 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Quick Actions</h3>

          <button
            onClick={() => onNavigateTab('riders')}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-slate-50 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800 block">Add New Rider</span>
                <span className="text-[11px] text-gray-400">Create a rider account and send login</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-bbd-navy transition-colors" />
          </button>

          <button
            onClick={() => onNavigateTab('users')}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-slate-50 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800 block">Add New User</span>
                <span className="text-[11px] text-gray-400">Create staff account with permissions</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-bbd-navy transition-colors" />
          </button>

          <button
            onClick={() => onNavigateTab('bookings')}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-slate-50 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800 block">View All Bookings</span>
                <span className="text-[11px] text-gray-400">See and manage delivery bookings</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-bbd-navy transition-colors" />
          </button>

          <button
            onClick={() => onNavigateTab('reports')}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-slate-50 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800 block">View Reports</span>
                <span className="text-[11px] text-gray-400">Check earnings & delivery stats</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-bbd-navy transition-colors" />
          </button>
        </div>

        {/* Add New Rider Form Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Add New Rider</h3>
              </div>
              <span className="text-[10px] text-gray-400">Quick Form</span>
            </div>

            <form onSubmit={handleCreateRiderSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  placeholder="Enter rider's full name"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={riderEmail}
                  onChange={(e) => setRiderEmail(e.target.value)}
                  placeholder="Enter rider's email address"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={riderPhone}
                  onChange={(e) => setRiderPhone(e.target.value)}
                  placeholder="Enter rider's phone number"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Vehicle Type</label>
                <select
                  value={riderVehicle}
                  onChange={(e) => setRiderVehicle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white"
                >
                  <option>Select vehicle type</option>
                  <option>Motorcycle</option>
                  <option>Bike</option>
                  <option>Scooter</option>
                  <option>Van</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-gray-600">Password</label>
                  <button
                    type="button"
                    onClick={handleGenerateRiderPassword}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showRiderPassword ? 'text' : 'password'}
                    value={riderPassword}
                    onChange={(e) => setRiderPassword(e.target.value)}
                    placeholder="Enter or auto-generate"
                    className="w-full px-3 py-2 pr-8 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRiderPassword(!showRiderPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showRiderPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Used by rider to log in at /rider. Auto-generated if left blank.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmittingRider}
                className="w-full py-2.5 px-4 bg-[#0B1B3D] hover:bg-[#07132c] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 mt-2"
              >
                {isSubmittingRider ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Rider</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Add New User Form Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Add New User</h3>
              </div>
              <span className="text-[10px] text-gray-400">Staff Account</span>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Role *</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white"
                >
                  <option value="Admin">Admin - Full access to all features</option>
                  <option value="Support">Support - Can view and manage bookings</option>
                  <option value="Finance">Finance - Can view payments and reports</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Role Permissions:</span>
                </div>
                <p>System sends temporary sign-in credentials to user email.</p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#0B1B3D] hover:bg-[#07132c] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 mt-2"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Create User</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Rider Account Created & Credentials Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setCreatedCredentials(null)}
              className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  Account Activated & Saved
                </span>
                <h3 className="text-lg font-black text-gray-900 mt-0.5">Rider Login Credentials</h3>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              New rider account has been created in MongoDB. Please copy or share these credentials with the courier rider. Passwords cannot be retrieved later.
            </p>

            {/* Credential Cards */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs mb-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-gray-500 font-semibold">Rider ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-gray-900 text-sm bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                    {createdCredentials.riderId}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdCredentials.riderId, 'Rider ID')}
                    className="p-1.5 text-gray-500 hover:text-bbd-navy bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Copy Rider ID"
                  >
                    {copiedField === 'Rider ID' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-gray-500 font-semibold">Rider Name</span>
                <span className="font-bold text-gray-900">{createdCredentials.name}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-gray-500 font-semibold">Phone / WhatsApp</span>
                <span className="font-bold text-gray-900">{createdCredentials.phone}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-gray-500 font-semibold">Email</span>
                <span className="font-bold text-gray-900">{createdCredentials.email}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-gray-500 font-semibold">Login Portal URL</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-700 text-[11px] truncate max-w-[180px]">
                    {createdCredentials.loginUrl || `${window.location.origin}/rider`}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdCredentials.loginUrl || `${window.location.origin}/rider`, 'Portal URL')}
                    className="p-1.5 text-gray-500 hover:text-bbd-navy bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Copy Login URL"
                  >
                    {copiedField === 'Portal URL' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>Temporary Password</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-sm">
                    {createdCredentials.password || '••••••••'}
                  </span>
                  {createdCredentials.password && (
                    <button
                      onClick={() => copyToClipboard(createdCredentials.password || '', 'Password')}
                      className="p-1.5 text-gray-500 hover:text-bbd-navy bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Copy Password"
                    >
                      {copiedField === 'Password' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Dispatch Copy Button */}
            <div className="space-y-2.5">
              <button
                onClick={copyFullDispatchMessage}
                className="w-full py-3 px-4 bg-[#0B1B3D] hover:bg-[#07132c] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
              >
                {copiedFull ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedFull ? 'Dispatched Message Copied!' : 'Copy Full WhatsApp / SMS Message'}</span>
              </button>

              <button
                onClick={() => setCreatedCredentials(null)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

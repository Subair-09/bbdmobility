import React, { useState } from 'react';
import { 
  Bike, 
  CheckCircle, 
  PauseCircle, 
  PlayCircle,
  XCircle, 
  Search, 
  Download, 
  Calendar, 
  ChevronDown, 
  UserPlus, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldAlert,
  KeyRound,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  Key,
  Trash2,
  X
} from 'lucide-react';
import { Rider } from '../types';

interface RidersTabProps {
  riders: Rider[];
  onCreateRider: (rider: Partial<Rider> & { password?: string; plateNumber?: string }) => Promise<any> | void;
  onUpdateRider: (id: string, updates: Partial<Rider>) => void;
  onDeleteRider?: (id: string) => Promise<boolean> | void;
  onChangeRiderPassword?: (id: string, newPassword: string) => Promise<{ success: boolean; password?: string; error?: string; message?: string }>;
  onShowToast: (msg: string) => void;
}

export const RidersTab: React.FC<RidersTabProps> = ({
  riders,
  onCreateRider,
  onUpdateRider,
  onDeleteRider,
  onChangeRiderPassword,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleType, setVehicleType] = useState('Select vehicle type');
  const [plateNumber, setPlateNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Change password modal state
  const [passwordRider, setPasswordRider] = useState<Rider | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [updatedPasswordResult, setUpdatedPasswordResult] = useState<{ riderId: string; name: string; phone: string; password: string } | null>(null);

  // Delete modal state
  const [deleteTargetRider, setDeleteTargetRider] = useState<Rider | null>(null);
  const [isDeletingRider, setIsDeletingRider] = useState(false);

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

  const handleAutoGenerateNewPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789#$';
    let pass = 'BBD@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordVal(pass);
    setShowNewPassword(true);
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordRider || !newPasswordVal) return;
    setIsUpdatingPassword(true);
    try {
      if (onChangeRiderPassword) {
        const res = await onChangeRiderPassword(passwordRider.riderId || passwordRider.id, newPasswordVal);
        if (res && res.success) {
          setUpdatedPasswordResult({
            riderId: passwordRider.riderId,
            name: passwordRider.name,
            phone: passwordRider.phone,
            password: newPasswordVal
          });
        }
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleConfirmDeleteRider = async () => {
    if (!deleteTargetRider) return;
    setIsDeletingRider(true);
    try {
      if (onDeleteRider) {
        await onDeleteRider(deleteTargetRider.riderId || deleteTargetRider.id);
      }
      setDeleteTargetRider(null);
    } finally {
      setIsDeletingRider(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789#$';
    let pass = 'BBD@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
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

  // Filter riders safely
  const filteredRiders = riders.filter(r => {
    if (!r) return false;
    const name = (r.name || '').toLowerCase();
    const phone = (r.phone || '');
    const email = (r.email || '').toLowerCase();
    const riderId = (r.riderId || r.id || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();

    const matchesSearch = 
      name.includes(search) ||
      phone.includes(searchTerm) ||
      email.includes(search) ||
      riderId.includes(search);
    const matchesStatus = statusFilter === 'All Status' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRiders.length / itemsPerPage) || 1;
  const paginatedRiders = filteredRiders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedRiders.map(r => r.id || r.riderId));
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email) return;

    setIsSubmitting(true);
    try {
      const res = await onCreateRider({
        name: fullName,
        phone,
        email,
        vehicleType: vehicleType === 'Select vehicle type' ? 'Motorcycle' : vehicleType,
        plateNumber: plateNumber.trim() || undefined,
        password: password.trim() || undefined,
        status: 'Active',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });

      if (res && res.credentials) {
        setCreatedCredentials(res.credentials);
        setFullName('');
        setPhone('');
        setEmail('');
        setPlateNumber('');
        setPassword('');
        setVehicleType('Select vehicle type');
        onShowToast(`Rider ${fullName} account created!`);
      } else if (res && res.rider) {
        onShowToast(`Rider ${fullName} registered with ID ${res.rider.riderId}!`);
        setFullName('');
        setPhone('');
        setEmail('');
        setPlateNumber('');
        setPassword('');
        setVehicleType('Select vehicle type');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Failed to create rider account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Status', 'Assigned', 'Earnings', 'Joined'];
    const rows = filteredRiders.map(r => [
      r.riderId,
      `"${r.name}"`,
      r.phone,
      r.email,
      r.status,
      r.assignedDeliveries,
      r.totalEarnings,
      r.joinedDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bbd_riders_list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Riders exported to CSV.');
  };

  // Dynamic metrics calculated purely from live database riders
  const totalRidersCount = riders.length;
  const activeRidersCount = riders.filter(r => r.status === 'Active').length;
  const onLeaveRidersCount = riders.filter(r => r.status === 'On Leave').length;
  const suspendedRidersCount = riders.filter(r => r.status === 'Suspended').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Date Filter (Screenshot 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Riders</h1>
          <p className="text-xs text-gray-500 font-medium">Manage your delivery riders, track their activity and add new riders.</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-sm text-xs font-semibold text-gray-700 cursor-pointer hover:border-gray-300">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Oct 28, 2026 - Nov 28, 2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
        </div>
      </div>

      {/* 4 Stat KPI Cards (Live Database Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Riders */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Total Riders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bike className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{totalRidersCount}</span>
            <span className="text-xs font-bold text-emerald-600">Fleet</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Registered dispatch riders</span>
        </div>

        {/* Active Riders */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Active Riders</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{activeRidersCount}</span>
            <span className="text-xs font-bold text-emerald-600">Online</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Available for dispatch</span>
        </div>

        {/* On Leave */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">On Leave</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PauseCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{onLeaveRidersCount}</span>
            <span className="text-xs font-bold text-amber-600">Away</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Riders currently on leave</span>
        </div>

        {/* Suspended */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Suspended</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{suspendedRidersCount}</span>
            <span className="text-xs font-bold text-gray-400">0</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Deactivated accounts</span>
        </div>
      </div>

      {/* Main Split: Left Table & Right Add Rider / Quick Actions (Screenshot 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Riders List Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Table Header & Search */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-gray-900">Riders List</h2>

              <div className="flex items-center gap-2 flex-1 max-w-sm justify-end">
                <div className="relative rounded-xl border border-gray-200 focus-within:border-bbd-navy text-xs w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search rider name, phone or email..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-1.5 px-3 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Suspended</option>
                </select>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1B3D] text-white text-xs font-bold rounded-xl hover:bg-[#07132c] shadow-sm transition-all"
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
                    <th className="py-3 px-3 w-8">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === paginatedRiders.length && paginatedRiders.length > 0}
                        className="rounded border-gray-300 text-bbd-navy focus:ring-bbd-navy"
                      />
                    </th>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Rider Name</th>
                    <th className="py-3 px-3">Phone Number</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Assigned Deliveries</th>
                    <th className="py-3 px-3">Total Earnings</th>
                    <th className="py-3 px-3">Joined</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {paginatedRiders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-gray-400 font-medium text-xs">
                        No dispatch riders found in database. Create a rider account using the form below.
                      </td>
                    </tr>
                  ) : (
                    paginatedRiders.map((r, idx) => (
                    <tr key={r.id || r.riderId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(r.id || r.riderId)}
                          onChange={() => handleToggleSelect(r.id || r.riderId)}
                          className="rounded border-gray-300 text-bbd-navy focus:ring-bbd-navy"
                        />
                      </td>
                      <td className="py-3.5 px-3 text-gray-400 font-semibold">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-gray-700 font-bold flex items-center justify-center text-[10px]">
                            {r.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block leading-tight">{r.name}</span>
                            <span className="text-[10px] font-mono text-gray-400">{r.riderId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-gray-600">{r.phone}</td>
                      <td className="py-3.5 px-3 text-gray-500">{r.email}</td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                          r.status === 'On Leave' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-800 font-semibold text-center">{r.assignedDeliveries}</td>
                      <td className="py-3.5 px-3 font-bold text-gray-900">₦{r.totalEarnings.toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-gray-400 text-[11px]">{r.joinedDate}</td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. Suspend / Reactivate Icon Button */}
                          <button
                            onClick={() => {
                              const nextStatus = r.status === 'Active' ? 'Suspended' : 'Active';
                              onUpdateRider(r.riderId, { status: nextStatus as any });
                              onShowToast(`Rider ${r.name} status updated to ${nextStatus}.`);
                            }}
                            className={`p-1.5 rounded-lg border transition-all ${
                              r.status === 'Active'
                                ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200'
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                            }`}
                            title={r.status === 'Active' ? 'Suspend Rider' : 'Reactivate Rider'}
                          >
                            {r.status === 'Active' ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                          </button>

                          {/* 2. Change Password Icon Button */}
                          <button
                            onClick={() => {
                              setPasswordRider(r);
                              setNewPasswordVal('');
                              setShowNewPassword(false);
                              setUpdatedPasswordResult(null);
                            }}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded-lg transition-all"
                            title="Change Rider Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Delete Rider Icon Button */}
                          <button
                            onClick={() => setDeleteTargetRider(r)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-all"
                            title="Delete Rider Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Showing 1 - {paginatedRiders.length} of {filteredRiders.length} riders</span>
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

        {/* Right Column: Add New Rider Form & Quick Actions (Screenshot 5) */}
        <div className="space-y-6">
          {/* Add New Rider Form Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">Add New Rider</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Create a new rider account and assign them to the platform.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter rider's full name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Role *</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white font-medium">
                  <option>Rider</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Vehicle Type *</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white font-medium"
                >
                  <option>Select vehicle type</option>
                  <option>Motorcycle</option>
                  <option>Bike</option>
                  <option>Scooter</option>
                  <option>Van</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Vehicle Plate Number (Optional)</label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="e.g. KJA-829-XP"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy uppercase font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter or auto-generate password"
                    className="w-full px-3 py-2 pr-9 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Rider uses this password to log in at /rider. If left blank, a secure password is generated automatically.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#0B1B3D] hover:bg-[#07132c] disabled:opacity-60 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all mt-4"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Rider Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create & Provision Rider</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Actions Card (Screenshot 5) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Quick Actions</h4>

            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('All Status'); }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-gray-700 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bike className="w-4 h-4 text-blue-600" />
                <span>View all riders</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button 
              onClick={() => {
                setStatusFilter('Suspended');
                onShowToast('Filtering suspended riders.');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-gray-700 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Suspend rider</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button 
              onClick={() => onShowToast('Password reset link sent to selected riders.')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-gray-700 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Reset password</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-gray-700 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export rider list</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
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
                <CheckCircle className="w-6 h-6" />
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
      {/* Change Rider Password Modal */}
      {passwordRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => {
                setPasswordRider(null);
                setUpdatedPasswordResult(null);
              }}
              className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full font-mono">
                  {passwordRider.riderId}
                </span>
                <h3 className="text-base font-black text-gray-900 mt-0.5">Change Rider Password</h3>
              </div>
            </div>

            {updatedPasswordResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Password Updated in Database!</span>
                  </div>
                  <p>New credentials are saved for {updatedPasswordResult.name}.</p>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-200 mt-2 font-mono text-sm font-bold text-gray-900">
                    <span>{updatedPasswordResult.password}</span>
                    <button
                      onClick={() => copyToClipboard(updatedPasswordResult.password, 'New Password')}
                      className="p-1 text-gray-500 hover:text-bbd-navy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const portalUrl = `${window.location.origin}/rider`;
                    const msg = `🚴 *BBD MOBILITY — PASSWORD UPDATED*\n\nHello ${updatedPasswordResult.name},\nYour courier rider portal password has been reset by dispatch administration:\n\n• Rider ID: ${updatedPasswordResult.riderId}\n• Login Portal: ${portalUrl}\n• New Password: ${updatedPasswordResult.password}\n\nPlease login and keep your deliveries up to date.\nHotline: 0708 753 1148`;
                    navigator.clipboard.writeText(msg);
                    onShowToast('WhatsApp message copied to clipboard!');
                  }}
                  className="w-full py-2.5 px-4 bg-[#0B1B3D] hover:bg-[#07132c] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Dispatch Message for Rider</span>
                </button>

                <button
                  onClick={() => {
                    setPasswordRider(null);
                    setUpdatedPasswordResult(null);
                  }}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                <p className="text-xs text-gray-500">
                  Update the login password for <strong className="text-gray-900">{passwordRider.name}</strong>. Rider can log in using this new password immediately at <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">/rider</code>.
                </p>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-gray-700">New Password *</label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateNewPassword}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Auto-Generate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPasswordVal}
                      onChange={(e) => setNewPasswordVal(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 pr-9 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPasswordRider(null)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword || !newPasswordVal}
                    className="flex-1 py-2.5 px-4 bg-[#0B1B3D] hover:bg-[#07132c] disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Save Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Rider Confirmation Modal */}
      {deleteTargetRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-gray-900 mb-1">Delete Courier Rider?</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Are you sure you want to permanently delete rider <strong className="text-gray-900">{deleteTargetRider.name}</strong> (<span className="font-mono">{deleteTargetRider.riderId}</span>)? This removes their account from MongoDB permanently.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetRider(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingRider}
                onClick={handleConfirmDeleteRider}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                {isDeletingRider ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

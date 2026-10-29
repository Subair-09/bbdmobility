import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  UserX, 
  Search, 
  Calendar, 
  ChevronDown, 
  Download, 
  Plus, 
  X, 
  Mail, 
  Phone, 
  Smartphone, 
  Shield, 
  Send, 
  Ban, 
  ChevronLeft, 
  ChevronRight,
  Globe,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  KeyRound,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { PlatformUser } from '../types';

interface UsersTabProps {
  users: PlatformUser[];
  onCreateUser: (user: Partial<PlatformUser>) => void;
  onUpdateUser?: (id: string, updates: Partial<PlatformUser>) => Promise<boolean> | void;
  onDeleteUser?: (id: string) => Promise<boolean> | void;
  onChangeUserPassword?: (id: string, newPassword: string) => Promise<{ success: boolean; password?: string; error?: string; message?: string }>;
  onShowToast: (msg: string) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({ 
  users, 
  onCreateUser, 
  onUpdateUser,
  onDeleteUser,
  onChangeUserPassword,
  onShowToast 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [roleFilter, setRoleFilter] = useState('All Users');
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Change password modal state
  const [passwordUser, setPasswordUser] = useState<PlatformUser | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [updatedPasswordResult, setUpdatedPasswordResult] = useState<{ userId: string; name: string; email: string; password: string } | null>(null);

  // Delete modal state
  const [deleteTargetUser, setDeleteTargetUser] = useState<PlatformUser | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Copy feedback state
  const [copiedPass, setCopiedPass] = useState(false);

  // New user form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Support' | 'Finance'>('Support');

  const handleAutoGenerateUserPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789#$';
    let pass = 'BBD@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordVal(pass);
    setShowNewPassword(true);
  };

  const handleSaveUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser || !newPasswordVal) return;
    setIsUpdatingPassword(true);
    try {
      if (onChangeUserPassword) {
        const res = await onChangeUserPassword(passwordUser.userId || passwordUser.id, newPasswordVal);
        if (res && res.success) {
          setUpdatedPasswordResult({
            userId: passwordUser.userId,
            name: passwordUser.name,
            email: passwordUser.email,
            password: newPasswordVal
          });
        }
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setIsDeletingUser(true);
    try {
      if (onDeleteUser) {
        await onDeleteUser(deleteTargetUser.userId || deleteTargetUser.id);
      }
      setDeleteTargetUser(null);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!u) return false;
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phone || '');
    const userId = (u.userId || u.id || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();

    const matchesSearch = 
      name.includes(search) ||
      email.includes(search) ||
      phone.includes(searchTerm) ||
      userId.includes(search);
    const matchesStatus = statusFilter === 'All Status' || u.status === statusFilter;
    const matchesRole = roleFilter === 'All Users' || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    onCreateUser({
      name: newName,
      email: newEmail,
      phone: newPhone || '+234 800 000 0000',
      role: newRole,
      status: 'Active',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });

    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setShowAddModal(false);
    onShowToast(`User account created for ${newName}.`);
  };

  const handleExport = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Bookings', 'Joined'];
    const rows = filteredUsers.map(u => [
      u.userId,
      `"${u.name}"`,
      u.email,
      u.phone,
      u.role,
      u.status,
      u.totalBookings,
      u.joinedDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bbd_users_list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Users list exported.');
  };

  // Dynamic metrics calculated purely from live database users
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.status === 'Active').length;
  const newThisPeriodCount = users.length;
  const inactiveUsersCount = users.filter(u => u.status !== 'Active').length;

  return (
    <div className="space-y-6 relative">
      {/* Top Header & Date Filter (Screenshot 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Users</h1>
          <p className="text-xs text-gray-500 font-medium">Manage all platform users, view their activity and account details.</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-sm text-xs font-semibold text-gray-700 cursor-pointer hover:border-gray-300">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Oct 28, 2026 - Nov 28, 2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
        </div>
      </div>

      {/* 4 Stat KPI Cards (Live Database Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Total Users</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{totalUsersCount}</span>
            <span className="text-xs font-bold text-emerald-600">Active DB</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Staff accounts in system</span>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Active Users</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{activeUsersCount}</span>
            <span className="text-xs font-bold text-emerald-600">Verified</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Authorized staff access</span>
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
            <span className="text-xs font-bold text-emerald-600">Live</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Recent user provisions</span>
        </div>

        {/* Inactive Users */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Inactive Users</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{inactiveUsersCount}</span>
            <span className="text-xs font-bold text-gray-400">0</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Suspended accounts</span>
        </div>
      </div>

      {/* Main Table Card (Screenshot 7) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative rounded-xl border border-gray-200 focus-within:border-bbd-navy text-xs flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone number or user ID..."
              className="w-full pl-9 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl focus:outline-none cursor-pointer"
            >
              <option>All Users</option>
              <option>Admin</option>
              <option>Support</option>
              <option>Finance</option>
              <option>Customer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl focus:outline-none cursor-pointer"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Suspended</option>
              <option>Inactive</option>
            </select>

            <select className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl focus:outline-none cursor-pointer">
              <option>Registration Date</option>
            </select>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add User</span>
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
                <th className="py-3 px-3">User Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Phone Number</th>
                <th className="py-3 px-3">User ID</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Total Bookings</th>
                <th className="py-3 px-3">Joined</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400 font-medium text-xs">
                    No staff users found in database. Add new staff user using the button above.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, idx) => (
                  <tr 
                    key={u.id || u.userId}
                    className={`hover:bg-slate-50 transition-colors ${selectedUser?.userId === u.userId ? 'bg-blue-50/60' : ''}`}
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
                          {(u.name || 'User').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block leading-tight">{u.name || 'Staff User'}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{u.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-gray-600">{u.email}</td>
                    <td className="py-3.5 px-3 text-gray-500">{u.phone}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-gray-700">{u.userId}</td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        u.status === 'Suspended' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-gray-800 font-semibold text-center">{u.totalBookings || 0}</td>
                    <td className="py-3.5 px-3 text-gray-400 text-[11px]">{u.joinedDate || 'Recent'}</td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. Suspend / Activate Icon Button */}
                        <button
                          onClick={() => {
                            const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
                            if (onUpdateUser) {
                              onUpdateUser(u.userId || u.id, { status: nextStatus as any });
                            }
                            onShowToast(`User ${u.name} status updated to ${nextStatus}.`);
                          }}
                          className={`p-1.5 rounded-lg border transition-all ${
                            u.status === 'Active'
                              ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                          }`}
                          title={u.status === 'Active' ? 'Suspend Staff User' : 'Reactivate Staff User'}
                        >
                          {u.status === 'Active' ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                        </button>

                        {/* 2. Change Password Icon Button */}
                        <button
                          onClick={() => {
                            setPasswordUser(u);
                            setNewPasswordVal('');
                            setShowNewPassword(false);
                            setUpdatedPasswordResult(null);
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded-lg transition-all"
                          title="Change User Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* 3. Delete User Icon Button */}
                        <button
                          onClick={() => setDeleteTargetUser(u)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-all"
                          title="Delete User Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* 4. View Details */}
                        <button
                          onClick={() => setSelectedUser(u)}
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
          <span>Showing 1 - {paginatedUsers.length} of {filteredUsers.length} users</span>
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

      {/* Slide-over User Details Drawer (Screenshot 7) */}
      {selectedUser && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slideLeft">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">User Details</h3>
            <button
              onClick={() => setSelectedUser(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-grow space-y-6 text-xs text-gray-700">
            {/* User Profile */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-slate-200 text-gray-700 font-bold flex items-center justify-center text-lg">
                {selectedUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-gray-900">{selectedUser.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {selectedUser.status}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-gray-400 block">{selectedUser.role}</span>
                <div className="mt-1 space-y-0.5 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <span>User ID: {selectedUser.userId}</span>
                    <span>•</span>
                    <span>Joined: {selectedUser.joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview / Bookings stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Total Bookings</span>
                <span className="text-xl font-black text-gray-900">{selectedUser.totalBookings}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Total Spent</span>
                <span className="text-xl font-black text-gray-900">₦48,500</span>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Account Status</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {selectedUser.status}
                </span>
                <span className="text-xs text-gray-600 font-medium">Account is in good standing</span>
              </div>
            </div>

            {/* Quick Actions (Screenshot 7) */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h5 className="font-bold text-gray-900 text-xs mb-2">Quick Actions</h5>

              <button
                onClick={() => onShowToast(`Viewing profile of ${selectedUser.name}`)}
                className="w-full py-2.5 px-3 bg-[#0B1B3D] text-white font-bold rounded-xl text-xs hover:bg-[#07132c] transition-all"
              >
                View Full Profile
              </button>

              <button
                onClick={() => onShowToast(`Booking history for ${selectedUser.name}`)}
                className="w-full py-2.5 px-3 bg-slate-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all"
              >
                View Booking History
              </button>

              <button
                onClick={() => onShowToast(`Send message to ${selectedUser.email}`)}
                className="w-full py-2.5 px-3 bg-slate-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>

              <button
                onClick={() => {
                  onShowToast(`User ${selectedUser.name} has been blocked.`);
                  setSelectedUser(null);
                }}
                className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Block User</span>
              </button>
            </div>

            {/* User Information (Screenshot 7) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-[11px] text-gray-600">
              <span className="font-bold text-gray-900 text-xs block mb-1">User Information</span>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <span>Location: {selectedUser.location || 'Lagos, Nigeria'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                <span>Registration Method: {selectedUser.registrationMethod || 'Mobile App'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                <span>Device: {selectedUser.device || 'Android (Samsung)'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change User Password Modal */}
      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => {
                setPasswordUser(null);
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
                  {passwordUser.userId}
                </span>
                <h3 className="text-base font-black text-gray-900 mt-0.5">Change Staff Password</h3>
              </div>
            </div>

            {updatedPasswordResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Password Updated in Database!</span>
                  </div>
                  <p>New credentials saved for {updatedPasswordResult.name}.</p>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-200 mt-2 font-mono text-sm font-bold text-gray-900">
                    <span>{updatedPasswordResult.password}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(updatedPasswordResult.password);
                        setCopiedPass(true);
                        setTimeout(() => setCopiedPass(false), 2000);
                        onShowToast('Password copied to clipboard!');
                      }}
                      className="p-1 text-gray-500 hover:text-bbd-navy"
                    >
                      {copiedPass ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const msg = `🔐 *BBD MOBILITY — STAFF CREDENTIALS UPDATED*\n\nHello ${updatedPasswordResult.name},\nYour internal staff dashboard password has been updated:\n\n• Email / User ID: ${updatedPasswordResult.email} (${updatedPasswordResult.userId})\n• New Password: ${updatedPasswordResult.password}\n• Login URL: ${window.location.origin}/admin\n\nSupport Hotline: 0708 753 1148`;
                    navigator.clipboard.writeText(msg);
                    onShowToast('Staff message copied to clipboard!');
                  }}
                  className="w-full py-2.5 px-4 bg-[#0B1B3D] hover:bg-[#07132c] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Login Message for User</span>
                </button>

                <button
                  onClick={() => {
                    setPasswordUser(null);
                    setUpdatedPasswordResult(null);
                  }}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveUserPassword} className="space-y-4">
                <p className="text-xs text-gray-500">
                  Update the password for staff user <strong className="text-gray-900">{passwordUser.name}</strong> (<span className="font-mono">{passwordUser.email}</span>).
                </p>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-gray-700">New Password *</label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateUserPassword}
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
                    onClick={() => setPasswordUser(null)}
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

      {/* Delete User Confirmation Modal */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-gray-900 mb-1">Delete Staff User?</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Are you sure you want to delete staff account <strong className="text-gray-900">{deleteTargetUser.name}</strong> (<span className="font-mono">{deleteTargetUser.userId}</span>)? This removes their account permanently.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={handleConfirmDeleteUser}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                {isDeletingUser ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white font-medium"
                >
                  <option value="Admin">Admin</option>
                  <option value="Support">Support</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B1B3D] text-white font-bold rounded-xl hover:bg-[#07132c]"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

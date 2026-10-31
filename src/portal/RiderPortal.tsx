import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  CreditCard, 
  User, 
  X, 
  Bell, 
  LogOut, 
  ExternalLink,
  ChevronDown,
  Search,
  RefreshCw,
  Phone,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  Edit2,
  Lock,
  Headphones,
  Check,
  AlertCircle,
  UploadCloud,
  Maximize2
} from 'lucide-react';
import { Booking } from './types';
import { portalApi, normalizeBooking } from './api';
import { useNigerianGreeting } from './timeGreeting';

interface RiderPortalProps {
  riderData: {
    riderId: string;
    name: string;
    phone: string;
    email?: string;
  };
  onLogout: () => void;
  onNavigateHome: () => void;
}

export function RiderPortal({ riderData, onLogout, onNavigateHome }: RiderPortalProps) {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'deliveries' | 'profile'>('dashboard');
  const [isOnline, setIsOnline] = useState(true);
  const [deliveries, setDeliveries] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [paymentFilter, setPaymentFilter] = useState('All Payment Status');
  
  // Verification Modal state
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  // Assignment Acceptance & Proof Photos (Cloudinary)
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [pickupPhotoPreview, setPickupPhotoPreview] = useState<string | null>(null);
  const [deliveryPhotoPreview, setDeliveryPhotoPreview] = useState<string | null>(null);
  const [isUploadingPickup, setIsUploadingPickup] = useState(false);
  const [isUploadingDelivery, setIsUploadingDelivery] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string } | null>(null);

  // Profile edit states
  const [riderName] = useState(riderData.name || 'Rider');
  const [riderPhone] = useState(riderData.phone || '+234 708 753 1148');
  const [riderEmail] = useState(riderData.email || 'rider@bbdmobility.com');
  const [nextOfKin] = useState('Next of Kin (Not specified)');

  // Change password states
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Dynamic Nigerian Time greeting (WAT, UTC+1)
  const { greeting, timeFormatted } = useNigerianGreeting();

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Welcome greeting on login
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('bbd_rider_just_logged_in');
    if (justLoggedIn) {
      sessionStorage.removeItem('bbd_rider_just_logged_in');
      showToast(`${greeting}, ${riderName.split(' ')[0]}! Welcome to your delivery dashboard.`);
    }
  }, [greeting, riderName]);

  const loadDeliveries = async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/portal/rider/me/deliveries?riderId=${encodeURIComponent(riderData.riderId)}`);
      let fetched: Booking[] = [];
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.deliveries)) {
          fetched = data.deliveries.map(normalizeBooking);
        }
      } else {
        const all = await portalApi.getBookings();
        fetched = all.filter(b => 
          (b.riderId && b.riderId === riderData.riderId) ||
          (b.riderName && riderData.name && b.riderName.toLowerCase().includes(riderData.name.toLowerCase()))
        );
      }

      setDeliveries(prev => {
        // Detect newly assigned order in real-time
        if (prev.length > 0 && fetched.length > prev.length) {
          const prevRefs = new Set(prev.map(b => b.ref));
          const newOrders = fetched.filter(b => !prevRefs.has(b.ref));
          if (newOrders.length > 0) {
            const first = newOrders[0];
            showToast(`🚨 New Delivery Assigned: ${first.ref}!`);
          }
        }
        return fetched;
      });

      if (!silent) {
        showToast('Deliveries queue refreshed.');
      }
    } catch {
      if (!silent) showToast('Could not refresh deliveries.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries(false);

    // Low-latency live polling every 3.5 seconds
    const interval = setInterval(() => {
      loadDeliveries(true);
    }, 3500);

    // Cross-tab immediate sync event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bbd_latest_booking' || e.key === 'bbd_booking_updated') {
        loadDeliveries(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [riderData.riderId]);

  // Filtered deliveries
  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = 
      d.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d as any).senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d as any).pickupAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || d.status === statusFilter;
    const matchesPayment = paymentFilter === 'All Payment Status' || d.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate live stats
  const totalCount = deliveries.length;
  const paidCount = deliveries.filter(d => d.paymentStatus === 'Paid').length;
  const pendingPaymentCount = deliveries.filter(d => d.paymentStatus === 'Pending' || d.paymentStatus === 'Unpaid').length;
  const notPaidCount = Math.max(0, totalCount - paidCount - pendingPaymentCount);
  const paidPct = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;
  const pendingPaymentPct = totalCount > 0 ? Math.round((pendingPaymentCount / totalCount) * 100) : 0;
  const notPaidPct = totalCount > 0 ? Math.max(0, 100 - paidPct - pendingPaymentPct) : 0;

  // Accept Delivery Assignment
  const handleAcceptAssignment = async (bookingRef: string) => {
    setIsAccepting(bookingRef);
    try {
      const res = await portalApi.acceptAssignment(bookingRef, riderData.riderId);
      if (res.success) {
        showToast(`Assignment ${bookingRef} accepted! Proceed to pickup.`);
        setDeliveries(prev => prev.map(d => d.ref === bookingRef ? {
          ...d,
          riderAccepted: true,
          status: 'Accepted' as any,
          timeline: { ...d.timeline, accepted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        } : d));
        if (activeBooking && activeBooking.ref === bookingRef) {
          setActiveBooking(prev => prev ? {
            ...prev,
            riderAccepted: true,
            status: 'Accepted' as any,
            timeline: { ...prev.timeline, accepted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          } : null);
        }
      } else {
        showToast(res.error || 'Failed to accept assignment.');
      }
    } catch {
      showToast('Network error accepting delivery assignment.');
    } finally {
      setIsAccepting(null);
    }
  };

  // Convert image file to base64 data-URL
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'pickup' | 'delivery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('Photo is too large. Please select an image under 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'pickup') {
        setPickupPhotoPreview(base64);
      } else {
        setDeliveryPhotoPreview(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload Proof of Pickup Photo to Cloudinary
  const handleUploadPickupPhoto = async () => {
    if (!activeBooking || !pickupPhotoPreview) return;
    setIsUploadingPickup(true);
    try {
      const res = await portalApi.uploadProofOfPickup(activeBooking.ref, pickupPhotoPreview, riderData.riderId);
      if (res.success && res.url) {
        showToast('Proof of pickup photo uploaded to Cloudinary!');
        const updatedBooking = {
          ...activeBooking,
          pickupPhoto: res.url,
          pickupPhotoUploadedAt: new Date().toISOString(),
          status: 'Picked Up' as const,
        };
        setActiveBooking(updatedBooking);
        setDeliveries(prev => prev.map(d => d.ref === activeBooking.ref ? updatedBooking : d));
        setPickupPhotoPreview(null);
      } else {
        showToast(res.error || 'Failed to upload pickup photo.');
      }
    } catch {
      showToast('Error uploading pickup photo.');
    } finally {
      setIsUploadingPickup(false);
    }
  };

  // Upload Proof of Delivery Photo to Cloudinary
  const handleUploadDeliveryPhoto = async () => {
    if (!activeBooking || !deliveryPhotoPreview) return;
    setIsUploadingDelivery(true);
    try {
      const res = await portalApi.uploadProofOfDelivery(activeBooking.ref, deliveryPhotoPreview, riderData.riderId);
      if (res.success && res.url) {
        showToast('Proof of delivery photo uploaded to Cloudinary!');
        const updatedBooking = {
          ...activeBooking,
          deliveryPhoto: res.url,
          deliveryPhotoUploadedAt: new Date().toISOString(),
        };
        setActiveBooking(updatedBooking);
        setDeliveries(prev => prev.map(d => d.ref === activeBooking.ref ? updatedBooking : d));
        setDeliveryPhotoPreview(null);
      } else {
        showToast(res.error || 'Failed to upload delivery photo.');
      }
    } catch {
      showToast('Error uploading delivery photo.');
    } finally {
      setIsUploadingDelivery(false);
    }
  };

  // OTP Verification Submission
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking || !otpCode || otpCode.length !== 6) {
      setVerifyMessage({ type: 'error', text: 'Please enter the 6-digit verification code.' });
      return;
    }

    setVerifyLoading(true);
    setVerifyMessage(null);

    try {
      const res = await fetch(`/api/portal/bookings/${activeBooking.ref}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: otpCode,
          riderId: riderData.riderId,
          deliveryPhoto: deliveryPhotoPreview || undefined
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setVerifyMessage({ type: 'success', text: 'Delivery confirmed and verified successfully!' });
        showToast('Package marked as Delivered.');
        const updatedBooking: Booking = {
          ...activeBooking,
          status: 'Delivered',
          deliveryPhoto: data.booking?.deliveryPhoto || deliveryPhotoPreview || activeBooking.deliveryPhoto,
          deliveryPhotoUploadedAt: new Date().toISOString()
        };
        setDeliveries(prev => prev.map(d => d.ref === activeBooking.ref ? updatedBooking : d));
        setActiveBooking(updatedBooking);
        setTimeout(() => {
          setActiveBooking(null);
          setOtpCode('');
          setDeliveryPhotoPreview(null);
          setVerifyMessage(null);
        }, 1500);
      } else {
        setVerifyMessage({ type: 'error', text: data.error || 'Incorrect OTP code. Please check with receiver.' });
      }
    } catch {
      setVerifyMessage({ type: 'error', text: 'Network error verifying delivery OTP. Please check your connection and retry.' });
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-bbd-navy flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0B1B3D] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20 animate-slideDown">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-1">
        {/* ===================================================================
            RIDER SIDEBAR (Matching Screenshots 11, 12, 13)
            =================================================================== */}
        <aside className="hidden lg:flex w-64 bg-[#0B1B3D] text-white flex-col justify-between p-4 flex-shrink-0 min-h-screen select-none">
          <div>
            {/* Logo */}
            <div className="px-2 pt-2 pb-6">
              <img 
                src="/assets/logo.png" 
                alt="BBD Mobility" 
                className="h-10 w-auto object-contain brightness-0 invert drop-shadow" 
              />
              <span className="text-[11px] font-semibold text-gray-400 mt-1 block">Move What Matters.</span>
            </div>

            {/* Rider Nav Menu */}
            <nav className="space-y-1">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'dashboard' ? 'bg-bbd-red text-white shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setCurrentTab('deliveries')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'deliveries' ? 'bg-bbd-red text-white shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>My Deliveries</span>
              </button>

              <button
                onClick={() => setCurrentTab('deliveries')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Payment Status</span>
              </button>

              <button
                onClick={() => setCurrentTab('profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'profile' ? 'bg-bbd-red text-white shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </nav>
          </div>

          {/* Bottom Card: Motorcycle widget (Screenshots 11, 12, 13) */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-tr from-[#071329] to-[#122b5e] border border-white/10 p-3 shadow-lg">
              <img 
                src="/assets/portal/sidebar-bike-card.png" 
                alt="BBD Mobility Fleet" 
                className="w-full h-24 object-cover rounded-xl mb-2 mix-blend-luminosity brightness-95" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="text-[11px] font-black text-white leading-tight">
                Ride Safe.
              </div>
              <div className="text-[10px] text-gray-300">
                Deliver More.
              </div>
            </div>

            {/* Rider Profile Card & Logout */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-bbd-navy font-bold flex items-center justify-center text-xs">
                  {riderName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block leading-tight">{riderName}</span>
                  <span className="text-[10px] text-gray-400">Rider</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={onNavigateHome}
                className="text-[11px] text-gray-400 hover:text-white font-semibold flex items-center justify-center gap-1 mx-auto"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Return to Website</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ===================================================================
            MAIN RIDER AREA
            =================================================================== */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar (Screenshots 11, 12, 13) */}
          <header className="bg-white border-b border-gray-200/80 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
                {currentTab === 'profile' ? `Welcome back, ${riderName.split(' ')[0]}!` : `${greeting}, ${riderName.split(' ')[0]}!`}
              </h2>
              <p className="text-xs text-gray-500 font-normal">
                {currentTab === 'profile' ? "Here's your profile information and account settings." : `Here's your delivery overview for today (${timeFormatted} WAT).`}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Live Instant Refresh Button */}
              <button
                onClick={() => loadDeliveries(false)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-slate-50 text-gray-700 font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-60"
                title="Refresh Assigned Deliveries"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#0B1B3D] ${loading ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline text-xs font-bold text-gray-800">
                  {loading ? 'Syncing...' : 'Refresh'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Auto-Sync Active (Low Latency)" />
              </button>

              {/* Notification Bell with Direct Admin Payment Notice Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) setUnreadCount(0);
                  }}
                  className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 relative transition-colors"
                  title="Rider Notifications"
                >
                  <Bell className="w-4 h-4 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-bbd-red text-white text-[8px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-4 text-left space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-bbd-red" />
                        <span className="text-xs font-bold text-gray-900">Rider Notifications</span>
                      </div>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-[11px] font-semibold text-gray-400 hover:text-gray-600"
                      >
                        Close
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto">
                      {/* Direct Admin Payment Rule */}
                      <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Direct Admin Payment Rule</span>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          Customers pay directly to admin. Check your dashboard to confirm payment has been received before handing over any parcel. Do not collect cash.
                        </p>
                        <span className="text-[10px] text-amber-700 font-medium block pt-0.5">Admin Dispatch Notice</span>
                      </div>

                      {/* Active Queue Status */}
                      <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          <span>Active Delivery Queue</span>
                        </div>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          You have {deliveries.length} delivery assignment{deliveries.length === 1 ? '' : 's'} assigned to your queue. Remember to verify the recipient 6-digit OTP at doorstep.
                        </p>
                        <span className="text-[10px] text-blue-700 font-medium block pt-0.5">Live Dispatch</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Online / Offline Status Badge Toggle */}
              <button
                onClick={() => {
                  setIsOnline(!isOnline);
                  showToast(isOnline ? 'You are now Offline.' : 'You are now Online and available for deliveries.');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  isOnline 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                <span>{isOnline ? 'Online' : 'Offline'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </header>

          {/* MAIN TAB CONTENT */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* ===============================================================
                1. RIDER DASHBOARD TAB (Screenshot 11)
                =============================================================== */}
            {currentTab === 'dashboard' && (
              <>
                {/* 4 Stat KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Deliveries */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500">Total Deliveries</span>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{totalCount}</div>
                    <span className="text-[11px] text-gray-400 font-medium mt-1 block">Today • Oct 28, 2026</span>
                  </div>

                  {/* Paid Deliveries */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500">Paid Deliveries</span>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{paidCount}</div>
                    <span className="text-[11px] text-gray-400 font-medium mt-1 block">Completed & Paid</span>
                  </div>

                  {/* Pending Payment */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500">Pending Payment</span>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{pendingPaymentCount}</div>
                    <span className="text-[11px] text-gray-400 font-medium mt-1 block">Delivered • Awaiting Payment</span>
                  </div>

                  {/* Not Paid */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500">Not Paid</span>
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{notPaidCount}</div>
                    <span className="text-[11px] text-gray-400 font-medium mt-1 block">Delivered • Not Yet Paid</span>
                  </div>
                </div>

                {/* Main Split: Left Table & Right Donut Overview (Screenshot 11) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Today's Deliveries Table (2 cols) */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">Today's Deliveries</h3>
                          <p className="text-[11px] text-gray-400">View your current and recent deliveries. Check payment status for each order.</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadDeliveries(false)}
                            disabled={loading}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                            title="Refresh Today's Deliveries"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                          </button>
                          <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600 font-medium">
                            <span>Today</span>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#f8fafc] text-gray-400 uppercase text-[10px] tracking-wider font-bold border-b border-gray-100">
                            <tr>
                              <th className="py-3 px-3">#</th>
                              <th className="py-3 px-3">Reference No.</th>
                              <th className="py-3 px-3">Customer</th>
                              <th className="py-3 px-3">Pickup → Drop-off</th>
                              <th className="py-3 px-3">Amount</th>
                              <th className="py-3 px-3">Payment Status</th>
                              <th className="py-3 px-3">Status</th>
                              <th className="py-3 px-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-700">
                            {deliveries.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="py-10 text-center text-gray-400 font-medium text-xs">
                                  No assigned deliveries found for today. New dispatch orders will appear here automatically.
                                </td>
                              </tr>
                            ) : (
                              deliveries.slice(0, 8).map((d, idx) => (
                                <tr key={d.ref} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-3.5 px-3 text-gray-400 font-semibold">{idx + 1}</td>
                                  <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{d.ref}</td>
                                  <td className="py-3.5 px-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-slate-200 text-gray-700 font-bold flex items-center justify-center text-[10px]">
                                        {(d.customerName || (d as any).senderName || 'C').slice(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-gray-900 block leading-tight">
                                          {d.customerName || (d as any).senderName}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                          {d.customerPhone || (d as any).senderPhone}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-3 text-gray-600 truncate max-w-[140px]">
                                    {d.pickupLocation || (d as any).pickupAddress} → {d.dropoffLocation || (d as any).deliveryAddress}
                                  </td>
                                  <td className="py-3.5 px-3 font-bold text-gray-900">₦{(d.amount || d.deliveryFee || 5000).toLocaleString()}</td>
                                  <td className="py-3.5 px-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      d.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                                      d.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                      'bg-red-50 text-red-600'
                                    }`}>
                                      {d.paymentStatus}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      d.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                      d.status === 'Picked Up' ? 'bg-indigo-100 text-indigo-800' :
                                      d.riderAccepted ? 'bg-teal-100 text-teal-800' :
                                      'bg-amber-100 text-amber-800 animate-pulse'
                                    }`}>
                                      {d.status === 'Delivered' ? 'Completed' :
                                       d.status === 'Picked Up' ? 'Picked Up' :
                                       d.riderAccepted ? 'Accepted' : 'New (Awaiting Accept)'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {!d.riderAccepted && d.status !== 'Delivered' && (
                                        <button
                                          onClick={() => handleAcceptAssignment(d.ref)}
                                          disabled={isAccepting === d.ref}
                                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm flex items-center gap-1"
                                          title="Accept Assignment"
                                        >
                                          {isAccepting === d.ref ? (
                                            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                          ) : (
                                            <Check className="w-2.5 h-2.5" />
                                          )}
                                          <span>Accept</span>
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          setActiveBooking(d);
                                          setPickupPhotoPreview(null);
                                          setDeliveryPhotoPreview(null);
                                        }}
                                        className="px-2.5 py-1 bg-[#0B1B3D] hover:bg-[#07132c] text-white text-[10px] font-bold rounded-lg transition-all shadow-sm"
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
                    </div>

                    <div className="p-3.5 border-t border-gray-100 text-[11px] text-gray-400">
                      Showing 1 - {deliveries.slice(0, 8).length} of {deliveries.length} deliveries
                    </div>
                  </div>

                  {/* Right Column: Donut + Quick Info + Support Card (Screenshot 11) */}
                  <div className="space-y-5">
                    {/* Payment Status Overview Donut Card */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-gray-900">Payment Status Overview</h4>
                      </div>

                      <div className="flex items-center justify-center py-2">
                        <div className="relative w-32 h-32">
                          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                            {totalCount === 0 ? (
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="4.5" />
                            ) : (
                              <>
                                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4.5" strokeDasharray={`${paidPct} ${100 - paidPct}`} strokeDashoffset={0} />
                                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray={`${pendingPaymentPct} ${100 - pendingPaymentPct}`} strokeDashoffset={-(paidPct)} />
                                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="4.5" strokeDasharray={`${notPaidPct} ${100 - notPaidPct}`} strokeDashoffset={-(paidPct + pendingPaymentPct)} />
                              </>
                            )}
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-xl font-black text-gray-900">{totalCount}</span>
                            <span className="text-[9px] text-gray-400 font-semibold uppercase">Total</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Paid
                          </span>
                          <span className="font-bold text-gray-900">{paidCount} ({paidPct}%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending
                          </span>
                          <span className="font-bold text-gray-900">{pendingPaymentCount} ({pendingPaymentPct}%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Not Paid
                          </span>
                          <span className="font-bold text-gray-900">{notPaidCount} ({notPaidPct}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Info Box */}
                    <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1.5 shadow-2xs">
                      <span className="font-extrabold flex items-center gap-1.5 text-amber-900">
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        <span>Direct Admin Payment Policy</span>
                      </span>
                      <p className="text-[11px] text-amber-900 leading-relaxed">
                        Customers pay directly to admin. Check your dashboard to confirm payment has been received before handing over any parcel. Do not collect cash.
                      </p>
                    </div>

                    {/* Keep Going Support Card */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Keep Going!</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Your dedication keeps BBD Mobility moving.</p>
                      </div>
                      <a
                        href="tel:+2347087531148"
                        className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-bbd-navy font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                      >
                        <Headphones className="w-4 h-4 text-blue-600" />
                        <span>Contact Support</span>
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ===============================================================
                2. MY DELIVERIES TAB (Screenshot 12)
                =============================================================== */}
            {currentTab === 'deliveries' && (
              <div className="space-y-6">
                {/* 4 Stat KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <span className="text-xs font-bold text-gray-500 block mb-2">Total Assigned Deliveries</span>
                    <span className="text-2xl font-black text-gray-900">{totalCount}</span>
                    <span className="text-[11px] text-gray-400 font-medium mt-1 block">Today • Oct 28, 2026</span>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <span className="text-xs font-bold text-gray-500 block mb-2">Paid Deliveries</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900">{paidCount}</span>
                      <span className="text-xs font-bold text-emerald-600">{paidPct}%</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium mt-1 block">Completed & Paid</span>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <span className="text-xs font-bold text-gray-500 block mb-2">Pending Payment</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900">{pendingPaymentCount}</span>
                      <span className="text-xs font-bold text-amber-600">{pendingPaymentPct}%</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium mt-1 block">Delivered • Awaiting Payment</span>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <span className="text-xs font-bold text-gray-500 block mb-2">Not Paid</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900">{notPaidCount}</span>
                      <span className="text-xs font-bold text-red-600">{notPaidPct}%</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium mt-1 block">Delivered • Not Yet Paid</span>
                  </div>
                </div>

                {/* Filter and Table Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">My Deliveries</h3>
                      <p className="text-xs text-gray-400">View your assigned deliveries and check payment status for each customer.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700 font-medium">
                        <span>Oct 28, 2026</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <button
                        onClick={() => loadDeliveries(false)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                    <div className="relative rounded-xl border border-gray-200 focus-within:border-bbd-navy text-xs flex-1 min-w-[240px]">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by booking ref, customer name or location..."
                        className="w-full pl-9 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 bg-white rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl focus:outline-none cursor-pointer"
                      >
                        <option>All Status</option>
                        <option>Delivered</option>
                        <option>In Transit</option>
                        <option>Picked Up</option>
                        <option>Assigned</option>
                      </select>

                      <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl focus:outline-none cursor-pointer"
                      >
                        <option>All Payment Status</option>
                        <option>Paid</option>
                        <option>Pending</option>
                        <option>Not Paid</option>
                      </select>

                      <button
                        onClick={() => { setSearchTerm(''); setStatusFilter('All Status'); setPaymentFilter('All Payment Status'); }}
                        className="px-3.5 py-2 bg-[#0B1B3D] text-white text-xs font-bold rounded-xl hover:bg-[#07132c] transition-all"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>

                  {/* Deliveries Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8fafc] text-gray-400 uppercase text-[10px] tracking-wider font-bold border-b border-gray-100">
                        <tr>
                          <th className="py-3 px-3">#</th>
                          <th className="py-3 px-3">Booking Ref</th>
                          <th className="py-3 px-3">Customer</th>
                          <th className="py-3 px-3">Pickup → Drop-off</th>
                          <th className="py-3 px-3">Amount</th>
                          <th className="py-3 px-3">Payment Status</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {filteredDeliveries.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-gray-400 font-medium text-xs">
                              No deliveries match your search or filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredDeliveries.map((d, idx) => (
                            <tr key={d.ref} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3.5 px-3 text-gray-400 font-semibold">{idx + 1}</td>
                              <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{d.ref}</td>
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-200 text-gray-700 font-bold flex items-center justify-center text-[10px]">
                                    {(d.customerName || (d as any).senderName || 'C').slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-900 block leading-tight">
                                      {d.customerName || (d as any).senderName}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {d.customerPhone || (d as any).senderPhone}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-gray-600 truncate max-w-[150px]">
                                {d.pickupLocation || (d as any).pickupAddress} → {d.dropoffLocation || (d as any).deliveryAddress}
                              </td>
                              <td className="py-3.5 px-3 font-bold text-gray-900">₦{(d.amount || d.deliveryFee || 5000).toLocaleString()}</td>
                              <td className="py-3.5 px-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  d.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                                  d.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                  'bg-red-50 text-red-600'
                                }`}>
                                  {d.paymentStatus}
                                </span>
                              </td>
                              <td className="py-3.5 px-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  d.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                  d.status === 'Picked Up' ? 'bg-indigo-100 text-indigo-800' :
                                  d.riderAccepted ? 'bg-teal-100 text-teal-800' :
                                  'bg-amber-100 text-amber-800 animate-pulse'
                                }`}>
                                  {d.status === 'Delivered' ? 'Delivered' :
                                   d.status === 'Picked Up' ? 'Picked Up' :
                                   d.riderAccepted ? 'Accepted' : 'Awaiting Accept'}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {!d.riderAccepted && d.status !== 'Delivered' && (
                                    <button
                                      onClick={() => handleAcceptAssignment(d.ref)}
                                      disabled={isAccepting === d.ref}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-sm flex items-center gap-1"
                                      title="Accept Assignment"
                                    >
                                      {isAccepting === d.ref ? (
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                      <span>Accept</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setActiveBooking(d);
                                      setPickupPhotoPreview(null);
                                      setDeliveryPhotoPreview(null);
                                    }}
                                    className="px-3 py-1 bg-[#0B1B3D] hover:bg-[#07132c] text-white text-[11px] font-bold rounded-xl transition-all shadow-sm flex items-center gap-1"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Details</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-gray-100 text-xs text-gray-400">
                    Showing 1 - {filteredDeliveries.length} of {deliveries.length} deliveries
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                3. RIDER PROFILE TAB (Screenshot 13)
                =============================================================== */}
            {currentTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile Card, Personal Info, Vehicle Info (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Rider Profile Card */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-slate-200 border-2 border-white shadow-md flex items-center justify-center text-2xl font-black text-bbd-navy">
                        {riderName.slice(0, 2).toUpperCase()}
                      </div>
                      <button 
                        onClick={() => showToast('Avatar update modal opened.')}
                        className="absolute bottom-0 right-0 w-6 h-6 bg-[#0B1B3D] text-white rounded-full flex items-center justify-center shadow"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-gray-900">{riderName}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-semibold block">Rider • {riderData.riderId}</span>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 pt-1">
                        <span>{riderPhone}</span>
                        <span>•</span>
                        <span>{riderEmail}</span>
                        <span>•</span>
                        <span>Lagos, Nigeria</span>
                      </div>
                      <span className="text-[11px] text-gray-400 block pt-0.5">Joined: Oct 28, 2026</span>
                    </div>
                  </div>

                  {/* Personal Information Card */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Personal Information</h4>
                        <p className="text-xs text-gray-400">Your basic details.</p>
                      </div>
                      <button 
                        onClick={() => showToast('Personal details editor enabled.')}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Full Name</span>
                        <span className="font-bold text-gray-800 text-sm">{riderName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Phone Number</span>
                        <span className="font-bold text-gray-800 text-sm">{riderPhone}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Email Address</span>
                        <span className="font-bold text-gray-800 text-sm">{riderEmail}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Date of Birth</span>
                        <span className="font-bold text-gray-800 text-sm">12 May 1998</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Address</span>
                        <span className="font-bold text-gray-800 text-sm">Lagos, Nigeria</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Next of Kin</span>
                        <span className="font-bold text-gray-800 text-sm">{nextOfKin}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information Card (Screenshot 13) */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Vehicle Information</h4>
                        <p className="text-xs text-gray-400">Details of your delivery bike.</p>
                      </div>
                      <button 
                        onClick={() => showToast('Vehicle info editor enabled.')}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[11px]">Bike Type</span>
                          <span className="font-bold text-gray-800 text-sm">Motorcycle</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Plate Number</span>
                          <span className="font-bold text-gray-800 text-sm">BBD-{(riderData.riderId || '01').replace(/\D/g, '').padStart(3, '0')}-LG</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Brand</span>
                          <span className="font-bold text-gray-800 text-sm">Honda</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Color</span>
                          <span className="font-bold text-gray-800 text-sm">Red</span>
                        </div>
                      </div>

                      {/* Motorcycle Image Preview matching Screenshot 13 */}
                      <div className="bg-slate-50 rounded-2xl p-3 border border-gray-100 flex items-center justify-center">
                        <img 
                          src="/assets/portal/rider-bike-preview.png" 
                          alt="Rider Honda Motorcycle" 
                          className="max-h-36 w-auto object-contain drop-shadow" 
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Rider Status, Account Details, Change Password (Screenshot 13) */}
                <div className="space-y-6">
                  {/* Rider Status Card */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Rider Status</h4>

                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center space-y-1">
                      <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{isOnline ? 'Online' : 'Offline'}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        {isOnline ? "You're currently online and available for deliveries." : "You're currently offline."}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsOnline(!isOnline);
                        showToast(isOnline ? 'Switched to Offline' : 'Switched to Online');
                      }}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
                    </button>
                  </div>

                  {/* Account Details Card */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3 text-xs">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Account Details</h4>
                    <p className="text-gray-400 text-[11px]">Your login and security information.</p>

                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between py-1.5 border-b border-gray-100">
                        <span className="text-gray-400">Username</span>
                        <span className="font-bold text-gray-800">{riderData.riderId.toLowerCase().replace(/[^a-z0-9]/g, '') || 'rider'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-gray-100">
                        <span className="text-gray-400">Password</span>
                        <span className="font-mono font-bold text-gray-800">••••••••</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                        <span className="text-gray-400">Two-Factor Authentication</span>
                        <span className="font-bold text-gray-500 text-[11px]">Disabled</span>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50/70 rounded-xl text-[11px] text-blue-900 border border-blue-100">
                      For your security, keep your account details private.
                    </div>
                  </div>

                  {/* Change Password Card */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3 text-xs">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Change Password</h4>
                    <p className="text-gray-400 text-[11px]">Keep your account secure.</p>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (newPass.length !== 4 || !/^\d{4}$/.test(newPass)) {
                        showToast('New PIN must be exactly 4 numeric digits.');
                        return;
                      }
                      if (newPass !== confirmPass) {
                        showToast('New 4-digit PINs do not match.');
                        return;
                      }
                      try {
                        const res = await portalApi.riderChangePin(riderData.riderId, newPass, currPass);
                        if (res.success) {
                          showToast('4-digit PIN updated successfully!');
                          setCurrPass('');
                          setNewPass('');
                          setConfirmPass('');
                        } else {
                          showToast(res.error || 'Failed to update PIN.');
                        }
                      } catch {
                        showToast('Error updating PIN.');
                      }
                    }} className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Current 4-Digit PIN</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          required
                          value={currPass}
                          onChange={(e) => setCurrPass(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="••••"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy font-mono text-center tracking-widest font-black"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">New 4-Digit PIN</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          required
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="••••"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy font-mono text-center tracking-widest font-black"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Confirm New 4-Digit PIN</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          required
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="••••"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy font-mono text-center tracking-widest font-black"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={newPass.length !== 4 || confirmPass.length !== 4}
                        className="w-full py-2.5 px-4 bg-[#0B1B3D] hover:bg-[#07132c] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 mt-2"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Update 4-Digit PIN</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Rider Footer */}
          <footer className="border-t border-gray-200/80 bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
            <span>BBD Mobility Rider Portal v1.0.0</span>
            <span>© 2026 BBD Mobility. All rights reserved.</span>
            <span className="font-semibold text-gray-600">Riders Power Our Movement.</span>
          </footer>
        </div>
      </div>

      {/* ===================================================================
          DELIVERY VERIFICATION & OTP DOORSTEP MODAL
          =================================================================== */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 my-8 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-bbd-red uppercase tracking-wider block">Assigned Delivery</span>
                <h3 className="text-base font-extrabold text-gray-900 font-mono">{activeBooking.ref}</h3>
              </div>
              <button
                onClick={() => {
                  setActiveBooking(null);
                  setVerifyMessage(null);
                  setOtpCode('');
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Route & Recipient Card */}
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Pickup Location</span>
                    <p className="font-bold text-gray-800">{activeBooking.pickupLocation || (activeBooking as any).pickupAddress}</p>
                  </div>
                  <a
                    href={`tel:${activeBooking.customerPhone || (activeBooking as any).senderPhone}`}
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center gap-1 font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Sender</span>
                  </a>
                </div>

                <div className="border-t border-gray-200/60 pt-2 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Drop-off Destination</span>
                    <p className="font-bold text-gray-800">{activeBooking.dropoffLocation || (activeBooking as any).deliveryAddress}</p>
                  </div>
                  <a
                    href={`tel:${(activeBooking as any).receiverPhone || activeBooking.customerPhone}`}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-1 font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Receiver</span>
                  </a>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-gray-400 text-[10px] block">Delivery Status</span>
                  <span className="font-extrabold text-sm text-bbd-navy">{activeBooking.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] block">Payment Status</span>
                  <span className={`font-extrabold text-xs px-2.5 py-1 rounded-md inline-block ${
                    activeBooking.paymentStatus === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {activeBooking.paymentStatus === 'Paid' ? '✓ Paid to Admin' : '⚠️ Awaiting Admin Payment'}
                  </span>
                </div>
              </div>

              {/* STEP 1: RIDER ACCEPTANCE CARD */}
              {!activeBooking.riderAccepted && activeBooking.status !== 'Delivered' && activeBooking.status !== 'Cancelled' ? (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">Assignment Pending Your Acceptance</h4>
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        Dispatch admin assigned this booking to you. Please accept this delivery to confirm your route and notify admin in real-time.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptAssignment(activeBooking.ref)}
                    disabled={isAccepting === activeBooking.ref}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isAccepting === activeBooking.ref ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Accept Assignment & Start Delivery</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900">Assignment Accepted by You</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    {activeBooking.timeline?.accepted || 'Confirmed'}
                  </span>
                </div>
              )}

              {/* STEP 2: PROOF OF PICKUP PHOTO (CLOUDINARY) */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-gray-900">1. Proof of Pickup (Photo)</h4>
                  </div>
                  {activeBooking.pickupPhoto && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Stored
                    </span>
                  )}
                </div>

                {activeBooking.pickupPhoto ? (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-200">
                    <img
                      src={activeBooking.pickupPhoto}
                      alt="Proof of Pickup"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-100 cursor-pointer hover:opacity-90"
                      onClick={() => setViewingPhoto({ url: activeBooking.pickupPhoto!, title: `Proof of Pickup - ${activeBooking.ref}` })}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Cloudinary Verified
                      </span>
                      <span className="text-[10px] text-gray-500 block truncate">
                        {activeBooking.pickupPhotoUploadedAt ? new Date(activeBooking.pickupPhotoUploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Uploaded'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewingPhoto({ url: activeBooking.pickupPhoto!, title: `Proof of Pickup - ${activeBooking.ref}` })}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 mt-1"
                      >
                        <Maximize2 className="w-3 h-3" /> View Full Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-500">
                      Snap a photo of the item upon pickup from the sender to verify parcel condition.
                    </p>

                    {pickupPhotoPreview ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border border-blue-200 max-h-44 flex items-center justify-center bg-black/5">
                          <img src={pickupPhotoPreview} alt="Pickup Preview" className="max-h-44 w-auto object-contain rounded-xl" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 py-2 px-3 border border-gray-300 rounded-xl text-center font-bold text-xs text-gray-700 hover:bg-gray-50 cursor-pointer">
                            Retake
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoSelect(e, 'pickup')} />
                          </label>
                          <button
                            type="button"
                            onClick={handleUploadPickupPhoto}
                            disabled={isUploadingPickup}
                            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                          >
                            {isUploadingPickup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                            <span>Upload to Cloudinary</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full py-2.5 px-3 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-bold text-gray-700">
                        <Camera className="w-4 h-4 text-blue-600" />
                        <span>Snap / Upload Pickup Photo</span>
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoSelect(e, 'pickup')} />
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 3: PROOF OF DELIVERY PHOTO (CLOUDINARY) */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-gray-900">2. Proof of Delivery (Photo)</h4>
                  </div>
                  {activeBooking.deliveryPhoto && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Stored
                    </span>
                  )}
                </div>

                {activeBooking.deliveryPhoto ? (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-200">
                    <img
                      src={activeBooking.deliveryPhoto}
                      alt="Proof of Delivery"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-100 cursor-pointer hover:opacity-90"
                      onClick={() => setViewingPhoto({ url: activeBooking.deliveryPhoto!, title: `Proof of Delivery - ${activeBooking.ref}` })}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Cloudinary Verified
                      </span>
                      <span className="text-[10px] text-gray-500 block truncate">
                        {activeBooking.deliveryPhotoUploadedAt ? new Date(activeBooking.deliveryPhotoUploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Delivered'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewingPhoto({ url: activeBooking.deliveryPhoto!, title: `Proof of Delivery - ${activeBooking.ref}` })}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 mt-1"
                      >
                        <Maximize2 className="w-3 h-3" /> View Full Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-500">
                      Take a photo of the parcel handed to receiver or at the doorstep.
                    </p>

                    {deliveryPhotoPreview ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border border-emerald-200 max-h-44 flex items-center justify-center bg-black/5">
                          <img src={deliveryPhotoPreview} alt="Delivery Preview" className="max-h-44 w-auto object-contain rounded-xl" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 py-2 px-3 border border-gray-300 rounded-xl text-center font-bold text-xs text-gray-700 hover:bg-gray-50 cursor-pointer">
                            Retake
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoSelect(e, 'delivery')} />
                          </label>
                          <button
                            type="button"
                            onClick={handleUploadDeliveryPhoto}
                            disabled={isUploadingDelivery}
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                          >
                            {isUploadingDelivery ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                            <span>Upload to Cloudinary</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full py-2.5 px-3 border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-bold text-gray-700">
                        <Camera className="w-4 h-4 text-emerald-600" />
                        <span>Snap / Upload Delivery Photo</span>
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoSelect(e, 'delivery')} />
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Handover Notice: Confirm payment before handing over */}
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                activeBooking.paymentStatus === 'Paid'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border border-amber-200 text-amber-900'
              }`}>
                <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  activeBooking.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                }`} />
                <p className="text-[11px] leading-relaxed">
                  {activeBooking.paymentStatus === 'Paid'
                    ? 'Payment confirmed by Admin. Proceed with handover after verifying recipient OTP.'
                    : 'Customer pays directly to Admin. Confirm payment status in your dashboard before handing over parcel.'}
                </p>
              </div>

              {/* OTP Verification Form */}
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-900">Verify Doorstep Handover</h4>
                    <p className="text-[11px] text-blue-700">
                      Ask recipient for their 6-digit delivery verification OTP code sent to their email.
                    </p>
                  </div>
                </div>

                {verifyMessage && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    verifyMessage.type === 'success' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {verifyMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{verifyMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-blue-950 mb-1">
                      Enter Receiver's 6-Digit OTP *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 849201"
                      className="w-full py-2.5 px-4 text-center tracking-widest text-lg font-mono font-black text-gray-900 bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifyLoading || otpCode.length !== 6}
                    className="w-full py-3 px-4 bg-[#0B1B3D] hover:bg-[#07132c] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {verifyLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify Handover & Complete Delivery</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Report Issue button */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Delivery issue flagged. Admin notified.');
                    setActiveBooking(null);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold"
                >
                  Report an issue (recipient unreachable, address mismatch)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Photo Lightbox Modal */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-[#0B1B3D] text-white rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <span className="font-bold text-sm">{viewingPhoto.title}</span>
              <button 
                onClick={() => setViewingPhoto(null)} 
                className="p-1 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/40 min-h-[300px]">
              <img src={viewingPhoto.url} alt={viewingPhoto.title} className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg" />
            </div>
            <div className="p-3.5 bg-[#07132c] flex items-center justify-between text-xs border-t border-white/10">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cloudinary CDN Secured</span>
              </div>
              <a 
                href={viewingPhoto.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Size</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

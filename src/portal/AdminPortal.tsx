import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { AdminLayout } from './AdminLayout';
import { DashboardTab } from './tabs/DashboardTab';
import { BookingsTab } from './tabs/BookingsTab';
import { RidersTab } from './tabs/RidersTab';
import { CustomersTab } from './tabs/CustomersTab';
import { UsersTab } from './tabs/UsersTab';
import { PaymentsTab } from './tabs/PaymentsTab';
import { ReportsTab } from './tabs/ReportsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { InvoiceModal } from './InvoiceModal';
import { 
  PortalTab, 
  Booking, 
  Rider, 
  Customer, 
  PlatformUser, 
  PaymentRecord, 
  GeneralSettings, 
  AdminNotification 
} from './types';
import { portalApi } from './api';
import { INITIAL_SETTINGS } from './mockData';
import { getNigerianGreeting } from './timeGreeting';

interface AdminPortalProps {
  onLogout: () => void;
  onNavigateHome: () => void;
  initialTab?: PortalTab;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  tabName: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PortalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[PortalErrorBoundary] Caught error in ${this.props.tabName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-2xl p-8 border border-red-100 shadow-sm text-center max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
            !
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Displaying Section</h3>
          <p className="text-xs text-gray-500 mb-4">
            A temporary render error occurred in the {this.props.tabName} view. Your admin session is intact.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-[#0B1B3D] text-white text-xs font-bold rounded-xl hover:bg-[#07132c] shadow transition-all"
          >
            Reload Section
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AdminPortal({ onLogout, onNavigateHome, initialTab = 'dashboard' }: AdminPortalProps) {
  const [currentTab, setCurrentTab] = useState<PortalTab>(initialTab);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [settings, setSettings] = useState<GeneralSettings>(INITIAL_SETTINGS);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // High-performance live refresh handler (manual or automated low-latency background sync)
  const handleRefresh = async (silent: boolean = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [bList, rList, cList, uList, pList, notifData] = await Promise.all([
        portalApi.getBookings(),
        portalApi.getRiders(),
        portalApi.getCustomers(),
        portalApi.getUsers(),
        portalApi.getPayments(),
        portalApi.getNotifications()
      ]);

      if (bList) {
        setBookings(prev => {
          // Instant notification when a brand-new order arrives
          if (prev.length > 0 && bList.length > prev.length) {
            const prevRefs = new Set(prev.map(b => b.ref));
            const newOrders = bList.filter(b => !prevRefs.has(b.ref));
            if (newOrders.length > 0) {
              const latest = newOrders[0];
              showToast(`🚨 New Delivery Order: ${latest.ref} (${latest.customerName})`);
            }
          }
          return bList;
        });

        // Also update currently selected booking if opened in drawer
        if (selectedBooking) {
          const refreshedTarget = bList.find(b => b.ref === selectedBooking.ref);
          if (refreshedTarget) {
            setSelectedBooking(refreshedTarget);
          }
        }
      }

      if (rList) setRiders(rList);
      if (cList) setCustomers(cList);
      if (uList) setUsers(uList);
      if (pList) setPayments(pList);
      if (notifData?.notifications) setNotifications(notifData.notifications);

      if (!silent) {
        showToast('Live database synchronized.');
      }
    } catch (err) {
      if (!silent) {
        showToast('Sync completed with cached data.');
      }
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        const [bList, rList, cList, uList, pList, sObj, notifData] = await Promise.all([
          portalApi.getBookings(),
          portalApi.getRiders(),
          portalApi.getCustomers(),
          portalApi.getUsers(),
          portalApi.getPayments(),
          portalApi.getSettings(),
          portalApi.getNotifications()
        ]);
        setBookings(bList || []);
        setRiders(rList || []);
        setCustomers(cList || []);
        setUsers(uList || []);
        setPayments(pList || []);
        if (sObj) setSettings(sObj);
        if (notifData?.notifications) setNotifications(notifData.notifications);
      } catch (err) {
        console.warn('Portal initialization fallback:', err);
      }
    }
    loadData();

    // Welcome greeting on login
    const justLoggedIn = sessionStorage.getItem('bbd_admin_just_logged_in');
    if (justLoggedIn) {
      sessionStorage.removeItem('bbd_admin_just_logged_in');
      showToast(`${getNigerianGreeting()}, Admin! Welcome to BBD Mobility operations.`);
    }
  }, []);

  // Low-latency live polling every 3.5 seconds so new orders appear immediately
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh(true);
    }, 3500);

    // Cross-tab immediate sync event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bbd_latest_booking' || e.key === 'bbd_booking_updated') {
        handleRefresh(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [selectedBooking?.ref]);

  const handleMarkAllNotificationsRead = async () => {
    const ok = await portalApi.markAllNotificationsRead();
    if (ok) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await portalApi.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleUpdateBooking = async (ref: string, updates: Partial<Booking>) => {
    const updated = await portalApi.updateBooking(ref, updates);
    if (updated) {
      setBookings(prev => prev.map(b => b.ref === ref ? { ...b, ...updates } : b));
      if (selectedBooking?.ref === ref) {
        setSelectedBooking(prev => prev ? { ...prev, ...updates } : null);
      }
    }
  };

  const handleCancelBooking = async (ref: string, reason: string): Promise<boolean> => {
    const res = await portalApi.cancelBooking(ref, reason);
    if (res.success && res.booking) {
      setBookings(prev => prev.map(b => b.ref === ref ? res.booking! : b));
      if (selectedBooking?.ref === ref) setSelectedBooking(res.booking);
      showToast(res.message || `Booking ${ref} cancelled.`);
      return true;
    } else {
      showToast(res.error || 'Failed to cancel booking.');
      return false;
    }
  };

  const handleDeleteBooking = async (ref: string): Promise<boolean> => {
    const res = await portalApi.deleteBooking(ref);
    if (res.success) {
      setBookings(prev => prev.filter(b => b.ref !== ref));
      if (selectedBooking?.ref === ref) setSelectedBooking(null);
      showToast(res.message || `Booking ${ref} deleted.`);
      return true;
    } else {
      showToast(res.error || 'Failed to delete booking.');
      return false;
    }
  };

  const handleAssignRider = async (ref: string, riderId: string, note?: string): Promise<boolean> => {
    const result = await portalApi.assignRider(ref, riderId, note);
    if (result.success && result.booking) {
      const updatedBooking = result.booking;
      setBookings(prev => prev.map(b => b.ref === ref ? updatedBooking : b));
      if (selectedBooking?.ref === ref) {
        setSelectedBooking(updatedBooking);
      }
      setRiders(prev => prev.map(r => (r.riderId === riderId || r.id === riderId) ? { ...r, assignedDeliveries: (r.assignedDeliveries || 0) + 1 } : r));
      showToast(result.message || `Rider assigned to ${ref} successfully!`);
      return true;
    } else {
      showToast(result.error || 'Failed to assign rider.');
      return false;
    }
  };

  const handleCreateRider = async (riderData: Partial<Rider> & { password?: string; plateNumber?: string }) => {
    const res = await portalApi.createRider(riderData);
    if (res.success && res.rider) {
      setRiders(prev => [res.rider, ...prev]);
      showToast(`Rider ${res.rider.name} registered with ID ${res.rider.riderId}!`);
      return res;
    } else {
      showToast(res.error || 'Failed to create rider account.');
      return res;
    }
  };

  const handleUpdateRider = async (id: string, updates: Partial<Rider>) => {
    await portalApi.updateRider(id, updates);
    setRiders(prev => prev.map(r => (r.id === id || r.riderId === id) ? { ...r, ...updates } : r));
  };

  const handleDeleteRider = async (id: string) => {
    const res = await portalApi.deleteRider(id);
    if (res.success) {
      setRiders(prev => prev.filter(r => r.id !== id && r.riderId !== id));
      showToast(res.message || 'Rider deleted successfully.');
      return true;
    } else {
      showToast(res.error || 'Failed to delete rider.');
      return false;
    }
  };

  const handleChangeRiderPassword = async (id: string, newPassword: string) => {
    const res = await portalApi.changeRiderPassword(id, newPassword);
    if (res.success) {
      showToast(res.message || 'Rider password updated successfully.');
      return res;
    } else {
      showToast(res.error || 'Failed to update password.');
      return res;
    }
  };

  const handleCreateUser = async (userData: Partial<PlatformUser>) => {
    const newUser = await portalApi.createUser(userData);
    setUsers(prev => [newUser, ...prev]);
  };

  const handleDeleteUser = async (id: string) => {
    const res = await portalApi.deleteUser(id);
    if (res.success) {
      setUsers(prev => prev.filter(u => u.id !== id && u.userId !== id));
      showToast(res.message || 'User deleted successfully.');
      return true;
    } else {
      showToast(res.error || 'Failed to delete user.');
      return false;
    }
  };

  const handleChangeUserPassword = async (id: string, newPassword: string) => {
    const res = await portalApi.changeUserPassword(id, newPassword);
    if (res.success) {
      showToast(res.message || 'User password updated successfully.');
      return res;
    } else {
      showToast(res.error || 'Failed to update user password.');
      return res;
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<PlatformUser>) => {
    const res = await portalApi.updateUser(id, updates);
    if (res.success) {
      setUsers(prev => prev.map(u => (u.id === id || u.userId === id) ? { ...u, ...updates } : u));
      showToast(`User account status updated.`);
      return true;
    } else {
      showToast(res.error || 'Failed to update user.');
      return false;
    }
  };

  const handleUpdateCustomer = async (id: string, updates: Partial<Customer>) => {
    const res = await portalApi.updateCustomer(id, updates);
    if (res.success) {
      setCustomers(prev => prev.map(c => (c.id === id || c.customerId === id || c.phone === id) ? { ...c, ...updates } : c));
      showToast(res.customer?.status === 'Blacklisted' ? 'Customer added to blacklist.' : 'Customer status updated.');
      return true;
    } else {
      showToast(res.error || 'Failed to update customer.');
      return false;
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    const res = await portalApi.deleteCustomer(id);
    if (res.success) {
      if (res.anonymized) {
        setCustomers(prev => prev.map(c => (c.id === id || c.customerId === id) ? { ...c, status: 'Inactive', name: `[Archived ${c.customerId}]` } : c));
      } else {
        setCustomers(prev => prev.filter(c => c.id !== id && c.customerId !== id));
      }
      showToast(res.message || 'Customer deleted successfully.');
      return true;
    } else {
      showToast(res.error || 'Failed to delete customer.');
      return false;
    }
  };

  const handleRecordPayment = async (paymentData: Partial<PaymentRecord>) => {
    const res = await portalApi.recordPayment(paymentData);
    if (res.payment) {
      setPayments(prev => [res.payment, ...prev.filter(p => p.id !== res.payment.id)]);
    }
    if (res.booking) {
      setBookings(prev => prev.map(b => b.ref === res.booking!.ref ? res.booking! : b));
      if (selectedBooking?.ref === res.booking.ref) {
        setSelectedBooking(res.booking);
      }
    } else if (paymentData.bookingRef) {
      const numAmt = Number(paymentData.amount) || 0;
      setBookings(prev => prev.map(b => b.ref === paymentData.bookingRef ? {
        ...b,
        amount: numAmt > 0 ? numAmt : b.amount,
        deliveryFee: numAmt > 0 ? numAmt : b.deliveryFee,
        paymentStatus: paymentData.paymentStatus === 'Pending' ? 'Unpaid' : 'Paid',
        paymentMethod: paymentData.paymentMethod || b.paymentMethod
      } : b));
      if (selectedBooking?.ref === paymentData.bookingRef) {
        setSelectedBooking(prev => prev ? {
          ...prev,
          amount: numAmt > 0 ? numAmt : prev.amount,
          deliveryFee: numAmt > 0 ? numAmt : prev.deliveryFee,
          paymentStatus: paymentData.paymentStatus === 'Pending' ? 'Unpaid' : 'Paid',
          paymentMethod: paymentData.paymentMethod || prev.paymentMethod
        } : null);
      }
    }
    showToast(`Payment of ₦${Number(paymentData.amount).toLocaleString()} for ${paymentData.bookingRef} recorded successfully!`);
  };

  const handleUpdatePayment = async (paymentId: string, paymentData: Partial<PaymentRecord>) => {
    const res = await portalApi.updatePayment(paymentId, paymentData);
    if (res.success) {
      if (res.payment) {
        setPayments(prev => prev.map(p => (p.id === paymentId || p.paymentId === paymentId) ? { ...p, ...res.payment } : p));
      }
      if (res.booking) {
        setBookings(prev => prev.map(b => b.ref === res.booking!.ref ? res.booking! : b));
        if (selectedBooking?.ref === res.booking.ref) {
          setSelectedBooking(res.booking);
        }
      }
      showToast(res.message || 'Payment updated successfully.');
      return true;
    } else {
      showToast(res.error || 'Failed to update payment.');
      return false;
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    const res = await portalApi.deletePayment(paymentId);
    if (res.success) {
      setPayments(prev => prev.filter(p => p.id !== paymentId && p.paymentId !== paymentId));
      if (res.booking) {
        setBookings(prev => prev.map(b => b.ref === res.booking!.ref ? res.booking! : b));
        if (selectedBooking?.ref === res.booking.ref) {
          setSelectedBooking(res.booking);
        }
      }
      showToast(res.message || 'Payment deleted successfully.');
      return true;
    } else {
      showToast(res.error || 'Failed to delete payment.');
      return false;
    }
  };

  const handleUpdateSettings = async (settingsData: Partial<GeneralSettings>) => {
    await portalApi.updateSettings(settingsData);
    setSettings(prev => ({ ...prev, ...settingsData }));
  };

  return (
    <div className="relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#0B1B3D] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-white/20 animate-slideDown">
          {toastMessage}
        </div>
      )}

      <AdminLayout
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={onLogout}
        onNavigateHome={onNavigateHome}
        notifications={notifications}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onMarkNotificationRead={handleMarkNotificationRead}
        onRefresh={() => handleRefresh(false)}
        isRefreshing={isRefreshing}
      >
        <PortalErrorBoundary key={currentTab} tabName={currentTab}>
          {currentTab === 'dashboard' && (
            <DashboardTab
              bookings={bookings}
              onViewBooking={(b) => {
                setSelectedBooking(b);
                setCurrentTab('bookings');
              }}
              onNavigateTab={setCurrentTab}
              onCreateRider={handleCreateRider}
              onCreateUser={handleCreateUser}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'bookings' && (
            <BookingsTab
              bookings={bookings}
              riders={riders}
              selectedBooking={selectedBooking}
              onSelectBooking={setSelectedBooking}
              onUpdateBooking={handleUpdateBooking}
              onAssignRider={handleAssignRider}
              onCancelBooking={handleCancelBooking}
              onDeleteBooking={handleDeleteBooking}
              onRecordPayment={handleRecordPayment}
              onViewInvoice={(b) => setInvoiceBooking(b)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'riders' && (
            <RidersTab
              riders={riders}
              onCreateRider={handleCreateRider}
              onUpdateRider={handleUpdateRider}
              onDeleteRider={handleDeleteRider}
              onChangeRiderPassword={handleChangeRiderPassword}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersTab
              customers={customers}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'users' && (
            <UsersTab
              users={users}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onChangeUserPassword={handleChangeUserPassword}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsTab
              payments={payments}
              bookings={bookings}
              onRecordPayment={handleRecordPayment}
              onUpdatePayment={handleUpdatePayment}
              onDeletePayment={handleDeletePayment}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsTab
              bookings={bookings}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onShowToast={showToast}
              onNavigateTab={setCurrentTab}
            />
          )}
        </PortalErrorBoundary>
      </AdminLayout>

      {/* Invoice Modal */}
      {invoiceBooking && (
        <InvoiceModal
          booking={invoiceBooking}
          onClose={() => setInvoiceBooking(null)}
        />
      )}
    </div>
  );
}

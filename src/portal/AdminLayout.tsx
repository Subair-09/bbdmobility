import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Bike, 
  Users, 
  UserCheck, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  Search, 
  Bell, 
  LogOut, 
  ExternalLink,
  ChevronDown,
  CheckCheck,
  RefreshCw
} from 'lucide-react';
import { PortalTab, AdminNotification } from './types';
import { useNigerianGreeting } from './timeGreeting';

interface AdminLayoutProps {
  currentTab: PortalTab;
  onSelectTab: (tab: PortalTab) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  notifications: AdminNotification[];
  onMarkAllNotificationsRead?: () => void;
  onMarkNotificationRead?: (id: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  onNavigateHome,
  notifications,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onRefresh,
  isRefreshing = false,
  children
}) => {
  const { greeting, timeFormatted } = useNigerianGreeting();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'dashboard' as PortalTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings' as PortalTab, label: 'Bookings', icon: Package },
    { id: 'riders' as PortalTab, label: 'Riders', icon: Bike },
    { id: 'customers' as PortalTab, label: 'Customers', icon: Users },
    { id: 'users' as PortalTab, label: 'Users', icon: UserCheck },
    { id: 'payments' as PortalTab, label: 'Payments', icon: CreditCard },
    { id: 'reports' as PortalTab, label: 'Reports', icon: BarChart3 },
    { id: 'settings' as PortalTab, label: 'Settings', icon: Settings },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-bbd-navy flex flex-col font-sans">
      <div className="flex flex-1">
        {/* ===================================================================
            DESKTOP / TABLET SIDEBAR (Screenshots 3-10)
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

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-bbd-red text-white shadow-md' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Card: Motorcycle Widget (Screenshots 3-10) */}
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
                Faster Deliveries.
              </div>
              <div className="text-[10px] text-gray-300">
                Happier Customers.
              </div>
              <span className="text-[9px] text-bbd-red font-bold uppercase tracking-wider block mt-0.5">BBD Mobility</span>
            </div>

            {/* Switch to Public Site / Logout */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                title="View Public Website"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">Public Site</span>
              </button>

              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ===================================================================
            MOBILE SIDEBAR OVERLAY
            =================================================================== */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-64 bg-[#0B1B3D] text-white flex flex-col justify-between p-4 z-10 shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-6">
                  <img 
                    src="/assets/logo.png" 
                    alt="BBD Mobility" 
                    className="h-9 w-auto brightness-0 invert" 
                  />
                  <button 
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive 
                            ? 'bg-bbd-red text-white' 
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between text-xs">
                <button onClick={onNavigateHome} className="text-gray-300 hover:text-white font-semibold">
                  Public Site
                </button>
                <button onClick={onLogout} className="text-red-400 hover:text-red-300 font-semibold">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MAIN RIGHT AREA (TOP BAR + CONTENT + FOOTER)
            =================================================================== */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar (Screenshots 3-10) */}
          <header className="bg-white border-b border-gray-200/80 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
            {/* Left Hamburger & Search */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative rounded-xl border border-gray-200 focus-within:border-bbd-navy text-xs w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bookings, riders, or customers..."
                  className="w-full pl-9 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Right Refresh, Greeting, Notifications & Profile */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Live Nigerian Time Greeting Pill */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-gray-200/80 rounded-xl text-xs text-gray-700 font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{greeting}, Admin</span>
                <span className="text-[10px] text-gray-400 font-normal">({timeFormatted} WAT)</span>
              </div>

              {/* Live Instant Refresh Button */}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-slate-50 text-gray-700 font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-60"
                  title="Instant Live Sync: Refresh orders, riders, payments & stats"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#0B1B3D] ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                  <span className="hidden sm:inline text-xs font-bold text-gray-800">
                    {isRefreshing ? 'Syncing...' : 'Refresh'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Auto-Sync Active (Low Latency)" />
                </button>
              )}

              {/* Notification Bell with Badge */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-bbd-red text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Drawer */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-88 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3.5 z-50 text-xs animate-scaleUp">
                    <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-gray-900 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && onMarkAllNotificationsRead && (
                        <button
                          onClick={onMarkAllNotificationsRead}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-400">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-gray-400 flex items-center justify-center mx-auto mb-2">
                            <Bell className="w-5 h-5" />
                          </div>
                          <p className="font-semibold text-gray-700 text-xs">No notifications yet</p>
                          <p className="text-[11px] text-gray-400 mt-0.5 max-w-[220px] mx-auto">
                            Real-time alerts for bookings, riders, and payments will appear here.
                          </p>
                        </div>
                      ) : (
                        notifications.map(n => {
                          const isUnread = !n.read;
                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (onMarkNotificationRead && isUnread) onMarkNotificationRead(n.id);
                                if (n.type === 'booking') {
                                  onSelectTab('bookings');
                                  setNotificationsOpen(false);
                                } else if (n.type === 'rider') {
                                  onSelectTab('riders');
                                  setNotificationsOpen(false);
                                } else if (n.type === 'payment') {
                                  onSelectTab('payments');
                                  setNotificationsOpen(false);
                                }
                              }}
                              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                                isUnread 
                                  ? 'bg-blue-50/70 hover:bg-blue-50 border border-blue-100/80 shadow-xs' 
                                  : 'bg-slate-50/70 hover:bg-slate-100/80 border border-transparent'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                n.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                                n.type === 'rider' ? 'bg-amber-100 text-amber-600' :
                                n.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                                'bg-slate-200 text-slate-600'
                              }`}>
                                {n.type === 'booking' && <Package className="w-3.5 h-3.5" />}
                                {n.type === 'rider' && <Bike className="w-3.5 h-3.5" />}
                                {n.type === 'payment' && <CreditCard className="w-3.5 h-3.5" />}
                                {n.type === 'system' && <Bell className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-xs block truncate ${isUnread ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                                    {n.title}
                                  </span>
                                  {isUnread && (
                                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                  )}
                                </div>
                                <span className="text-[11px] text-gray-500 block leading-relaxed mt-0.5 break-words">
                                  {n.message}
                                </span>
                                <span className="text-[10px] text-gray-400 mt-1 block font-medium">
                                  {n.time}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Profile Chip (Screenshots 3-10) */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0B1B3D] text-white font-black text-xs flex items-center justify-center shadow-sm">
                    A
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="font-bold text-xs text-gray-900 block leading-tight">Admin</span>
                    <span className="text-[10px] text-gray-400 font-medium">{greeting}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block ml-1" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 text-xs animate-scaleUp">
                    <button
                      onClick={() => {
                        onSelectTab('settings');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 font-semibold text-gray-700"
                    >
                      Admin Settings
                    </button>
                    <button
                      onClick={() => {
                        onNavigateHome();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 font-semibold text-gray-700"
                    >
                      Return to Website
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 font-semibold text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Tab View Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Admin Footer (Screenshots 3-10) */}
          <footer className="border-t border-gray-200/80 bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
            <span>BBD Mobility Admin v1.0.0</span>
            <span>© 2026 BBD Mobility. All rights reserved.</span>
            <span className="font-semibold text-gray-600">Move What Matters.</span>
          </footer>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Save, 
  Bell, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  Server, 
  MapPin, 
  UserPlus,
  ArrowRight,
  FileCode
} from 'lucide-react';
import { GeneralSettings } from '../types';

interface SettingsTabProps {
  settings: GeneralSettings;
  onUpdateSettings: (settings: Partial<GeneralSettings>) => void;
  onShowToast: (msg: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onShowToast,
  onNavigateTab
}) => {
  const [businessName, setBusinessName] = useState(settings.businessName || 'BBD Mobility');
  const [phone, setPhone] = useState(settings.phone || '+234 708 753 1148');
  const [email, setEmail] = useState(settings.email || 'info@bbdmobility.com.ng');
  const [operatingCities, setOperatingCities] = useState(settings.operatingCities || 'Lagos, Nigeria');
  const [address, setAddress] = useState(settings.address || 'Lagos, Nigeria');
  const [description, setDescription] = useState(settings.description || 'Fast and reliable delivery services across Lagos and beyond.');

  // Notification toggles
  const [newBookings, setNewBookings] = useState(settings.notifications?.newBookings ?? true);
  const [payments, setPayments] = useState(settings.notifications?.payments ?? true);
  const [riderUpdates, setRiderUpdates] = useState(settings.notifications?.riderUpdates ?? true);
  const [systemAlerts, setSystemAlerts] = useState(settings.notifications?.systemAlerts ?? true);

  // Delivery settings
  const [defaultPickup, setDefaultPickup] = useState(settings.defaultPickupLocation || 'Lagos, Nigeria');
  const [serviceArea, setServiceArea] = useState(settings.serviceArea || 'Lagos (All Areas)');
  const [deliveryRadius, setDeliveryRadius] = useState(settings.deliveryRadiusKm || 50);
  const [maxDeliveryTime, setMaxDeliveryTime] = useState(settings.maxDeliveryTimeMinutes || 180);
  const [defaultService, setDefaultService] = useState(settings.defaultServiceType || 'Standard Delivery');

  // Security
  const [twoFactor, setTwoFactor] = useState(settings.twoFactorAuth || false);
  const [timeout, setTimeoutVal] = useState(settings.sessionTimeout || '8 hours');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      businessName,
      phone,
      email,
      operatingCities,
      address,
      description
    });
    onShowToast('General settings saved successfully to MongoDB.');
  };

  const handleSaveDeliveryRules = () => {
    onUpdateSettings({
      defaultPickupLocation: defaultPickup,
      serviceArea,
      deliveryRadiusKm: Number(deliveryRadius),
      maxDeliveryTimeMinutes: Number(maxDeliveryTime),
      defaultServiceType: defaultService
    });
    onShowToast('Delivery and business rules updated.');
  };

  const handleToggleNotification = (key: keyof GeneralSettings['notifications'], val: boolean) => {
    if (key === 'newBookings') setNewBookings(val);
    if (key === 'payments') setPayments(val);
    if (key === 'riderUpdates') setRiderUpdates(val);
    if (key === 'systemAlerts') setSystemAlerts(val);

    onUpdateSettings({
      notifications: {
        newBookings: key === 'newBookings' ? val : newBookings,
        payments: key === 'payments' ? val : payments,
        riderUpdates: key === 'riderUpdates' ? val : riderUpdates,
        systemAlerts: key === 'systemAlerts' ? val : systemAlerts,
      }
    });
    onShowToast('Notification preference updated.');
  };

  return (
    <div className="space-y-6">
      {/* Header (Screenshot 10) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h1>
          <p className="text-xs text-gray-500 font-medium">Manage your application settings, notifications and system preferences.</p>
        </div>

        <div className="text-xs text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-xl">
          Last updated: Oct 28, 2026 • 10:24 AM
        </div>
      </div>

      {/* Main Grid: Left Settings (2 cols) & Right System Info (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings Card (Screenshot 10) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">General Settings</h3>
                <p className="text-xs text-gray-400">Update your business information and basic application settings.</p>
              </div>
              <button
                type="button"
                onClick={handleSaveGeneral}
                className="px-4 py-2 bg-[#0B1B3D] hover:bg-[#07132c] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>

            <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
              {/* Brand Logo & Change Logo */}
              <div className="flex items-center gap-4 py-1">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 p-2 shadow-sm flex items-center justify-center">
                  <img src="/assets/logo.png" alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => onShowToast('Logo updater opened.')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Change Logo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Operating Cities *</label>
                  <input
                    type="text"
                    value={operatingCities}
                    onChange={(e) => setOperatingCities(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Business Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy"
                />
              </div>
            </form>
          </div>

          {/* Two Column Grid: Notification Settings & Delivery & Business Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notification Settings (Screenshot 10) */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Notification Settings</h4>
                  <p className="text-[10px] text-gray-400">Choose how you want to receive notifications.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">New Booking Notifications</span>
                    <span className="text-[10px] text-gray-400">Get notified when a new delivery is booked</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newBookings}
                    onChange={(e) => handleToggleNotification('newBookings', e.target.checked)}
                    className="w-4 h-4 rounded text-bbd-navy"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Payment Notifications</span>
                    <span className="text-[10px] text-gray-400">Get notified when payments are received</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={payments}
                    onChange={(e) => handleToggleNotification('payments', e.target.checked)}
                    className="w-4 h-4 rounded text-bbd-navy"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Rider Updates</span>
                    <span className="text-[10px] text-gray-400">Get notified about rider status & assignments</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={riderUpdates}
                    onChange={(e) => handleToggleNotification('riderUpdates', e.target.checked)}
                    className="w-4 h-4 rounded text-bbd-navy"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">System Alerts</span>
                    <span className="text-[10px] text-gray-400">Get notified about system errors & updates</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemAlerts}
                    onChange={(e) => handleToggleNotification('systemAlerts', e.target.checked)}
                    className="w-4 h-4 rounded text-bbd-navy"
                  />
                </div>
              </div>
            </div>

            {/* Delivery & Business Settings (Screenshot 10) */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Delivery & Business Settings</h4>
                    <p className="text-[10px] text-gray-400">Configure delivery rules and service settings.</p>
                  </div>
                </div>

                <div className="space-y-3 pt-1 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Default Pickup Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={defaultPickup}
                        onChange={(e) => setDefaultPickup(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy text-xs"
                      />
                      <MapPin className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Service Area</label>
                    <select
                      value={serviceArea}
                      onChange={(e) => setServiceArea(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white font-medium text-xs"
                    >
                      <option>Lagos (All Areas)</option>
                      <option>Lagos Island & Lekki Only</option>
                      <option>Lagos Mainland Only</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Delivery Radius (km)</label>
                      <input
                        type="number"
                        value={deliveryRadius}
                        onChange={(e) => setDeliveryRadius(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Max Delivery Time (min)</label>
                      <input
                        type="number"
                        value={maxDeliveryTime}
                        onChange={(e) => setMaxDeliveryTime(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Default Service Type</label>
                    <select
                      value={defaultService}
                      onChange={(e) => setDefaultService(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white font-medium text-xs"
                    >
                      <option>Standard Delivery</option>
                      <option>Express Same-Day</option>
                      <option>Scheduled Delivery</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveDeliveryRules}
                className="w-full py-2 px-3 bg-[#0B1B3D] text-white text-xs font-bold rounded-xl hover:bg-[#07132c] shadow-sm transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Bottom Cards: Payment Settings & Security Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Settings */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold text-gray-900">Payment Settings</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Payment Method</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white font-medium text-xs">
                    <option>Manual Payment (Bank Transfer / Cash / POS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Currency</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white font-medium text-xs">
                    <option>NGN (₦)</option>
                  </select>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900">
                  Payments are recorded manually by the admin in the Payments section.
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-gray-900">Security Settings</h4>
              </div>

              <div className="space-y-3 text-xs">
                <button
                  type="button"
                  onClick={() => onShowToast('Admin password change dialogue triggered.')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-200 hover:bg-slate-50 transition-colors text-gray-700 font-semibold"
                >
                  <span>Change Admin Password</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200">
                  <div>
                    <span className="font-bold text-gray-800 block">Two-Factor Authentication (2FA)</span>
                    <span className="text-[10px] text-gray-400">Require OTP on sign in</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={(e) => {
                      setTwoFactor(e.target.checked);
                      onUpdateSettings({ twoFactorAuth: e.target.checked });
                      onShowToast(`2FA is now ${e.target.checked ? 'Enabled' : 'Disabled'}.`);
                    }}
                    className="w-4 h-4 rounded text-bbd-navy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Session Timeout</label>
                  <select
                    value={timeout}
                    onChange={(e) => {
                      setTimeoutVal(e.target.value);
                      onUpdateSettings({ sessionTimeout: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white font-medium text-xs"
                  >
                    <option>8 hours</option>
                    <option>24 hours</option>
                    <option>7 days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right System Info & Quick Actions Column (Screenshot 10) */}
        <div className="space-y-6">
          {/* System Information Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-4 h-4 text-blue-600" />
              <div>
                <h4 className="text-xs font-bold text-gray-900">System Information</h4>
                <p className="text-[10px] text-gray-400">View your application and server details.</p>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Application Version</span>
                <span className="font-mono font-bold text-gray-800">v1.0.0</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Server Environment</span>
                <span className="font-semibold text-emerald-600">Production</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Database Engine</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-600" /> MongoDB
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Database Status</span>
                <span className="font-bold text-emerald-600">Connected</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Last Backup</span>
                <span className="font-medium text-gray-700">Oct 28, 2026 • 02:00 AM</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card (Screenshot 10) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Quick Actions</h4>

            <button
              onClick={() => onNavigateTab('riders')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-xs font-semibold text-gray-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Add New Rider</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => onNavigateTab('users')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-xs font-semibold text-gray-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Add New User</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => onShowToast('Database snapshot created successfully.')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-xs font-semibold text-gray-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-amber-600" />
                <span>Backup Database</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => onShowToast('Application cache cleared.')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-xs font-semibold text-gray-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-purple-600" />
                <span>Clear Cache</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => onShowToast('System logs inspected: All MongoDB collections healthy.')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-xs font-semibold text-gray-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4 text-gray-600" />
                <span>System Logs</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

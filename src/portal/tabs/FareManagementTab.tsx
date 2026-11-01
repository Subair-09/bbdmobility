import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Save, 
  Loader2, 
  Sliders 
} from 'lucide-react';
import { GeneralSettings } from '../types';
import { MapboxAddressInput } from '../../components/MapboxAddressInput';
import { MapboxRouteMap } from '../../components/MapboxRouteMap';
import { 
  calculateDrivingRoute, 
  computeDeliveryFareBreakdown, 
  PricingBreakdown 
} from '../../services/mapboxService';

interface FareManagementTabProps {
  settings: GeneralSettings;
  onUpdateSettings: (settings: Partial<GeneralSettings>) => void;
  onShowToast: (msg: string) => void;
}

const PRESET_TEST_ROUTES = [
  {
    name: 'Mushin → Egbe (Hammed Oghere)',
    pickup: '23 Amodu Street, Mushin, Lagos',
    pickupCoords: { lng: 3.3489, lat: 6.5186 },
    dropoff: '35 Hammed Oghere Street, Egbe, Ikotun, Lagos',
    dropoffCoords: { lng: 3.2842, lat: 6.5458 },
  },
  {
    name: 'Ikeja GRA → Victoria Island',
    pickup: 'Ikeja GRA & Allen Avenue, Ikeja, Lagos',
    pickupCoords: { lng: 3.3551, lat: 6.5986 },
    dropoff: 'Victoria Island, Adeola Odeku, Lagos',
    dropoffCoords: { lng: 3.4219, lat: 6.4281 },
  },
  {
    name: 'Short Distance (1.5 km)',
    pickup: 'Lekki Phase 1, Admiralty Way, Lagos',
    pickupCoords: { lng: 3.4735, lat: 6.4474 },
    dropoff: 'Lekki Phase 1, Lekki-Epe Expressway, Lagos',
    dropoffCoords: { lng: 3.4835, lat: 6.4490 },
  },
  {
    name: 'Same Location (0 km)',
    pickup: 'Central Lagos Hub',
    pickupCoords: { lng: 3.3792, lat: 6.5244 },
    dropoff: 'Central Lagos Hub',
    dropoffCoords: { lng: 3.3792, lat: 6.5244 },
  }
];

export const FareManagementTab: React.FC<FareManagementTabProps> = ({
  settings,
  onUpdateSettings,
  onShowToast
}) => {
  // Pricing configuration form states
  const [baseFare, setBaseFare] = useState<number>(settings.baseFare ?? 300);
  const [pricePerKm, setPricePerKm] = useState<number>(settings.pricePerKm ?? 250);
  const [pricePerMinute, setPricePerMinute] = useState<number>(settings.pricePerMinute ?? 30);
  const [minimumFare, setMinimumFare] = useState<number>(settings.minimumFare ?? 1000);
  const [waitingChargePerMinute, setWaitingChargePerMinute] = useState<number>(settings.waitingChargePerMinute ?? settings.waitingFee ?? 50);
  const [vatPercentage, setVatPercentage] = useState<number>(settings.vatPercentage ?? 7.5);
  const [vatEnabled, setVatEnabled] = useState<boolean>(settings.vatEnabled ?? true);
  const [timePricingEnabled, setTimePricingEnabled] = useState<boolean>(settings.timePricingEnabled ?? true);
  const [distancePricingEnabled, setDistancePricingEnabled] = useState<boolean>(settings.distancePricingEnabled ?? true);
  const [fareRoundingIncrement, setFareRoundingIncrement] = useState<number>(settings.fareRoundingIncrement ?? 50);
  const [mapboxPublicKey, setMapboxPublicKey] = useState<string>(settings.mapboxPublicKey ?? '');
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>(settings.googleMapsApiKey ?? '');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Interactive Test Calculator States
  const [testPickup, setTestPickup] = useState<string>('23 Amodu Street, Mushin, Lagos');
  const [testPickupCoords, setTestPickupCoords] = useState<{ lat: number; lng: number } | undefined>({ lat: 6.5186, lng: 3.3489 });
  const [testDropoff, setTestDropoff] = useState<string>('35 Hammed Oghere Street, Egbe, Ikotun, Lagos');
  const [testDropoffCoords, setTestDropoffCoords] = useState<{ lat: number; lng: number } | undefined>({ lat: 6.5458, lng: 3.2842 });
  const [testWaitingMinutes, setTestWaitingMinutes] = useState<number>(0);
  const [testDistanceKm, setTestDistanceKm] = useState<number>(12.3);
  const [testDurationMins, setTestDurationMins] = useState<number>(43);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);

  // Recalculate driving route when test locations change
  useEffect(() => {
    if (!testPickupCoords || !testDropoffCoords) return;

    // Check identical locations
    if (
      Math.abs(testPickupCoords.lat - testDropoffCoords.lat) < 0.0001 &&
      Math.abs(testPickupCoords.lng - testDropoffCoords.lng) < 0.0001
    ) {
      setTestDistanceKm(0);
      setTestDurationMins(0);
      setRouteGeometry(null);
      return;
    }

    let isMounted = true;
    setIsCalculatingRoute(true);

    calculateDrivingRoute(
      [testPickupCoords.lng, testPickupCoords.lat],
      [testDropoffCoords.lng, testDropoffCoords.lat],
      mapboxPublicKey,
      googleMapsApiKey
    )
      .then((route) => {
        if (!isMounted) return;
        setTestDistanceKm(route.distanceKm);
        setTestDurationMins(route.durationMinutes);
        setRouteGeometry(route.polyline);
        setIsCalculatingRoute(false);
      })
      .catch(() => {
        if (isMounted) setIsCalculatingRoute(false);
      });

    return () => {
      isMounted = false;
    };
  }, [testPickupCoords, testDropoffCoords, mapboxPublicKey, googleMapsApiKey]);

  // Compute live test fare breakdown
  const testFareBreakdown: PricingBreakdown = computeDeliveryFareBreakdown({
    distanceKm: testDistanceKm,
    durationMinutes: testDurationMins,
    baseFare,
    pricePerKm,
    pricePerMinute,
    minimumFare,
    waitingChargePerMinute,
    waitingMinutes: testWaitingMinutes,
    vatPercentage,
    vatEnabled,
    timePricingEnabled,
    distancePricingEnabled,
    fareRoundingIncrement,
  });

  const handleSavePricingConfig = async () => {
    setIsSaving(true);
    try {
      const payload: Partial<GeneralSettings> = {
        baseFare: Math.max(0, Number(baseFare) || 0),
        pricePerKm: Math.max(0, Number(pricePerKm) || 0),
        pricePerMinute: Math.max(0, Number(pricePerMinute) || 0),
        minimumFare: Math.max(0, Number(minimumFare) || 0),
        waitingChargePerMinute: Math.max(0, Number(waitingChargePerMinute) || 0),
        waitingFee: Math.max(0, Number(waitingChargePerMinute) || 0),
        vatPercentage: Math.max(0, Math.min(100, Number(vatPercentage) || 0)),
        vatEnabled,
        timePricingEnabled,
        distancePricingEnabled,
        fareRoundingIncrement: Math.max(1, Number(fareRoundingIncrement) || 50),
        mapboxPublicKey: mapboxPublicKey.trim(),
        googleMapsApiKey: googleMapsApiKey.trim(),
      };

      await onUpdateSettings(payload);
      onShowToast('Fare Management pricing settings saved successfully to database!');
    } catch (err: any) {
      onShowToast('Failed to save settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadPreset = (preset: typeof PRESET_TEST_ROUTES[0]) => {
    setTestPickup(preset.pickup);
    setTestPickupCoords(preset.pickupCoords);
    setTestDropoff(preset.dropoff);
    setTestDropoffCoords(preset.dropoffCoords);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-blue-50 text-[#0B1B3D] rounded-xl">
              <Calculator className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-[#0B1B3D] tracking-tight">
              Fare Management
            </h2>
          </div>
          <p className="text-xs text-gray-500 max-w-2xl">
            Configure automatic distance and duration pricing rules, VAT taxes, and minimum fare thresholds.
            All values are persisted to MongoDB and enforced server-side.
          </p>
        </div>

        <button
          onClick={handleSavePricingConfig}
          disabled={isSaving}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#E30620] hover:bg-[#c9051b] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Pricing Configuration</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ===================================================================
            SECTION 1: CONFIGURABLE PRICING ENGINE RULES (LEFT 7 COLS)
            =================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0B1B3D]" />
                <h3 className="font-bold text-sm text-[#0B1B3D]">Pricing Components</h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Active Pricing Formula
              </span>
            </div>

            {/* Formula Explanation Callout */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 space-y-1">
              <p className="font-bold text-[#0B1B3D] flex items-center gap-1.5">
                <span>Standard Formula:</span>
                <code className="text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[#E30620]">
                  Subtotal = Base + (KM × Price/KM) + (Mins × Price/Min)
                </code>
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Applies minimum fare threshold before calculating VAT, then rounds to nearest increment.
              </p>
            </div>

            {/* Core Pricing Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Base Booking Fee */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Base Booking Fee (₦)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs font-bold">₦</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={baseFare}
                    onChange={(e) => setBaseFare(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-gray-200 focus:border-[#0B1B3D] focus:bg-white focus:outline-none font-bold text-gray-900"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Fixed dispatch commencement fee</p>
              </div>

              {/* Price Per Kilometre */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Price Per Kilometre (₦/km)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs font-bold">₦</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={pricePerKm}
                    onChange={(e) => setPricePerKm(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-gray-200 focus:border-[#0B1B3D] focus:bg-white focus:outline-none font-bold text-gray-900"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Calculated using actual road distance</p>
              </div>

              {/* Price Per Minute */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Price Per Minute (₦/min)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs font-bold">₦</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={pricePerMinute}
                    onChange={(e) => setPricePerMinute(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-gray-200 focus:border-[#0B1B3D] focus:bg-white focus:outline-none font-bold text-gray-900"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Travel time charge based on traffic</p>
              </div>

              {/* Minimum Fare */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Minimum Fare Threshold (₦)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs font-bold">₦</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={minimumFare}
                    onChange={(e) => setMinimumFare(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-gray-200 focus:border-[#0B1B3D] focus:bg-white focus:outline-none font-bold text-gray-900"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Lowest fare billed for any delivery</p>
              </div>

              {/* Waiting Charge Per Minute */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Waiting Charge (₦/min)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs font-bold">₦</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={waitingChargePerMinute}
                    onChange={(e) => setWaitingChargePerMinute(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-gray-200 focus:border-[#0B1B3D] focus:bg-white focus:outline-none font-bold text-gray-900"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Billed when courier waiting is recorded</p>
              </div>

              {/* VAT Percentage */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  VAT Percentage (%)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs font-bold">%</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={vatPercentage}
                    onChange={(e) => setVatPercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-gray-200 focus:border-[#0B1B3D] focus:bg-white focus:outline-none font-bold text-gray-900"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Applicable tax added after subtotal</p>
              </div>

              {/* Fare Rounding Increment */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Fare Rounding Increment (₦)
                </label>
                <select
                  value={fareRoundingIncrement}
                  onChange={(e) => setFareRoundingIncrement(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-gray-200 focus:border-[#0B1B3D] focus:bg-white focus:outline-none font-bold text-gray-900"
                >
                  <option value={1}>No rounding (Exact ₦1)</option>
                  <option value={10}>Round to nearest ₦10</option>
                  <option value={50}>Round to nearest ₦50 (Recommended)</option>
                  <option value={100}>Round to nearest ₦100</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-0.5">Rounds final customer price cleanly</p>
              </div>

              {/* Mapbox Public Token Override */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mapbox Access Key (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to use environment key"
                  value={mapboxPublicKey}
                  onChange={(e) => setMapboxPublicKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-gray-200 focus:border-[#0B1B3D] focus:bg-white focus:outline-none font-medium text-gray-900"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">Used for road directions &amp; address search</p>
              </div>

              {/* Google Maps API Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Google Maps API Key (Recommended)
                  </label>
                  {googleMapsApiKey && googleMapsApiKey.startsWith('AIzaSy') && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Active: Places &amp; Routes API
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  placeholder="AIzaSy... (leave blank to use .env key)"
                  value={googleMapsApiKey}
                  onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-gray-200 focus:border-[#0B1B3D] focus:bg-white focus:outline-none font-medium text-gray-900"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">High-accuracy Nigerian street search &amp; live traffic distance</p>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <span className="text-xs font-bold text-[#0B1B3D] block">Pricing Feature Toggles</span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="p-3 bg-slate-50 rounded-xl border border-gray-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Distance Pricing</span>
                    <span className="text-[10px] text-gray-500">Apply KM rate</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={distancePricingEnabled}
                    onChange={(e) => setDistancePricingEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#0B1B3D] rounded"
                  />
                </label>

                <label className="p-3 bg-slate-50 rounded-xl border border-gray-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Time Pricing</span>
                    <span className="text-[10px] text-gray-500">Apply minute rate</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={timePricingEnabled}
                    onChange={(e) => setTimePricingEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#0B1B3D] rounded"
                  />
                </label>

                <label className="p-3 bg-slate-50 rounded-xl border border-gray-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">VAT Tax</span>
                    <span className="text-[10px] text-gray-500">Add {vatPercentage}% VAT</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={vatEnabled}
                    onChange={(e) => setVatEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#0B1B3D] rounded"
                  />
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSavePricingConfig}
                disabled={isSaving}
                className="w-full py-3 px-4 bg-[#0B1B3D] hover:bg-[#122b5e] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save All Pricing Changes to MongoDB</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 2: INTERACTIVE FARE CALCULATOR PREVIEW (RIGHT 5 COLS)
            =================================================================== */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#E30620]" />
                <h3 className="font-bold text-sm text-[#0B1B3D]">Fare Calculator Preview</h3>
              </div>
              <span className="text-[11px] text-gray-400">Live Simulation</span>
            </div>

            {/* Quick Test Presets */}
            <div>
              <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">Test Routes:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TEST_ROUTES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleLoadPreset(preset)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Pickup Input */}
            <MapboxAddressInput
              label="Test Pickup Location"
              iconType="pickup"
              placeholder="Search pickup address..."
              value={testPickup}
              onChange={(addr, coords) => {
                setTestPickup(addr);
                if (coords) {
                  setTestPickupCoords(coords);
                } else if (!addr.trim()) {
                  setTestPickupCoords(undefined);
                }
              }}
              mapboxToken={mapboxPublicKey}
              googleApiKey={googleMapsApiKey}
              showGpsButton={false}
            />

            {/* Test Destination Input */}
            <MapboxAddressInput
              label="Test Destination"
              iconType="dropoff"
              placeholder="Search drop-off address..."
              value={testDropoff}
              onChange={(addr, coords) => {
                setTestDropoff(addr);
                if (coords) {
                  setTestDropoffCoords(coords);
                } else if (!addr.trim()) {
                  setTestDropoffCoords(undefined);
                }
              }}
              mapboxToken={mapboxPublicKey}
              googleApiKey={googleMapsApiKey}
              showGpsButton={false}
            />

            {/* Waiting Time Slider */}
            <div className="pt-1">
              <div className="flex justify-between items-center text-xs text-gray-700 mb-1">
                <span className="font-semibold">Recorded Waiting Time:</span>
                <span className="font-bold text-[#0B1B3D]">{testWaitingMinutes} minutes (+₦{(testWaitingMinutes * waitingChargePerMinute).toLocaleString()})</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={testWaitingMinutes}
                onChange={(e) => setTestWaitingMinutes(Number(e.target.value))}
                className="w-full accent-[#0B1B3D] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Route Map Preview */}
            {(testPickupCoords || testDropoffCoords) && (
              <div className="pt-1">
                <MapboxRouteMap
                  pickup={testPickupCoords}
                  dropoff={testDropoffCoords}
                  pickupAddress={testPickup}
                  dropoffAddress={testDropoff}
                  routeGeometry={routeGeometry}
                  distanceKm={testDistanceKm}
                  durationMinutes={testDurationMins}
                  mapboxToken={mapboxPublicKey}
                  height="160px"
                />
              </div>
            )}

            {/* Dynamic Calculation Breakdown */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-500 pb-1.5 border-b border-gray-200">
                <span>Calculated Road Metrics:</span>
                {isCalculatingRoute ? (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Routing...</span>
                  </span>
                ) : (
                  <span className="font-bold text-gray-800">
                    {testDistanceKm} km • ~{testDurationMins} mins
                  </span>
                )}
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Base Booking Fee:</span>
                <span className="font-semibold text-gray-800">₦{testFareBreakdown.baseFare.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Distance Charge ({testDistanceKm} km × ₦{pricePerKm}/km):</span>
                <span className="font-semibold text-gray-800">₦{testFareBreakdown.distanceCost.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Time Charge (~{testDurationMins} mins × ₦{pricePerMinute}/min):</span>
                <span className="font-semibold text-gray-800">₦{testFareBreakdown.timeCharge.toLocaleString()}</span>
              </div>

              {testWaitingMinutes > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Waiting Charge ({testWaitingMinutes} mins × ₦{waitingChargePerMinute}/min):</span>
                  <span className="font-semibold text-gray-800">₦{testFareBreakdown.waitingCharge.toLocaleString()}</span>
                </div>
              )}

              {testFareBreakdown.isMinimumFareApplied && (
                <div className="flex justify-between text-amber-700 bg-amber-50 px-2 py-1 rounded text-[11px]">
                  <span>Minimum Fare Rule:</span>
                  <span className="font-bold">₦{minimumFare.toLocaleString()} applied</span>
                </div>
              )}

              {vatEnabled && testFareBreakdown.vatAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>VAT ({vatPercentage}%):</span>
                  <span className="font-semibold text-gray-800">₦{testFareBreakdown.vatAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-baseline justify-between pt-2 border-t border-gray-200 font-bold">
                <span className="text-xs uppercase text-[#0B1B3D]">Resulting Fare:</span>
                <div className="text-right">
                  <span className="text-lg text-[#0B1B3D] font-black">
                    ₦{testFareBreakdown.finalFare.toLocaleString()}
                  </span>
                  {fareRoundingIncrement > 1 && (
                    <p className="text-[10px] text-gray-400 font-normal">
                      Rounded to nearest ₦{fareRoundingIncrement}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

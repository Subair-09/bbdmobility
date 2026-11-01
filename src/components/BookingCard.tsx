import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  ChevronLeft,
  AlertCircle,
  Loader2,
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingFormData } from '../types';
import { MapboxAddressInput } from './MapboxAddressInput';
import { MapboxRouteMap } from './MapboxRouteMap';
import { 
  calculateDrivingRoute, 
  computeDeliveryFareBreakdown, 
  PricingBreakdown 
} from '../services/mapboxService';

interface BookingCardProps {
  initialServiceType?: string;
}

const SERVICE_OPTIONS = [
  'Documents & Files',
  'Food & Groceries',
  'E-commerce Packages',
  'Personal Items',
  'Same-Day Delivery',
  'Scheduled Delivery',
  'Other',
];

export const BookingCard: React.FC<BookingCardProps> = ({ initialServiceType }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Dynamic Mapbox Distance & Pricing Settings State
  const [pricingConfig, setPricingConfig] = useState<{
    baseFare: number;
    pricePerKm: number;
    minimumFare: number;
    waitingFee: number;
    mapboxPublicKey?: string;
  }>({
    baseFare: 500,
    pricePerKm: 250,
    minimumFare: 1500,
    waitingFee: 200,
    mapboxPublicKey: '',
  });

  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(0);
  const [routeDurationMins, setRouteDurationMins] = useState<number>(0);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);
  const [includeWaitingFee, setIncludeWaitingFee] = useState<boolean>(false);

  const [formData, setFormData] = useState<BookingFormData>({
    serviceType: initialServiceType || 'Documents & Files',
    pickupLocation: '',
    dropoffLocation: '',
    packageDetails: '',
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    deliveryInstructions: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

  // Fetch active admin pricing settings on load
  useEffect(() => {
    fetch('/api/pricing-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((cfg) => {
        if (cfg && typeof cfg.baseFare === 'number') {
          setPricingConfig(cfg);
        }
      })
      .catch((err) => console.warn('[Pricing Config Load]:', err));
  }, []);

  // Sync initial service type if prop updates
  useEffect(() => {
    if (initialServiceType) {
      setFormData((prev) => ({ ...prev, serviceType: initialServiceType }));
    }
  }, [initialServiceType]);

  // Recalculate route distance when pickup and dropoff coordinates are available
  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) {
      return;
    }

    let isMounted = true;
    setIsCalculatingRoute(true);

    calculateDrivingRoute(
      [pickupCoords.lng, pickupCoords.lat],
      [dropoffCoords.lng, dropoffCoords.lat],
      pricingConfig.mapboxPublicKey
    )
      .then((route) => {
        if (!isMounted) return;
        setRouteDistanceKm(route.distanceKm);
        setRouteDurationMins(route.durationMinutes);
        setRouteGeometry(route.polyline);
        setIsCalculatingRoute(false);
        setFormData((prev) => ({
          ...prev,
          distanceKm: route.distanceKm,
          durationMinutes: route.durationMinutes,
          pickupCoordinates: pickupCoords,
          dropoffCoordinates: dropoffCoords,
        }));
      })
      .catch(() => {
        if (isMounted) setIsCalculatingRoute(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pickupCoords, dropoffCoords, pricingConfig.mapboxPublicKey]);

  // Dynamic Fare Breakdown based on Admin Pricing Formula
  const fareBreakdown: PricingBreakdown = computeDeliveryFareBreakdown({
    distanceKm: routeDistanceKm,
    baseFare: pricingConfig.baseFare,
    pricePerKm: pricingConfig.pricePerKm,
    minimumFare: pricingConfig.minimumFare,
    waitingFee: pricingConfig.waitingFee,
    includeWaitingFee,
  });

  const handleChange = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setServerError(null);
  };

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};
    if (!formData.serviceType) newErrors.serviceType = 'Please select a service type.';
    if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup address is required.';
    if (!formData.dropoffLocation.trim()) newErrors.dropoffLocation = 'Drop-off address is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};
    if (!formData.senderName.trim()) newErrors.senderName = 'Sender name is required.';
    if (!formData.senderPhone.trim()) newErrors.senderPhone = 'Sender phone number is required.';
    if (formData.senderEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.senderEmail.trim())) {
      newErrors.senderEmail = 'Please enter a valid email address.';
    }
    if (!formData.receiverName.trim()) newErrors.receiverName = 'Recipient name is required.';
    if (!formData.receiverPhone.trim()) newErrors.receiverPhone = 'Recipient phone number is required.';
    if (formData.receiverEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.receiverEmail.trim())) {
      newErrors.receiverEmail = 'Please enter a valid recipient email address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleContinueStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmitFinal = async () => {
    setLoading(true);
    setServerError(null);

    try {
      const payload = {
        ...formData,
        distanceKm: routeDistanceKm > 0 ? routeDistanceKm : undefined,
        durationMinutes: routeDurationMins > 0 ? routeDurationMins : undefined,
        pickupCoordinates: pickupCoords,
        dropoffCoordinates: dropoffCoords,
        waitingFeeApplied: includeWaitingFee,
        estimatedDeliveryFee: fareBreakdown.finalFare,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('[API Non-JSON Response]:', text);
        throw new Error('Server returned an unexpected response. Please ensure your Vercel deployment has finished and try again.');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Booking request failed.');
      }

      // Signal low-latency cross-tab event to open Admin & Rider portals
      try {
        localStorage.setItem('bbd_latest_booking', JSON.stringify({
          ref: data.bookingReference,
          timestamp: Date.now()
        }));
      } catch {}

      setConfirmedRef(data.bookingReference);
      setStep(4);
    } catch (err: any) {
      setServerError(
        err.message || 'Unable to connect to the dispatch server. Please try again or call our hotline.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRef = () => {
    if (confirmedRef) {
      navigator.clipboard.writeText(confirmedRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const resetForm = () => {
    setFormData({
      serviceType: 'Documents & Files',
      pickupLocation: '',
      dropoffLocation: '',
      packageDetails: '',
      senderName: '',
      senderPhone: '',
      senderEmail: '',
      receiverName: '',
      receiverPhone: '',
      receiverEmail: '',
      deliveryInstructions: '',
    });
    setPickupCoords(undefined);
    setDropoffCoords(undefined);
    setRouteGeometry(null);
    setRouteDistanceKm(0);
    setRouteDurationMins(0);
    setIncludeWaitingFee(false);
    setErrors({});
    setServerError(null);
    setConfirmedRef(null);
    setStep(1);
  };

  return (
    <div
      id="booking-form"
      className="bg-white rounded-2xl p-5 sm:p-7 shadow-booking border border-gray-100 transition-all duration-300 relative z-10 w-full max-w-md mx-auto lg:max-w-none"
    >
      {/* Step Progress indicator */}
      {step !== 4 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-bbd-navy tracking-tight">
              {step === 1 && 'Book a Delivery'}
              {step === 2 && 'Sender & Recipient'}
              {step === 3 && 'Review Booking'}
            </h2>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-bbd-red'
                      : s < step
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {step === 1 && "Fill in the details below and we'll get your package moving."}
            {step === 2 && 'Provide contact details for rider coordination.'}
            {step === 3 && 'Review details before dispatch confirmation.'}
          </p>
        </div>
      )}

      {/* Server Error Alert */}
      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 text-bbd-red text-xs rounded-xl flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </motion.div>
      )}

      {/* Animated Step Carousel */}
      <AnimatePresence mode="wait">
        {/* STEP 1: Fast Booking Fields */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleContinueStep1}
            className="space-y-3.5"
          >
            {/* Service Type */}
            <div>
              <label className="block text-xs font-semibold text-bbd-navy mb-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-bbd-navy" />
                <span>Service Type</span>
              </label>
              <div className="relative">
                <select
                  value={formData.serviceType}
                  onChange={(e) => handleChange('serviceType', e.target.value)}
                  className={`w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 text-slate-800 text-xs sm:text-sm rounded-xl border appearance-none focus:outline-none transition-all ${
                    errors.serviceType ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-bbd-navy focus:bg-white'
                  }`}
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.serviceType && <p className="text-[11px] text-red-600 mt-1">{errors.serviceType}</p>}
            </div>

            {/* Mapbox Pickup Location Autocomplete */}
            <MapboxAddressInput
              label="Pickup Location"
              iconType="pickup"
              placeholder="Search pickup address, street or landmark..."
              value={formData.pickupLocation}
              onChange={(addr, coords) => {
                handleChange('pickupLocation', addr);
                if (coords) setPickupCoords(coords);
              }}
              error={errors.pickupLocation}
              mapboxToken={pricingConfig.mapboxPublicKey}
              showGpsButton={true}
            />

            {/* Mapbox Drop-off Location Autocomplete */}
            <MapboxAddressInput
              label="Drop-off Location"
              iconType="dropoff"
              placeholder="Search destination, street or receiver address..."
              value={formData.dropoffLocation}
              onChange={(addr, coords) => {
                handleChange('dropoffLocation', addr);
                if (coords) setDropoffCoords(coords);
              }}
              error={errors.dropoffLocation}
              mapboxToken={pricingConfig.mapboxPublicKey}
              showGpsButton={false}
            />

            {/* Interactive Mapbox Map with Pins & Route Line */}
            {(pickupCoords || dropoffCoords) && (
              <div className="pt-0.5">
                <MapboxRouteMap
                  pickup={pickupCoords}
                  dropoff={dropoffCoords}
                  pickupAddress={formData.pickupLocation}
                  dropoffAddress={formData.dropoffLocation}
                  routeGeometry={routeGeometry}
                  distanceKm={routeDistanceKm}
                  durationMinutes={routeDurationMins}
                  mapboxToken={pricingConfig.mapboxPublicKey}
                  height="180px"
                />
              </div>
            )}

            {/* Live Mapbox Distance & Dynamic Price Breakdown Banner */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-bbd-navy uppercase tracking-wider">
                    Automatic Fare Calculation
                  </span>
                </div>
                {routeDistanceKm > 0 && (
                  <span className="text-xs font-bold text-bbd-navy bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    {routeDistanceKm} km {routeDurationMins > 0 ? `(~${routeDurationMins} mins)` : ''}
                  </span>
                )}
              </div>

              {isCalculatingRoute ? (
                <div className="py-2 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-bbd-navy" />
                  <span>Calculating driving route via Mapbox...</span>
                </div>
              ) : routeDistanceKm > 0 ? (
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Fare:</span>
                    <span className="font-semibold text-slate-800">₦{pricingConfig.baseFare.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance ({routeDistanceKm} km × ₦{pricingConfig.pricePerKm}/km):</span>
                    <span className="font-semibold text-slate-800">₦{fareBreakdown.distanceCost.toLocaleString()}</span>
                  </div>
                  
                  {/* Optional Waiting Fee Toggle */}
                  <label className="flex items-center justify-between pt-1 border-t border-slate-200/60 cursor-pointer">
                    <span className="text-[11px] text-slate-600">Additional Waiting Service (+₦{pricingConfig.waitingFee.toLocaleString()})</span>
                    <input
                      type="checkbox"
                      checked={includeWaitingFee}
                      onChange={(e) => {
                        setIncludeWaitingFee(e.target.checked);
                        setFormData((prev) => ({ ...prev, waitingFeeApplied: e.target.checked }));
                      }}
                      className="w-3.5 h-3.5 text-bbd-navy rounded"
                    />
                  </label>

                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-200 font-bold">
                    <span className="text-xs text-bbd-navy">Total Delivery Fare:</span>
                    <div className="text-right">
                      <span className="text-base text-bbd-navy font-black">₦{fareBreakdown.finalFare.toLocaleString()}</span>
                      {fareBreakdown.isMinimumFareApplied && (
                        <p className="text-[10px] text-amber-600 font-normal">
                          Minimum fare of ₦{pricingConfig.minimumFare.toLocaleString()} applies
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Enter pickup & drop-off locations to compute exact distance (₦{pricingConfig.pricePerKm}/km) + ₦{pricingConfig.baseFare} base fare.
                </p>
              )}
            </div>

            {/* Package Details */}
            <div>
              <label className="block text-xs font-semibold text-bbd-navy mb-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-bbd-navy" />
                <span>Package Details</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Document, Food, Parcel (optional)"
                  value={formData.packageDetails}
                  onChange={(e) => handleChange('packageDetails', e.target.value)}
                  className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 text-slate-800 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-bbd-navy focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Red Continue CTA Button */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3.5 px-4 bg-bbd-red hover:bg-bbd-red-hover active:bg-bbd-red-hover text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all group"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </motion.form>
        )}

        {/* STEP 2: Sender & Receiver Details */}
        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleContinueStep2}
            className="space-y-3.5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-bbd-navy mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-bbd-navy" />
                  <span>Sender Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={formData.senderName}
                  onChange={(e) => handleChange('senderName', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-slate-50 text-xs sm:text-sm rounded-xl border focus:outline-none ${
                    errors.senderName ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-bbd-navy focus:bg-white'
                  }`}
                />
                {errors.senderName && <p className="text-[10px] text-red-600 mt-0.5">{errors.senderName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-bbd-navy mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-bbd-navy" />
                  <span>Sender Phone *</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 08123456789"
                  value={formData.senderPhone}
                  onChange={(e) => handleChange('senderPhone', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-slate-50 text-xs sm:text-sm rounded-xl border focus:outline-none ${
                    errors.senderPhone ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-bbd-navy focus:bg-white'
                  }`}
                />
                {errors.senderPhone && <p className="text-[10px] text-red-600 mt-0.5">{errors.senderPhone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-bbd-navy mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-bbd-navy" />
                <span>Sender Email (Optional)</span>
              </label>
              <input
                type="email"
                placeholder="name@example.com (optional)"
                value={formData.senderEmail}
                onChange={(e) => handleChange('senderEmail', e.target.value)}
                className={`w-full px-3 py-2.5 bg-slate-50 text-xs sm:text-sm rounded-xl border focus:outline-none ${
                  errors.senderEmail ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-bbd-navy focus:bg-white'
                }`}
              />
              {errors.senderEmail && <p className="text-[10px] text-red-600 mt-0.5">{errors.senderEmail}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-bbd-navy mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-bbd-navy" />
                  <span>Recipient Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="Recipient full name"
                  value={formData.receiverName}
                  onChange={(e) => handleChange('receiverName', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-slate-50 text-xs sm:text-sm rounded-xl border focus:outline-none ${
                    errors.receiverName ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-bbd-navy focus:bg-white'
                  }`}
                />
                {errors.receiverName && <p className="text-[10px] text-red-600 mt-0.5">{errors.receiverName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-bbd-navy mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-bbd-navy" />
                  <span>Recipient Phone *</span>
                </label>
                <input
                  type="tel"
                  placeholder="Recipient contact phone"
                  value={formData.receiverPhone}
                  onChange={(e) => handleChange('receiverPhone', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-slate-50 text-xs sm:text-sm rounded-xl border focus:outline-none ${
                    errors.receiverPhone ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-bbd-navy focus:bg-white'
                  }`}
                />
                {errors.receiverPhone && <p className="text-[10px] text-red-600 mt-0.5">{errors.receiverPhone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-bbd-navy mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-bbd-navy" />
                <span>Recipient Email (Optional)</span>
              </label>
              <input
                type="email"
                placeholder="recipient@example.com (optional)"
                value={formData.receiverEmail}
                onChange={(e) => handleChange('receiverEmail', e.target.value)}
                className={`w-full px-3 py-2.5 bg-slate-50 text-xs sm:text-sm rounded-xl border focus:outline-none ${
                  errors.receiverEmail ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-bbd-navy focus:bg-white'
                }`}
              />
              {errors.receiverEmail && <p className="text-[10px] text-red-600 mt-0.5">{errors.receiverEmail}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-bbd-navy mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-bbd-navy" />
                <span>Delivery Instructions (Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Call upon arrival at the gate, handle with care"
                value={formData.deliveryInstructions}
                onChange={(e) => handleChange('deliveryInstructions', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-bbd-navy focus:bg-white focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 py-3 px-4 bg-bbd-red hover:bg-bbd-red-hover text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all group"
              >
                <span>Review Details</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </motion.form>
        )}

        {/* STEP 3: Review Details */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Interactive Route Map Preview */}
            {(pickupCoords || dropoffCoords) && (
              <MapboxRouteMap
                pickup={pickupCoords}
                dropoff={dropoffCoords}
                pickupAddress={formData.pickupLocation}
                dropoffAddress={formData.dropoffLocation}
                routeGeometry={routeGeometry}
                distanceKm={routeDistanceKm}
                durationMinutes={routeDurationMins}
                mapboxToken={pricingConfig.mapboxPublicKey}
                height="165px"
              />
            )}

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-bbd-navy">{formData.serviceType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Pickup:</span>
                <span className="font-medium text-slate-800 text-right max-w-[65%] truncate">{formData.pickupLocation}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Drop-off:</span>
                <span className="font-medium text-slate-800 text-right max-w-[65%] truncate">{formData.dropoffLocation}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Sender:</span>
                <span className="font-medium text-slate-800">{formData.senderName} ({formData.senderPhone}{formData.senderEmail ? ` | ${formData.senderEmail}` : ''})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Recipient:</span>
                <span className="font-medium text-slate-800 text-right max-w-[65%] truncate">
                  {formData.receiverName} ({formData.receiverPhone}{formData.receiverEmail ? ` | ${formData.receiverEmail}` : ''})
                </span>
              </div>
              {formData.packageDetails && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Package:</span>
                  <span className="font-medium text-slate-800">{formData.packageDetails}</span>
                </div>
              )}
              {formData.deliveryInstructions && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Note:</span>
                  <span className="font-medium text-slate-800 italic">{formData.deliveryInstructions}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Route Distance:</span>
                <span className="font-semibold text-bbd-navy">
                  {routeDistanceKm > 0 ? `${routeDistanceKm} km (~${routeDurationMins} mins driving)` : 'Standard Dispatch'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                <span className="font-bold text-slate-700">Total Delivery Fare:</span>
                <div className="text-right">
                  <span className="font-black text-emerald-800 text-base">
                    ₦{fareBreakdown.finalFare.toLocaleString()}
                  </span>
                  {fareBreakdown.isMinimumFareApplied && (
                    <span className="block text-[10px] text-emerald-600 font-normal">
                      (Minimum fare threshold applied)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-bbd-navy">
              <Clock className="w-4 h-4 text-bbd-navy flex-shrink-0 mt-0.5" />
              <p>Our dispatch coordinator will confirm pickup availability and rider schedule immediately upon submission.</p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => setStep(2)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={loading}
                onClick={handleSubmitFinal}
                className="flex-1 py-3.5 px-4 bg-bbd-red hover:bg-bbd-red-hover text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Booking...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Dispatch Rider</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Success Confirmation */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-4 space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>

            <div>
              <h3 className="text-xl font-bold text-bbd-navy">Booking Confirmed!</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Your dispatch request has been securely registered.
              </p>
            </div>

            {confirmedRef && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-w-xs mx-auto relative group">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                  Booking Reference
                </span>
                <div className="flex items-center justify-center gap-2 mt-0.5">
                  <span className="text-base sm:text-lg font-mono font-bold text-bbd-red">
                    {confirmedRef}
                  </span>
                  <button
                    onClick={handleCopyRef}
                    className="p-1 text-slate-400 hover:text-bbd-navy transition-colors rounded"
                    title="Copy reference"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {(formData.senderEmail || formData.receiverEmail) && (
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-center gap-2 max-w-sm mx-auto text-center">
                <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Booking confirmation &amp; OTP codes dispatched to{' '}
                  <strong>{formData.senderEmail}</strong>
                  {formData.receiverEmail ? (
                    <> and recipient at <strong>{formData.receiverEmail}</strong></>
                  ) : null}.
                </span>
              </div>
            )}

            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-left space-y-1.5">
              <p className="font-semibold text-bbd-navy">What happens next?</p>
              <p>1. Our dispatch supervisor reviews your pickup location.</p>
              <p>2. A verified BBD Mobility rider is assigned.</p>
              <p>3. You will receive a phone call at <strong className="text-bbd-navy">{formData.senderPhone}</strong> to coordinate pickup.</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <a
                href="tel:+2347087531148"
                className="flex-1 py-2.5 px-4 bg-bbd-navy hover:bg-bbd-navy-light text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Dispatch Desk</span>
              </a>
              <button
                type="button"
                onClick={resetForm}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Book Another Delivery
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

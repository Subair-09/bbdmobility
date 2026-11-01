import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2, X, Compass, CheckCircle2 } from 'lucide-react';
import { 
  searchGooglePlaces, 
  geocodeGoogleAddress,
  reverseGeocodeGoogle,
  PlaceSuggestion
} from '../services/googleMapsService';
import { getLagosAreaCoordinates, LAGOS_FALLBACK_HUBS } from '../services/mapboxService';

interface GoogleAddressInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (address: string, coords?: { lat: number; lng: number }) => void;
  error?: string;
  googleApiKey?: string;
  iconType?: 'pickup' | 'dropoff';
  showGpsButton?: boolean;
}

export const GoogleAddressInput: React.FC<GoogleAddressInputProps> = ({
  label,
  placeholder = 'Search street, area or estate in Lagos / Nigeria...',
  value,
  onChange,
  error,
  googleApiKey,
  iconType = 'pickup',
  showGpsButton = true
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [hasVerifiedCoords, setHasVerifiedCoords] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const blurTimerRef = useRef<any>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setQuery(value);
    if (!value.trim()) {
      setHasVerifiedCoords(false);
      setSelectedCoords(null);
    }
  }, [value]);

  // Debounced search with Google Places API (New)
  useEffect(() => {
    if (!isOpen) return;
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const trimmed = query.trim();
        const qLower = trimmed.toLowerCase();

        // 1. Fetch from Google Places API (New)
        const googleResults = await searchGooglePlaces(trimmed, googleApiKey);

        // 2. Local instant match as supplementary backup
        const localMatches: PlaceSuggestion[] = [];
        for (const h of LAGOS_FALLBACK_HUBS) {
          const hName = h.name.toLowerCase();
          const hArea = h.area.toLowerCase();
          if (hName.includes(qLower) || hArea.includes(qLower)) {
            localMatches.push({
              id: `hub-${h.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
              placeName: `${h.name}, ${h.area}`,
              text: h.name,
              coordinates: [h.lng, h.lat],
              context: h.area,
              isVerified: true,
              category: 'hub'
            });
            if (localMatches.length >= 3) break;
          }
        }

        // 3. User custom address card
        const bestCoords = googleResults.length > 0 
          ? googleResults[0].coordinates 
          : (localMatches.length > 0 ? localMatches[0].coordinates : getLagosAreaCoordinates(trimmed));

        const exactItem: PlaceSuggestion = {
          id: `exact-user-${Date.now()}`,
          placeName: trimmed.toLowerCase().includes('lagos') || trimmed.toLowerCase().includes('nigeria')
            ? trimmed
            : `${trimmed}, Lagos, Nigeria`,
          text: trimmed,
          coordinates: bestCoords,
          context: 'Use Custom Address as Typed',
          isExactUserAddress: true,
          isVerified: true,
          category: 'exact'
        };

        // Combine & deduplicate
        const combined = [...googleResults, ...localMatches, exactItem];
        const seen = new Set<string>();
        const deduped: PlaceSuggestion[] = [];
        for (const item of combined) {
          const k = item.placeName.toLowerCase().replace(/[\s,.-]+/g, '');
          if (!seen.has(k)) {
            seen.add(k);
            deduped.push(item);
          }
        }

        setSuggestions(deduped.slice(0, 6));
      } catch (err) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 240);

    return () => clearTimeout(timer);
  }, [query, isOpen, googleApiKey]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: PlaceSuggestion) => {
    const coords = { lat: item.coordinates[1], lng: item.coordinates[0] };
    setQuery(item.placeName);
    setSelectedCoords(coords);
    setHasVerifiedCoords(true);
    onChange(item.placeName, coords);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setIsOpen(true);
    setHasVerifiedCoords(false);
    // Notify parent about text change without pushing unverified coords
    onChange(text, undefined);
  };

  const handleBlur = () => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);

    blurTimerRef.current = setTimeout(async () => {
      const trimmed = query.trim();
      if (!trimmed || trimmed.length < 2) return;

      if (hasVerifiedCoords && selectedCoords) return;

      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
        return;
      }

      // Geocode address via Google
      try {
        const resolved = await geocodeGoogleAddress(trimmed, googleApiKey);
        if (resolved) {
          const coords = { lat: resolved[1], lng: resolved[0] };
          setSelectedCoords(coords);
          setHasVerifiedCoords(true);
          onChange(trimmed, coords);
        } else {
          const fallback = getLagosAreaCoordinates(trimmed);
          const coords = { lat: fallback[1], lng: fallback[0] };
          setSelectedCoords(coords);
          setHasVerifiedCoords(true);
          onChange(trimmed, coords);
        }
      } catch (err) {
        console.warn('[GoogleAddressInput] Blur Geocode Error:', err);
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else if (query.trim().length >= 2) {
        geocodeGoogleAddress(query, googleApiKey).then((resolved) => {
          if (resolved) {
            const coords = { lat: resolved[1], lng: resolved[0] };
            setSelectedCoords(coords);
            setHasVerifiedCoords(true);
            onChange(query, coords);
            setIsOpen(false);
          }
        });
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setHasVerifiedCoords(false);
    setSelectedCoords(null);
    onChange('', undefined);
    setIsOpen(false);
  };

  // Browser GPS Geolocation via Google Reverse Geocoding
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const defaultName = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        try {
          const formatted = await reverseGeocodeGoogle(lat, lng, googleApiKey);
          const finalAddress = formatted || defaultName;
          setQuery(finalAddress);
          setSelectedCoords({ lat, lng });
          setHasVerifiedCoords(true);
          onChange(finalAddress, { lat, lng });
        } catch {
          setQuery(defaultName);
          setSelectedCoords({ lat, lng });
          setHasVerifiedCoords(true);
          onChange(defaultName, { lat, lng });
        } finally {
          setGpsLoading(false);
          setIsOpen(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-bbd-navy flex items-center gap-1.5">
          <MapPin
            className={`w-3.5 h-3.5 ${
              iconType === 'pickup' ? 'text-emerald-600' : 'text-bbd-red'
            }`}
          />
          <span>{label}</span>
          {hasVerifiedCoords && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              <span>Google Verified</span>
            </span>
          )}
        </label>

        {showGpsButton && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={gpsLoading}
            className="text-[10px] font-semibold text-bbd-navy/80 hover:text-bbd-navy flex items-center gap-1 hover:underline transition-all disabled:opacity-50"
            title="Use current GPS device location"
          >
            {gpsLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
            ) : (
              <Navigation className="w-3 h-3 text-emerald-600" />
            )}
            <span>Current Location</span>
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-3.5 pr-14 py-3 sm:py-2.5 bg-slate-50 text-slate-800 text-xs sm:text-sm rounded-xl border focus:outline-none transition-all placeholder:text-slate-400 ${
            error
              ? 'border-red-400 bg-red-50/30'
              : hasVerifiedCoords
              ? 'border-emerald-300 bg-white focus:border-emerald-500'
              : 'border-gray-200 focus:border-bbd-navy focus:bg-white'
          }`}
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          )}

          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div
            className={`w-2 h-2 rounded-full ${
              hasVerifiedCoords 
                ? 'bg-emerald-500 ring-2 ring-emerald-200' 
                : iconType === 'pickup' 
                ? 'bg-emerald-400' 
                : 'bg-bbd-red'
            }`}
          />
        </div>
      </div>

      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-64 overflow-y-auto">
          {loading && suggestions.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-bbd-navy" />
              <span>Searching Google Places &amp; addresses...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="divide-y divide-gray-50">
              {suggestions.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevents input blur before selection
                      handleSelectSuggestion(item);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition-colors group ${
                      item.isExactUserAddress ? 'bg-emerald-50/40 hover:bg-emerald-50' : 'hover:bg-blue-50/70'
                    }`}
                  >
                    {item.isExactUserAddress ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : item.category === 'google' ? (
                      <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    ) : (
                      <Compass className="w-4 h-4 text-slate-400 group-hover:text-bbd-navy flex-shrink-0 mt-0.5 transition-colors" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {item.category === 'google' && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-blue-100 text-blue-800">
                            Google Places
                          </span>
                        )}
                        {item.category === 'hub' && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            Verified Hub
                          </span>
                        )}
                        {item.isExactUserAddress && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            Exact Address
                          </span>
                        )}
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {item.text}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.placeName}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim().length >= 2 ? (
            <div className="p-3 text-center text-xs text-slate-500">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  geocodeGoogleAddress(query, googleApiKey).then((resolved) => {
                    const coords = resolved 
                      ? { lat: resolved[1], lng: resolved[0] }
                      : { lat: getLagosAreaCoordinates(query)[1], lng: getLagosAreaCoordinates(query)[0] };
                    setSelectedCoords(coords);
                    setHasVerifiedCoords(true);
                    onChange(query, coords);
                    setIsOpen(false);
                  });
                }}
                className="text-bbd-navy font-semibold hover:underline"
              >
                Use address &amp; calculate route: &ldquo;{query}&rdquo;
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

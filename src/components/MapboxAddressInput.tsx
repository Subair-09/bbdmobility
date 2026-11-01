import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2, X, Compass, CheckCircle } from 'lucide-react';
import { 
  searchMapboxPlaces, 
  MapboxPlaceSuggestion,
  getLagosAreaCoordinates
} from '../services/mapboxService';

interface MapboxAddressInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (address: string, coords?: { lat: number; lng: number }) => void;
  error?: string;
  mapboxToken?: string;
  iconType?: 'pickup' | 'dropoff';
  showGpsButton?: boolean;
}

export const MapboxAddressInput: React.FC<MapboxAddressInputProps> = ({
  label,
  placeholder = 'Search street, area or estate in Lagos...',
  value,
  onChange,
  error,
  mapboxToken,
  iconType = 'pickup',
  showGpsButton = true
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<MapboxPlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchMapboxPlaces(query, mapboxToken);
        setSuggestions(results);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, isOpen, mapboxToken]);

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

  const handleSelectSuggestion = (item: MapboxPlaceSuggestion) => {
    setQuery(item.placeName);
    onChange(item.placeName, { lat: item.coordinates[1], lng: item.coordinates[0] });
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setIsOpen(true);
    // Link coordinates immediately so distance calculates in real time
    const coords = getLagosAreaCoordinates(text);
    onChange(text, { lat: coords[1], lng: coords[0] });
  };

  const handleBlur = () => {
    // On blur, if user typed a custom street address, ensure valid coordinates are linked
    if (query.trim().length >= 2) {
      const coords = getLagosAreaCoordinates(query);
      onChange(query, { lat: coords[1], lng: coords[0] });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[0]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    onChange('', undefined);
    setIsOpen(false);
  };

  // Browser GPS Geolocation
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

        // Attempt reverse geocoding via Mapbox
        if (mapboxToken && mapboxToken.startsWith('pk.')) {
          try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`;
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              if (data.features && data.features.length > 0) {
                const place = data.features[0].place_name;
                setQuery(place);
                onChange(place, { lat, lng });
                setGpsLoading(false);
                setIsOpen(false);
                return;
              }
            }
          } catch {}
        }

        setQuery(defaultName);
        onChange(defaultName, { lat, lng });
        setGpsLoading(false);
        setIsOpen(false);
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
              iconType === 'pickup' ? 'bg-emerald-500' : 'bg-bbd-red'
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
              <span>Searching Lagos Mapbox addresses...</span>
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
                      item.isExactUserAddress ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-blue-50/70'
                    }`}
                  >
                    {item.isExactUserAddress ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Compass className="w-4 h-4 text-slate-400 group-hover:text-bbd-navy flex-shrink-0 mt-0.5 transition-colors" />
                    )}
                    <div className="flex-1 min-w-0">
                      {item.isExactUserAddress ? (
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Exact Address
                          </span>
                          <span className="text-xs font-bold text-gray-900 truncate">
                            {item.text}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-bbd-navy">
                          {item.text}
                        </p>
                      )}
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
                  const coords = getLagosAreaCoordinates(query);
                  onChange(query, { lat: coords[1], lng: coords[0] });
                  setIsOpen(false);
                }}
                className="text-bbd-navy font-semibold hover:underline"
              >
                Use custom address: &ldquo;{query}&rdquo;
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

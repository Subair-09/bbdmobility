import React, { useEffect, useRef, useState } from 'react';
import { Compass, Navigation, Loader2 } from 'lucide-react';
import { loadGoogleMapsScript } from '../services/googleMapsService';

interface GoogleRouteMapProps {
  pickup?: { lat: number; lng: number };
  dropoff?: { lat: number; lng: number };
  pickupAddress?: string;
  dropoffAddress?: string;
  routeGeometry?: any; // GeoJSON geometry containing coordinates: [lng, lat][]
  distanceKm?: number;
  durationMinutes?: number;
  googleApiKey?: string;
  height?: string;
  className?: string;
}

export const GoogleRouteMap: React.FC<GoogleRouteMapProps> = ({
  pickup,
  dropoff,
  pickupAddress,
  dropoffAddress,
  routeGeometry,
  distanceKm,
  durationMinutes,
  googleApiKey,
  height = '210px',
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const pickupMarkerRef = useRef<google.maps.Marker | null>(null);
  const dropoffMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [loadingMap, setLoadingMap] = useState<boolean>(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize Google Maps instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;
    setLoadingMap(true);
    setMapError(null);

    loadGoogleMapsScript(googleApiKey)
      .then((gMaps) => {
        if (!isMounted || !mapContainerRef.current) return;

        const initialCenter: google.maps.LatLngLiteral = pickup
          ? { lat: pickup.lat, lng: pickup.lng }
          : dropoff
          ? { lat: dropoff.lat, lng: dropoff.lng }
          : { lat: 6.5244, lng: 3.3792 }; // Central Lagos

        const map = new gMaps.maps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;
        setLoadingMap(false);
      })
      .catch((err) => {
        console.warn('[GoogleRouteMap Load Error]:', err);
        if (isMounted) {
          setMapError('Interactive Google Map loading. Displaying GPS route overview.');
          setLoadingMap(false);
        }
      });

    return () => {
      isMounted = false;
      mapInstanceRef.current = null;
    };
  }, [googleApiKey]);

  // Update Markers & Driving Route Polyline dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !(window as any).google?.maps) return;

    const gMaps = (window as any).google.maps;
    const bounds = new gMaps.LatLngBounds();
    let hasPoints = false;

    // 1. Pickup Marker (Green Pin A)
    if (pickup) {
      const pos = { lat: pickup.lat, lng: pickup.lng };
      bounds.extend(pos);
      hasPoints = true;

      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = new gMaps.Marker({
          position: pos,
          map,
          title: pickupAddress || 'Pickup Location',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
          }
        });
      } else {
        pickupMarkerRef.current.setPosition(pos);
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setMap(null);
      pickupMarkerRef.current = null;
    }

    // 2. Dropoff Marker (Red Pin B)
    if (dropoff) {
      const pos = { lat: dropoff.lat, lng: dropoff.lng };
      bounds.extend(pos);
      hasPoints = true;

      if (!dropoffMarkerRef.current) {
        dropoffMarkerRef.current = new gMaps.Marker({
          position: pos,
          map,
          title: dropoffAddress || 'Destination',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }
        });
      } else {
        dropoffMarkerRef.current.setPosition(pos);
      }
    } else if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.setMap(null);
      dropoffMarkerRef.current = null;
    }

    // 3. Driving Polyline
    if (routeGeometry?.coordinates && Array.isArray(routeGeometry.coordinates) && routeGeometry.coordinates.length > 0) {
      const path = routeGeometry.coordinates.map((c: [number, number]) => {
        const pt = { lat: c[1], lng: c[0] };
        bounds.extend(pt);
        return pt;
      });

      if (!polylineRef.current) {
        polylineRef.current = new gMaps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#0B1B3D',
          strokeOpacity: 0.9,
          strokeWeight: 4,
          map
        });
      } else {
        polylineRef.current.setPath(path);
      }
    } else if (pickup && dropoff) {
      const directPath = [
        { lat: pickup.lat, lng: pickup.lng },
        { lat: dropoff.lat, lng: dropoff.lng }
      ];
      if (!polylineRef.current) {
        polylineRef.current = new gMaps.Polyline({
          path: directPath,
          geodesic: true,
          strokeColor: '#0B1B3D',
          strokeOpacity: 0.7,
          strokeWeight: 3,
          map
        });
      } else {
        polylineRef.current.setPath(directPath);
      }
    } else if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // 4. Auto-fit Map to bounds
    if (hasPoints) {
      if (pickup && dropoff) {
        map.fitBounds(bounds, 35);
      } else if (pickup) {
        map.setCenter({ lat: pickup.lat, lng: pickup.lng });
        map.setZoom(13);
      } else if (dropoff) {
        map.setCenter({ lat: dropoff.lat, lng: dropoff.lng });
        map.setZoom(13);
      }
    }
  }, [pickup, dropoff, pickupAddress, dropoffAddress, routeGeometry]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-slate-100 ${className}`}>
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height }} className="z-0" />

      {/* Loading Overlay */}
      {loadingMap && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center gap-2 z-10 text-xs text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin text-bbd-navy" />
          <span>Connecting Google Maps...</span>
        </div>
      )}

      {/* Fallback Notice if WebGL/API unavailable */}
      {mapError && (
        <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-4 text-center z-10">
          <Compass className="w-6 h-6 text-slate-400 mb-1" />
          <p className="text-xs font-semibold text-gray-800">Google Maps Route Preview</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{mapError}</p>
        </div>
      )}

      {/* Live Route Distance & Time Badge (Top Left) */}
      {distanceKm !== undefined && distanceKm > 0 && (
        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-gray-200/90 shadow-sm flex items-center gap-1.5 z-20">
          <Navigation className="w-3.5 h-3.5 text-bbd-red" />
          <span className="text-[11px] font-bold text-bbd-navy">
            {distanceKm} km
          </span>
          {durationMinutes !== undefined && durationMinutes > 0 && (
            <span className="text-[11px] text-slate-500 font-medium">
              • ~{durationMinutes} mins (Live Traffic)
            </span>
          )}
        </div>
      )}

      {/* Google Attribution Badge (Bottom Right) */}
      <div className="absolute bottom-1 right-2 pointer-events-none z-20">
        <span className="text-[9px] font-bold text-slate-500 bg-white/80 px-1.5 py-0.2 rounded shadow-2xs">
          Google Maps
        </span>
      </div>
    </div>
  );
};

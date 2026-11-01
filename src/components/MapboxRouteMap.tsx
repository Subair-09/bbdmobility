import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Compass } from 'lucide-react';

interface MapboxRouteMapProps {
  pickup?: { lat: number; lng: number };
  dropoff?: { lat: number; lng: number };
  pickupAddress?: string;
  dropoffAddress?: string;
  routeGeometry?: any; // GeoJSON geometry from Mapbox Directions API
  distanceKm?: number;
  durationMinutes?: number;
  mapboxToken?: string;
  height?: string;
  className?: string;
}

export const MapboxRouteMap: React.FC<MapboxRouteMapProps> = ({
  pickup,
  dropoff,
  pickupAddress,
  dropoffAddress,
  routeGeometry,
  distanceKm,
  durationMinutes,
  mapboxToken,
  height = '210px',
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const activeToken =
    mapboxToken ||
    (import.meta as any).env?.VITE_MAPBOX_TOKEN ||
    '';

  // Initialize Mapbox GL map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!activeToken) {
      setMapError('Mapbox access token is required to load interactive map.');
      return;
    }

    try {
      mapboxgl.accessToken = activeToken;

      const initialCenter: [number, number] = pickup
        ? [pickup.lng, pickup.lat]
        : dropoff
        ? [dropoff.lng, dropoff.lat]
        : [3.3792, 6.5244]; // Central Lagos

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCenter,
        zoom: 11.5,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        setIsMapLoaded(true);
        map.resize();
      });

      map.on('error', (e) => {
        console.warn('[Mapbox GL Error]:', e);
      });

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
        setIsMapLoaded(false);
      };
    } catch (err: any) {
      console.warn('[Mapbox GL Init Exception]:', err);
      setMapError('Interactive WebGL map unavailable. Showing route overview.');
    }
  }, [activeToken]);

  // Update Markers & Route Layer dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    // 1. Update Pickup Marker (Green Pin A)
    if (pickup) {
      if (!pickupMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white ring-2 ring-emerald-500/30';
        el.innerHTML = 'A';

        const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
          `<div style="font-family: inherit; font-size: 11px;">
            <strong style="color: #059669;">Pickup Location</strong><br/>
            ${pickupAddress || 'Origin'}
          </div>`
        );

        pickupMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([pickup.lng, pickup.lat])
          .setPopup(popup)
          .addTo(map);
      } else {
        pickupMarkerRef.current.setLngLat([pickup.lng, pickup.lat]);
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }

    // 2. Update Destination Marker (Red Pin B)
    if (dropoff) {
      if (!dropoffMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'w-7 h-7 rounded-full bg-bbd-red text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white ring-2 ring-red-500/30';
        el.innerHTML = 'B';

        const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
          `<div style="font-family: inherit; font-size: 11px;">
            <strong style="color: #E30620;">Destination Location</strong><br/>
            ${dropoffAddress || 'Drop-off'}
          </div>`
        );

        dropoffMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([dropoff.lng, dropoff.lat])
          .setPopup(popup)
          .addTo(map);
      } else {
        dropoffMarkerRef.current.setLngLat([dropoff.lng, dropoff.lat]);
      }
    } else if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.remove();
      dropoffMarkerRef.current = null;
    }

    // 3. Render Driving Route Line (GeoJSON from Mapbox Directions API)
    const lineCoordinates: [number, number][] =
      routeGeometry && routeGeometry.coordinates
        ? routeGeometry.coordinates
        : pickup && dropoff
        ? [
            [pickup.lng, pickup.lat],
            [dropoff.lng, dropoff.lat]
          ]
        : [];

    const routeSourceId = 'bbd-route-source';
    const routeLayerCasingId = 'bbd-route-casing';
    const routeLayerLineId = 'bbd-route-line';

    const geojsonData: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: lineCoordinates
      }
    };

    if (lineCoordinates.length >= 2) {
      if (map.getSource(routeSourceId)) {
        (map.getSource(routeSourceId) as mapboxgl.GeoJSONSource).setData(geojsonData);
      } else {
        map.addSource(routeSourceId, {
          type: 'geojson',
          data: geojsonData
        });

        // Outer white casing for high visibility over all map backgrounds
        map.addLayer({
          id: routeLayerCasingId,
          type: 'line',
          source: routeSourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FFFFFF',
            'line-width': 7,
            'line-opacity': 0.95
          }
        });

        // Inner solid BBD Navy route line
        map.addLayer({
          id: routeLayerLineId,
          type: 'line',
          source: routeSourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#0B1B3D',
            'line-width': 4.5,
            'line-opacity': 0.9
          }
        });
      }

      // Auto-fit bounds to frame the complete route
      const bounds = new mapboxgl.LngLatBounds();
      lineCoordinates.forEach((coord) => bounds.extend(coord));
      map.fitBounds(bounds, {
        padding: { top: 35, bottom: 35, left: 35, right: 35 },
        maxZoom: 14.5,
        duration: 900
      });
    } else if (pickup) {
      map.easeTo({ center: [pickup.lng, pickup.lat], zoom: 13, duration: 600 });
    } else if (dropoff) {
      map.easeTo({ center: [dropoff.lng, dropoff.lat], zoom: 13, duration: 600 });
    }
  }, [pickup, dropoff, routeGeometry, pickupAddress, dropoffAddress, isMapLoaded]);

  // Graceful fallback display if WebGL/Token is unavailable
  if (mapError) {
    return (
      <div
        style={{ height }}
        className={`w-full rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-4 text-center text-xs text-slate-500 relative overflow-hidden ${className}`}
      >
        <Compass className="w-8 h-8 text-bbd-navy/40 mb-1.5 animate-spin-slow" />
        <span className="font-bold text-bbd-navy">Lagos Delivery Route Overview</span>
        <span className="text-[11px] text-slate-400 mt-0.5">
          {distanceKm ? `${distanceKm} km • ~${durationMinutes || 25} mins` : 'Select pickup & destination to preview'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner group ${className}`}>
      {/* Mapbox Canvas Container */}
      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full bg-slate-100 transition-opacity duration-300"
      />

      {/* Floating Route Metrics Badge */}
      {distanceKm && distanceKm > 0 ? (
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-slate-200 flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-black text-bbd-navy">{distanceKm} km</span>
          <span className="text-slate-400">•</span>
          <span className="font-semibold text-slate-700">~{durationMinutes || 25} mins driving</span>
        </div>
      ) : null}

      {/* Mapbox Attribution Badge */}
      <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold text-bbd-navy/70 border border-slate-200/60 pointer-events-none">
        Mapbox GL JS
      </div>
    </div>
  );
};

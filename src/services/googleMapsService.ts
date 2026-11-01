/**
 * Google Maps Integration Service for BBD Mobility
 * Powered exclusively by Google Places API (New), Google Routes API v2,
 * Geocoding API & Google Maps JavaScript SDK.
 * 
 * Delivers pinpoint Nigerian street search, house number resolution,
 * live traffic driving distance & interactive map rendering.
 */

export interface PlaceSuggestion {
  id: string;
  placeName: string;
  text: string;
  coordinates: [number, number]; // [lng, lat]
  context?: string;
  isExactUserAddress?: boolean;
  isVerified?: boolean;
  category?: 'google' | 'hub' | 'exact';
}

export interface RouteCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  polyline?: {
    type: string;
    coordinates: [number, number][]; // [lng, lat][]
  } | null;
  source: 'google-routes-api' | 'haversine-road-fallback';
}

// Memory cache for place details (avoid redundant Google billing)
const placeDetailsCache = new Map<string, { address: string; coords: [number, number] }>();

// Memory cache for routes (1-hour TTL)
const routeCache = new Map<string, { distanceKm: number; durationMinutes: number; polyline: any; cachedAt: number }>();
const ROUTE_CACHE_TTL_MS = 1000 * 60 * 60;

/**
 * Loads the Google Maps JavaScript API dynamically once
 */
export function loadGoogleMapsScript(apiKey?: string): Promise<typeof google> {
  const key = apiKey || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    return Promise.resolve((window as any).google);
  }

  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      return reject(new Error('Document is not defined'));
    }

    const existing = document.getElementById('bbd-google-maps-script');
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).google));
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'bbd-google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve((window as any).google);
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
}

/**
 * Decodes Google encoded polyline string into GeoJSON coordinates [longitude, latitude]
 */
export function decodeGooglePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    // GeoJSON format requires [longitude, latitude]
    points.push([lng * 1e-5, lat * 1e-5]);
  }
  return points;
}

/**
 * Search Google Places API (New) for Nigerian street addresses & landmarks
 */
export async function searchGooglePlaces(
  query: string,
  apiKey?: string
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const key = apiKey || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  if (!key || !key.startsWith('AIzaSy')) return [];

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key
      },
      body: JSON.stringify({
        input: trimmed,
        includedRegionCodes: ['ng'],
        locationBias: {
          circle: {
            center: { latitude: 6.5244, longitude: 3.3792 }, // Lagos centroid
            radius: 50000.0 // 50km radius
          }
        }
      })
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.suggestions) || data.suggestions.length === 0) return [];

    const suggestions: PlaceSuggestion[] = [];

    // Fetch place coordinates for top predictions
    const predictionsToFetch = data.suggestions
      .filter((s: any) => s.placePrediction?.placeId)
      .slice(0, 5);

    for (const item of predictionsToFetch) {
      const pred = item.placePrediction;
      const placeId = pred.placeId;
      const fullText = pred.text?.text || trimmed;
      const mainText = pred.structuredFormat?.mainText?.text || fullText.split(',')[0];
      const secondaryText = pred.structuredFormat?.secondaryText?.text || 'Nigeria';

      // Check cache first
      let resolved = placeDetailsCache.get(placeId);
      if (!resolved) {
        try {
          const detailRes = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': key,
              'X-Goog-FieldMask': 'id,displayName,formattedAddress,location'
            }
          });

          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData.location?.latitude && detailData.location?.longitude) {
              resolved = {
                address: detailData.formattedAddress || fullText,
                coords: [detailData.location.longitude, detailData.location.latitude]
              };
              placeDetailsCache.set(placeId, resolved);
            }
          }
        } catch {}
      }

      if (resolved) {
        suggestions.push({
          id: `gplace-${placeId}`,
          placeName: resolved.address,
          text: mainText,
          coordinates: resolved.coords,
          context: secondaryText,
          isVerified: true,
          category: 'google'
        });
      }
    }

    return suggestions;
  } catch (err) {
    console.warn('[Google Places API Error]:', err);
    return [];
  }
}

/**
 * Calculates road driving distance & travel time via Google Routes API v2
 */
export async function calculateGoogleDrivingRoute(
  pickupCoords: [number, number],
  dropoffCoords: [number, number],
  apiKey?: string
): Promise<RouteCalculationResult> {
  // Check identical locations
  const isSameLocation =
    Math.abs(pickupCoords[0] - dropoffCoords[0]) < 0.0001 &&
    Math.abs(pickupCoords[1] - dropoffCoords[1]) < 0.0001;

  if (isSameLocation) {
    return {
      distanceKm: 0,
      durationMinutes: 0,
      polyline: null,
      source: 'google-routes-api'
    };
  }

  const cacheKey = `groute-${pickupCoords[0].toFixed(4)},${pickupCoords[1].toFixed(4)}->${dropoffCoords[0].toFixed(4)},${dropoffCoords[1].toFixed(4)}`;
  const cached = routeCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < ROUTE_CACHE_TTL_MS) {
    return {
      distanceKm: cached.distanceKm,
      durationMinutes: cached.durationMinutes,
      polyline: cached.polyline,
      source: 'google-routes-api'
    };
  }

  const key = apiKey || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  if (key && key.startsWith('AIzaSy')) {
    try {
      const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: pickupCoords[1],
                longitude: pickupCoords[0]
              }
            }
          },
          destination: {
            location: {
              latLng: {
                latitude: dropoffCoords[1],
                longitude: dropoffCoords[0]
              }
            }
          },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKm = Number((route.distanceMeters / 1000).toFixed(1));
          const durationSeconds = parseInt(route.duration) || 0;
          const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

          let geoJsonPolyline: any = null;
          if (route.polyline?.encodedPolyline) {
            const decodedCoordinates = decodeGooglePolyline(route.polyline.encodedPolyline);
            geoJsonPolyline = {
              type: 'LineString',
              coordinates: decodedCoordinates
            };
          }

          const result: RouteCalculationResult = {
            distanceKm: Math.max(0.5, distanceKm),
            durationMinutes,
            polyline: geoJsonPolyline,
            source: 'google-routes-api'
          };

          routeCache.set(cacheKey, {
            distanceKm: result.distanceKm,
            durationMinutes: result.durationMinutes,
            polyline: result.polyline,
            cachedAt: Date.now()
          });

          return result;
        }
      }
    } catch (err) {
      console.warn('[Google Routes API Error]:', err);
    }
  }

  // Fallback: Road-network adjusted calculation (1.32x urban curvature factor)
  const R = 6371;
  const dLat = (dropoffCoords[1] - pickupCoords[1]) * Math.PI / 180;
  const dLon = (dropoffCoords[0] - pickupCoords[0]) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pickupCoords[1] * Math.PI / 180) * Math.cos(dropoffCoords[1] * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  const roadDistance = Math.max(0.5, Number((straightLine * 1.32).toFixed(1)));
  const durationMinutes = Math.max(10, Math.round((roadDistance / 22) * 60));

  return {
    distanceKm: roadDistance,
    durationMinutes,
    source: 'haversine-road-fallback'
  };
}

/**
 * Forward Geocoding: Converts an address string into [lng, lat]
 */
export async function geocodeGoogleAddress(
  address: string,
  apiKey?: string
): Promise<[number, number] | null> {
  const trimmed = address.trim();
  if (!trimmed || trimmed.length < 2) return null;

  const key = apiKey || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  if (!key || !key.startsWith('AIzaSy')) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(trimmed)}&components=country:NG&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      return [loc.lng, loc.lat];
    }
  } catch {}
  return null;
}

/**
 * Reverse Geocoding: Converts GPS [lat, lng] into a clean Nigerian street address
 */
export async function reverseGeocodeGoogle(
  lat: number,
  lng: number,
  apiKey?: string
): Promise<string | null> {
  const key = apiKey || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  if (!key || !key.startsWith('AIzaSy')) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
  } catch {}
  return null;
}

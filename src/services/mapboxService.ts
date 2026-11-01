/**
 * Mapbox Geocoding, Driving Directions & Pricing Service
 * Designed for Lagos and Nigeria delivery logistics with offline fallback.
 */

export interface MapboxPlaceSuggestion {
  id: string;
  placeName: string;
  text: string;
  coordinates: [number, number]; // [lng, lat]
  context?: string;
  isExactUserAddress?: boolean;
}

export interface RouteCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  polyline?: any;
  source: 'mapbox-directions-api' | 'haversine-road-fallback';
}

export interface PricingBreakdown {
  baseFare: number;
  pricePerKm: number;
  distanceKm: number;
  distanceCost: number;
  waitingFee: number;
  subtotal: number;
  minimumFare: number;
  finalFare: number;
  isMinimumFareApplied: boolean;
}

// Curated high-accuracy Lagos hubs, residential streets & commercial zones
export const LAGOS_FALLBACK_HUBS: Array<{ name: string; area: string; lng: number; lat: number }> = [
  // User specific street & Egbe / Ikotun / Alimosho area
  { name: '35 Hammed Oghere Street', area: 'Egbe, Ikotun, Alimosho, Lagos', lng: 3.2842, lat: 6.5458 },
  { name: '43 Hammed Oghere Street', area: 'Egbe, Ikotun, Alimosho, Lagos', lng: 3.2842, lat: 6.5458 },
  { name: 'Hammed Oghere Street (off Laisu Rd)', area: 'Egbe, Ikotun, Alimosho, Lagos', lng: 3.2842, lat: 6.5458 },
  { name: 'St. Francis Catholic Secondary School', area: 'Hammed Oghere St, Egbe, Lagos', lng: 3.2840, lat: 6.5455 },
  { name: 'Laisu Road & Hammed Oghere Junction', area: 'Egbe, Ikotun, Lagos', lng: 3.2835, lat: 6.5450 },
  { name: 'Egbe Roundabout & Laisu Junction', area: 'Egbe, Alimosho, Lagos', lng: 3.2855, lat: 6.5465 },
  { name: 'Ikotun Bus Stop & Market', area: 'Ikotun, Alimosho, Lagos', lng: 3.2678, lat: 6.5518 },
  { name: 'Idimu Road & Council Bus Stop', area: 'Idimu, Alimosho, Lagos', lng: 3.2754, lat: 6.5684 },
  { name: 'Ejigbo, NNPC Bus Stop & Iyana Ejigbo', area: 'Ejigbo, Oshodi-Isolo, Lagos', lng: 3.2984, lat: 6.5412 },
  { name: 'Isolo, Oke-Afa & Ajao Estate', area: 'Isolo, Lagos', lng: 3.3214, lat: 6.5342 },

  // Mushin & Surulere Area
  { name: '23 Amodu Street, Itire', area: 'Mushin, Lagos', lng: 3.3489, lat: 6.5186 },
  { name: 'Mushin, Palm Avenue & Agege Motor Rd', area: 'Mushin, Lagos', lng: 3.3534, lat: 6.5298 },
  { name: 'Surulere, Adeniran Ogunsanya', area: 'Surulere, Lagos', lng: 3.3571, lat: 6.4969 },
  { name: 'Surulere, Bode Thomas Street', area: 'Surulere, Lagos', lng: 3.3524, lat: 6.4912 },
  { name: 'National Stadium & Ojuelegba', area: 'Surulere, Lagos', lng: 3.3642, lat: 6.5021 },

  // Ikeja & Mainland Hubs
  { name: 'Ikeja GRA & Allen Avenue', area: 'Ikeja, Lagos', lng: 3.3551, lat: 6.5986 },
  { name: 'Alausa Central Business District', area: 'Ikeja, Lagos', lng: 3.3619, lat: 6.6186 },
  { name: 'Computer Village, Otigba Street', area: 'Ikeja, Lagos', lng: 3.3402, lat: 6.5934 },
  { name: 'Maryland Mall & Anthony Village', area: 'Maryland, Lagos', lng: 3.3684, lat: 6.5714 },
  { name: 'Gbagada Phase 1 & 2 Estates', area: 'Gbagada, Lagos', lng: 3.3861, lat: 6.5562 },
  { name: 'Yaba, Commercial Avenue / Sabo Hub', area: 'Yaba, Lagos', lng: 3.3769, lat: 6.5115 },
  { name: 'Yaba, University of Lagos (UNILAG) Akoka', area: 'Yaba, Lagos', lng: 3.3984, lat: 6.5173 },
  { name: 'Festac Town, 21 Road / 1st Avenue', area: 'Festac, Amuwo-Odofin, Lagos', lng: 3.2874, lat: 6.4678 },
  { name: 'Apapa Port & Wharf Commercial Road', area: 'Apapa, Lagos', lng: 3.3639, lat: 6.4442 },
  { name: 'Magodo GRA Phase 2', area: 'Kosofe, Lagos', lng: 3.3812, lat: 6.6214 },
  { name: 'Ogba, Excellence Hotel & Haruna', area: 'Ikeja/Ogba, Lagos', lng: 3.3371, lat: 6.6342 },
  { name: 'Agege Pen Cinema & Capitol Road', area: 'Agege, Lagos', lng: 3.3242, lat: 6.6219 },
  { name: 'Ikorodu Garage Roundabout & Agric', area: 'Ikorodu, Lagos', lng: 3.5042, lat: 6.6189 },
  { name: 'Oshodi Bus Interchange & Airport Road', area: 'Oshodi-Isolo, Lagos', lng: 3.3482, lat: 6.5518 },
  { name: 'Murtala Muhammed International Airport (MMIA)', area: 'Ikeja, Lagos', lng: 3.3214, lat: 6.5774 },

  // Island & Lekki Hubs
  { name: 'Lekki Phase 1, Admiralty Way', area: 'Lekki, Lagos', lng: 3.4735, lat: 6.4474 },
  { name: 'Chevron Drive & Agungi', area: 'Lekki, Lagos', lng: 3.5356, lat: 6.4389 },
  { name: 'Victoria Island, Adeola Odeku', area: 'Victoria Island, Lagos', lng: 3.4219, lat: 6.4281 },
  { name: 'Victoria Island, Ahmadu Bello Way', area: 'Victoria Island, Lagos', lng: 3.4143, lat: 6.4253 },
  { name: 'Ikoyi, Kingsway Road / Glover', area: 'Ikoyi, Lagos', lng: 3.4402, lat: 6.4524 },
  { name: 'Banana Island Residential Estate', area: 'Ikoyi, Lagos', lng: 3.4568, lat: 6.4632 },
  { name: 'Ajah Roundabout & Badore Road', area: 'Ajah, Eti-Osa, Lagos', lng: 3.5684, lat: 6.4686 },
  { name: 'Sangotedo, Novare Mall / Shoprite', area: 'Sangotedo, Lagos', lng: 3.6189, lat: 6.4719 }
];

/**
 * Calculates straight line distance adjusted for Lagos urban road network curvature (~1.32x)
 */
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  // Road network factor for Lagos terrain and bridges (1.32x straight line)
  const roadDistance = straightLine * 1.32;
  return Number(Math.max(1.0, roadDistance).toFixed(1));
}

/**
 * Helper to detect area center coordinates when custom addresses are typed
 */
export function getLagosAreaCoordinates(text: string): [number, number] {
  const t = text.toLowerCase();
  if (t.includes('hammed oghere') || t.includes('oghere') || t.includes('egbe') || t.includes('laisu')) {
    return [3.2842, 6.5458]; // Hammed Oghere / Egbe, Alimosho
  }
  if (t.includes('amodu') || t.includes('mushin') || t.includes('itire')) {
    return [3.3489, 6.5186]; // Mushin / Itire
  }
  if (t.includes('ikotun')) return [3.2678, 6.5518];
  if (t.includes('surulere') || t.includes('adeniran') || t.includes('bode thomas')) return [3.3571, 6.4969];
  if (t.includes('ikeja') || t.includes('allen') || t.includes('alausa')) return [3.3551, 6.5986];
  if (t.includes('lekki') || t.includes('admiralty') || t.includes('chevron')) return [3.4735, 6.4474];
  if (t.includes('victoria island') || t.includes('vi') || t.includes('adeola odeku')) return [3.4219, 6.4281];
  if (t.includes('ikoyi') || t.includes('banana island')) return [3.4402, 6.4524];
  if (t.includes('yaba') || t.includes('sabo') || t.includes('akoka')) return [3.3769, 6.5115];
  if (t.includes('gbagada') || t.includes('anthony') || t.includes('maryland')) return [3.3684, 6.5714];
  if (t.includes('festac')) return [3.2874, 6.4678];
  if (t.includes('ajah') || t.includes('sangotedo')) return [3.5684, 6.4686];
  if (t.includes('ikorodu')) return [3.5042, 6.6189];
  if (t.includes('oshodi')) return [3.3482, 6.5518];
  if (t.includes('agege')) return [3.3242, 6.6219];

  // Default Central Lagos
  return [3.3792, 6.5244];
}

/**
 * Search Mapbox Geocoding Places with autocomplete for Nigeria / Lagos
 * Enhances Mapbox with smart local Nigerian neighborhood and street fuzzy matching.
 */
export async function searchMapboxPlaces(
  query: string,
  token?: string
): Promise<MapboxPlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const mapboxToken = token || (import.meta as any).env?.VITE_MAPBOX_TOKEN || '';
  const qLower = trimmed.toLowerCase();

  // 1. First, search our rich Lagos database (matches "hammed", "oghere", "35 hammed oghere", "amodu", etc.)
  const localMatches = LAGOS_FALLBACK_HUBS.filter(h => {
    const hubName = h.name.toLowerCase();
    const hubArea = h.area.toLowerCase();
    const words = qLower.split(/\s+/).filter(w => w.length > 2);
    if (hubName.includes(qLower) || hubArea.includes(qLower)) return true;
    return words.length > 0 && words.some(w => hubName.includes(w) || hubArea.includes(w));
  });

  const localSuggestions: MapboxPlaceSuggestion[] = localMatches.slice(0, 4).map(m => ({
    id: `hub-${m.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
    placeName: `${m.name}, ${m.area}`,
    text: m.name,
    coordinates: [m.lng, m.lat],
    context: m.area
  }));

  // 2. Query Mapbox Geocoding API if token is provided
  let mapboxSuggestions: MapboxPlaceSuggestion[] = [];
  if (mapboxToken && mapboxToken.startsWith('pk.')) {
    try {
      // Strip starting digits so Mapbox searches the street name even if house number is not indexed
      const searchTerms = [trimmed];
      const streetWithoutNum = trimmed.replace(/^\d+[\s,-]*/, '').trim();
      if (streetWithoutNum && streetWithoutNum !== trimmed && streetWithoutNum.length > 2) {
        searchTerms.push(streetWithoutNum);
      }

      for (const term of searchTerms) {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(term)}.json?country=ng&proximity=3.3792,6.5244&bbox=2.6,6.2,4.5,6.8&limit=5&access_token=${mapboxToken}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.features) && data.features.length > 0) {
            // Filter strictly to Lagos / Nigeria locations
            const lagosFeatures = data.features.filter((f: any) => {
              const name = (f.place_name || '').toLowerCase();
              return name.includes('lagos') || (f.center && f.center[0] >= 2.6 && f.center[0] <= 4.2 && f.center[1] >= 6.2 && f.center[1] <= 6.8);
            });

            const parsed = lagosFeatures.map((feat: any) => ({
              id: feat.id,
              placeName: feat.place_name,
              text: feat.text || feat.place_name.split(',')[0],
              coordinates: feat.center as [number, number],
              context: feat.context ? feat.context.map((c: any) => c.text).join(', ') : 'Lagos, Nigeria'
            }));

            mapboxSuggestions.push(...parsed);
            if (mapboxSuggestions.length >= 4) break;
          }
        }
      }
    } catch (err) {
      console.warn('[Mapbox] Geocoding API fallback:', err);
    }
  }

  // 3. Determine the best coordinate for the user's exact typed address
  const bestCoords = localSuggestions.length > 0 
    ? localSuggestions[0].coordinates 
    : getLagosAreaCoordinates(trimmed);

  // Exact custom address suggestion (ALWAYS at the top so user can click their exact input)
  const exactAddressItem: MapboxPlaceSuggestion = {
    id: `exact-user-input-${Date.now()}`,
    placeName: trimmed.toLowerCase().includes('lagos') ? trimmed : `${trimmed}, Lagos, Nigeria`,
    text: trimmed,
    coordinates: bestCoords,
    context: 'Use Exact Address As Typed',
    isExactUserAddress: true
  };

  // Combine & deduplicate suggestions
  const combined = [exactAddressItem, ...localSuggestions, ...mapboxSuggestions];
  const seen = new Set<string>();
  const deduplicated: MapboxPlaceSuggestion[] = [];

  for (const item of combined) {
    const key = item.placeName.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(item);
    }
  }

  return deduplicated.slice(0, 6);
}

/**
 * Calculates exact driving distance (km) and driving time (minutes) between 2 coordinates
 */
export async function calculateDrivingRoute(
  pickupCoords: [number, number],
  dropoffCoords: [number, number],
  token?: string
): Promise<RouteCalculationResult> {
  const mapboxToken = token || (import.meta as any).env?.VITE_MAPBOX_TOKEN || '';

  if (mapboxToken && mapboxToken.startsWith('pk.')) {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?geometries=geojson&overview=simplified&access_token=${mapboxToken}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKm = Number((route.distance / 1000).toFixed(1));
          const durationMinutes = Math.max(10, Math.round(route.duration / 60));
          return {
            distanceKm: Math.max(0.5, distanceKm),
            durationMinutes,
            polyline: route.geometry,
            source: 'mapbox-directions-api'
          };
        }
      }
    } catch (err) {
      console.warn('[Mapbox] Directions API fallback to road Haversine:', err);
    }
  }

  // Fallback: Road-network adjusted Haversine calculation
  const distanceKm = calculateHaversineDistanceKm(
    pickupCoords[1],
    pickupCoords[0],
    dropoffCoords[1],
    dropoffCoords[0]
  );
  // Average Lagos driving speed with city traffic ~22 km/h
  const durationMinutes = Math.max(12, Math.round((distanceKm / 22) * 60));

  return {
    distanceKm,
    durationMinutes,
    source: 'haversine-road-fallback'
  };
}

/**
 * Calculates the complete delivery fare breakdown using the admin pricing model:
 * Base Fare + (Distance × Price per km) + Waiting Fee -> compared with Minimum Fare
 */
export function computeDeliveryFareBreakdown(params: {
  distanceKm: number;
  baseFare?: number;
  pricePerKm?: number;
  minimumFare?: number;
  waitingFee?: number;
  includeWaitingFee?: boolean;
}): PricingBreakdown {
  const baseFare = Number(params.baseFare ?? 500);
  const pricePerKm = Number(params.pricePerKm ?? 250);
  const minimumFare = Number(params.minimumFare ?? 1500);
  const waitingFee = params.includeWaitingFee ? Number(params.waitingFee ?? 200) : 0;

  const validDistance = Math.max(0, Number(params.distanceKm) || 0);
  const distanceCost = Math.round(validDistance * pricePerKm);
  const subtotal = baseFare + distanceCost + waitingFee;
  const finalFare = Math.max(subtotal, minimumFare);

  return {
    baseFare,
    pricePerKm,
    distanceKm: validDistance,
    distanceCost,
    waitingFee,
    subtotal,
    minimumFare,
    finalFare,
    isMinimumFareApplied: finalFare > subtotal
  };
}

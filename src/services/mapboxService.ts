/**
 * Mapbox Geocoding, Driving Directions & Automatic Fare Pricing Service
 * Comprehensive coverage for Lagos (all 20 LGAs), Ogun corridor & Nigeria nationwide.
 */

import { 
  searchGooglePlaces, 
  calculateGoogleDrivingRoute, 
  geocodeGoogleAddress 
} from './googleMapsService';

export interface MapboxPlaceSuggestion {
  id: string;
  placeName: string;
  text: string;
  coordinates: [number, number]; // [lng, lat]
  context?: string;
  isExactUserAddress?: boolean;
  isVerified?: boolean;
  category?: 'hub' | 'mapbox' | 'osm' | 'exact' | 'google';
}

export interface RouteCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  polyline?: any;
  source: 'mapbox-directions-api' | 'haversine-road-fallback';
}

export interface PricingBreakdown {
  distanceKm: number;
  durationMinutes: number;
  baseFare: number;
  pricePerKm: number;
  distanceCost: number;
  distanceCharge: number;
  pricePerMinute: number;
  timeCharge: number;
  waitingCharge: number;
  waitingFee: number;
  subtotal: number;
  isMinimumFareApplied: boolean;
  subtotalBeforeVat: number;
  vatPercentage: number;
  vatAmount: number;
  totalBeforeRounding: number;
  fareRoundingIncrement: number;
  finalFare: number;
}

// Exhaustive Lagos and Nigeria residential, commercial, transport & landmark hubs
export const LAGOS_FALLBACK_HUBS: Array<{ name: string; area: string; lng: number; lat: number }> = [
  // User street & Egbe / Ikotun / Alimosho area
  { name: '35 Hammed Oghere Street', area: 'Egbe, Ikotun, Alimosho, Lagos', lng: 3.2842, lat: 6.5458 },
  { name: '43 Hammed Oghere Street', area: 'Egbe, Ikotun, Alimosho, Lagos', lng: 3.2842, lat: 6.5458 },
  { name: 'Hammed Oghere Street (off Laisu Rd)', area: 'Egbe, Ikotun, Alimosho, Lagos', lng: 3.2842, lat: 6.5458 },
  { name: 'St. Francis Catholic Secondary School', area: 'Hammed Oghere St, Egbe, Lagos', lng: 3.2840, lat: 6.5455 },
  { name: 'Laisu Road & Hammed Oghere Junction', area: 'Egbe, Ikotun, Lagos', lng: 3.2835, lat: 6.5450 },
  { name: 'Egbe Roundabout & Laisu Junction', area: 'Egbe, Alimosho, Lagos', lng: 3.2855, lat: 6.5465 },
  { name: 'Ikotun Bus Stop & Market', area: 'Ikotun, Alimosho, Lagos', lng: 3.2678, lat: 6.5518 },
  { name: 'Synagogue Church of All Nations (SCOAN)', area: 'Ikotun, Lagos', lng: 3.2731, lat: 6.5482 },
  { name: 'College Road, Ikotun', area: 'Ikotun, Alimosho, Lagos', lng: 3.2642, lat: 6.5545 },
  { name: 'Idimu Road & Council Bus Stop', area: 'Idimu, Alimosho, Lagos', lng: 3.2754, lat: 6.5684 },
  { name: 'Car Wash Bus Stop, Idimu-Egbeda', area: 'Idimu, Lagos', lng: 3.2821, lat: 6.5782 },
  { name: 'Egbeda Bus Stop & Akowonjo Road', area: 'Egbeda, Alimosho, Lagos', lng: 3.2942, lat: 6.5982 },
  { name: 'Gowon Estate & 411 Road', area: 'Egbeda/Ipaja, Lagos', lng: 3.2789, lat: 6.6045 },
  { name: 'Shagari Estate, Mosan', area: 'Alimosho, Lagos', lng: 3.2891, lat: 6.6112 },
  { name: 'Baruwa Inside & Gate', area: 'Ipaja, Lagos', lng: 3.2674, lat: 6.6189 },
  { name: 'Ayobo Bus Stop & Megida', area: 'Ayobo, Alimosho, Lagos', lng: 3.2389, lat: 6.6074 },
  { name: 'Igando Bus Stop & General Hospital', area: 'Igando, Alimosho, Lagos', lng: 3.2458, lat: 6.5689 },
  { name: 'LASU-Iba Road & Igando Market', area: 'Igando, Lagos', lng: 3.2421, lat: 6.5612 },
  { name: 'Ejigbo, NNPC Bus Stop & Iyana Ejigbo', area: 'Ejigbo, Oshodi-Isolo, Lagos', lng: 3.2984, lat: 6.5412 },
  { name: 'Bucknor Estate & Jakande Gate', area: 'Ejigbo, Lagos', lng: 3.3082, lat: 6.5365 },
  { name: 'Isolo, Oke-Afa & Canoe Bridge', area: 'Isolo, Lagos', lng: 3.3214, lat: 6.5342 },
  { name: 'Aswani Market & Isolo Way', area: 'Isolo, Lagos', lng: 3.3325, lat: 6.5298 },

  // Surulere & Mushin Area
  { name: '23 Amodu Street, Itire', area: 'Mushin, Lagos', lng: 3.3489, lat: 6.5186 },
  { name: 'Mushin, Palm Avenue & Agege Motor Rd', area: 'Mushin, Lagos', lng: 3.3534, lat: 6.5298 },
  { name: 'Ladipo Auto Spare Parts Market', area: 'Mushin, Lagos', lng: 3.3412, lat: 6.5389 },
  { name: 'Papa Ajao & Daleko Market', area: 'Mushin, Lagos', lng: 3.3478, lat: 6.5312 },
  { name: 'Surulere, Adeniran Ogunsanya', area: 'Surulere, Lagos', lng: 3.3571, lat: 6.4969 },
  { name: 'Surulere, Bode Thomas Street', area: 'Surulere, Lagos', lng: 3.3524, lat: 6.4912 },
  { name: '15 Bode Thomas Street', area: 'Surulere, Lagos', lng: 3.3524, lat: 6.4912 },
  { name: 'Ogunlana Drive & Masha Roundabout', area: 'Surulere, Lagos', lng: 3.3562, lat: 6.4984 },
  { name: 'Akerele Street & Shitta', area: 'Surulere, Lagos', lng: 3.3598, lat: 6.5012 },
  { name: 'National Stadium & Teslim Balogun', area: 'Surulere, Lagos', lng: 3.3642, lat: 6.5021 },
  { name: 'Ojuelegba Under Bridge & Tejuosho', area: 'Yaba/Surulere, Lagos', lng: 3.3689, lat: 6.5085 },
  { name: 'Lawanson Bus Stop & Itire Road', area: 'Surulere, Lagos', lng: 3.3445, lat: 6.5042 },

  // Ikeja & Mainland Hubs
  { name: 'Ikeja GRA & Allen Avenue', area: 'Ikeja, Lagos', lng: 3.3551, lat: 6.5986 },
  { name: 'Allen Avenue (Opebi Junction to Under Bridge)', area: 'Ikeja, Lagos', lng: 3.3512, lat: 6.6031 },
  { name: 'Opebi Road & Salvation Bus Stop', area: 'Ikeja, Lagos', lng: 3.3612, lat: 6.5978 },
  { name: 'Isaac John Street, Ikeja GRA', area: 'Ikeja, Lagos', lng: 3.3582, lat: 6.5891 },
  { name: 'Joel Ogunnaike Street, Ikeja GRA', area: 'Ikeja, Lagos', lng: 3.3567, lat: 6.5872 },
  { name: 'Oba Akran Avenue & Guinness', area: 'Ikeja, Lagos', lng: 3.3389, lat: 6.6012 },
  { name: 'Alausa Central Business District & Secretariat', area: 'Ikeja, Lagos', lng: 3.3619, lat: 6.6186 },
  { name: 'Ikeja City Mall (ICM)', area: 'Alausa, Ikeja, Lagos', lng: 3.3625, lat: 6.6178 },
  { name: 'Computer Village, Otigba Street', area: 'Ikeja, Lagos', lng: 3.3402, lat: 6.5934 },
  { name: 'Toyin Street & Airport Hotel', area: 'Ikeja, Lagos', lng: 3.3498, lat: 6.5954 },
  { name: 'Oregun Road (Kudirat Abiola Way)', area: 'Ikeja, Lagos', lng: 3.3712, lat: 6.6089 },
  { name: 'Maryland Mall & Anthony Village', area: 'Maryland, Lagos', lng: 3.3684, lat: 6.5714 },
  { name: 'Mende, Maryland & Sunmola Street', area: 'Maryland, Lagos', lng: 3.3721, lat: 6.5745 },
  { name: 'Gbagada Phase 1 & 2 Estates', area: 'Gbagada, Lagos', lng: 3.3861, lat: 6.5562 },
  { name: 'Charly Boy Bus Stop & Pedro', area: 'Gbagada, Lagos', lng: 3.3812, lat: 6.5512 },
  { name: 'Ogudu GRA & Ramat Crescent', area: 'Ogudu, Kosofe, Lagos', lng: 3.3912, lat: 6.5789 },
  { name: 'Yaba, Commercial Avenue / Sabo Hub', area: 'Yaba, Lagos', lng: 3.3769, lat: 6.5115 },
  { name: 'University of Lagos (UNILAG) Akoka', area: 'Yaba, Lagos', lng: 3.3984, lat: 6.5173 },
  { name: 'Yaba College of Technology (YABATECH)', area: 'Yaba, Lagos', lng: 3.3745, lat: 6.5156 },
  { name: 'Ebute Metta & Murtala Muhammed Way', area: 'Ebute Metta, Lagos', lng: 3.3812, lat: 6.4889 },
  { name: 'Oyingbo Market & Bus Terminus', area: 'Ebute Metta, Lagos', lng: 3.3834, lat: 6.4795 },
  { name: 'Festac Town, 21 Road / 1st Avenue', area: 'Festac, Amuwo-Odofin, Lagos', lng: 3.2874, lat: 6.4678 },
  { name: 'Festac Town, 7th Avenue & 23 Road', area: 'Festac, Lagos', lng: 3.2765, lat: 6.4612 },
  { name: 'Apple Junction & Mile 2', area: 'Amuwo-Odofin, Lagos', lng: 3.3125, lat: 6.4689 },
  { name: 'Trade Fair Complex & Badagry Expressway', area: 'Ojo, Lagos', lng: 3.2345, lat: 6.4612 },
  { name: 'Alaba International Market', area: 'Ojo, Lagos', lng: 3.2189, lat: 6.4578 },
  { name: 'Lagos State University (LASU) Ojo Campus', area: 'Ojo, Lagos', lng: 3.1984, lat: 6.4672 },
  { name: 'Apapa Port & Wharf Commercial Road', area: 'Apapa, Lagos', lng: 3.3639, lat: 6.4442 },
  { name: 'Magodo GRA Phase 1 (Isheri)', area: 'Kosofe, Lagos', lng: 3.3789, lat: 6.6312 },
  { name: 'Magodo GRA Phase 2 (Shangisha)', area: 'Kosofe, Lagos', lng: 3.3812, lat: 6.6214 },
  { name: 'CMD Road, Magodo & Ikosi', area: 'Kosofe, Lagos', lng: 3.3765, lat: 6.6198 },
  { name: 'Ojota Bus Stop & Old Toll Gate', area: 'Kosofe, Lagos', lng: 3.3845, lat: 6.5878 },
  { name: 'Ketu Bus Stop & Mile 12 Market', area: 'Kosofe, Lagos', lng: 3.3912, lat: 6.6045 },
  { name: 'Ogba, Excellence Hotel & Haruna', area: 'Ikeja/Ogba, Lagos', lng: 3.3371, lat: 6.6342 },
  { name: 'Agege Pen Cinema & Capitol Road', area: 'Agege, Lagos', lng: 3.3242, lat: 6.6219 },
  { name: 'Abule Egba & Ijaiye Bus Stop', area: 'Alimosho, Lagos', lng: 3.3089, lat: 6.6458 },
  { name: 'Berger Bus Stop & Ojodu Berger', area: 'Ojodu, Lagos', lng: 3.3678, lat: 6.6478 },
  { name: 'OPIC Estate & Isheri North', area: 'Lagos/Ogun Border', lng: 3.3789, lat: 6.6542 },
  { name: 'Arepo & Journalist Estate', area: 'Lagos/Ogun Border', lng: 3.3892, lat: 6.6845 },
  { name: 'Magboro & Mowe / Ibafo Corridor', area: 'Lagos/Ogun Border', lng: 3.4012, lat: 6.7125 },
  { name: 'Ikorodu Garage Roundabout & Benson', area: 'Ikorodu, Lagos', lng: 3.5042, lat: 6.6189 },
  { name: 'Agric Bus Stop & Ogolonto', area: 'Ikorodu, Lagos', lng: 3.4891, lat: 6.6078 },
  { name: 'Oshodi Bus Interchange (Terminals 1, 2, 3)', area: 'Oshodi-Isolo, Lagos', lng: 3.3482, lat: 6.5518 },
  { name: 'Ajao Estate, Chivita & Airport Link', area: 'Isolo, Lagos', lng: 3.3312, lat: 6.5542 },
  { name: 'Murtala Muhammed International Airport (MMIA Terminal 1 & 2)', area: 'Ikeja, Lagos', lng: 3.3214, lat: 6.5774 },
  { name: 'MMA2 Domestic Airport Terminal', area: 'Ikeja, Lagos', lng: 3.3325, lat: 6.5812 },

  // Island, Lekki & Epe Corridor
  { name: 'Lekki Phase 1, Admiralty Way', area: 'Lekki, Lagos', lng: 3.4735, lat: 6.4474 },
  { name: 'Admiralty Road, Lekki Phase 1', area: 'Lekki, Lagos', lng: 3.4710, lat: 6.4581 },
  { name: 'Fola Osibo Street, Lekki Phase 1', area: 'Lekki, Lagos', lng: 3.4765, lat: 6.4498 },
  { name: 'Freedom Way, Lekki Phase 1', area: 'Lekki, Lagos', lng: 3.4891, lat: 6.4435 },
  { name: 'Marwa & Lekki Right Phase 1', area: 'Lekki, Lagos', lng: 3.4682, lat: 6.4421 },
  { name: 'Ikate Elegushi & Maruwa', area: 'Lekki, Lagos', lng: 3.4982, lat: 6.4398 },
  { name: 'Osapa London & Jakande Roundabout', area: 'Lekki, Lagos', lng: 3.5189, lat: 6.4378 },
  { name: 'Agungi & Igbo-Efon Bus Stop', area: 'Lekki, Lagos', lng: 3.5312, lat: 6.4382 },
  { name: 'Chevron Drive & Chevyview Estate', area: 'Lekki, Lagos', lng: 3.5356, lat: 6.4389 },
  { name: 'Victoria Garden City (VGC) & Ikota', area: 'Lekki, Lagos', lng: 3.5512, lat: 6.4512 },
  { name: 'Ajah Roundabout & Badore Road', area: 'Ajah, Eti-Osa, Lagos', lng: 3.5684, lat: 6.4686 },
  { name: 'Addo Road & Langbasa', area: 'Ajah, Lagos', lng: 3.5789, lat: 6.4712 },
  { name: 'Sangotedo, Novare Mall / Shoprite', area: 'Sangotedo, Lagos', lng: 3.6189, lat: 6.4719 },
  { name: 'Abijo GRA & Corona School', area: 'Ibeju-Lekki, Lagos', lng: 3.6542, lat: 6.4678 },
  { name: 'Awoyaya & Mayfair Gardens', area: 'Ibeju-Lekki, Lagos', lng: 3.6845, lat: 6.4612 },
  { name: 'Lakowe Lakes Golf & Country Estate', area: 'Ibeju-Lekki, Lagos', lng: 3.7212, lat: 6.4578 },
  { name: 'Bogije & Eleko Junction', area: 'Ibeju-Lekki, Lagos', lng: 3.7645, lat: 6.4512 },
  { name: 'Dangote Refinery & Lekki Free Trade Zone', area: 'Ibeju-Lekki, Lagos', lng: 4.0212, lat: 6.4345 },
  { name: 'Victoria Island, Adeola Odeku', area: 'Victoria Island, Lagos', lng: 3.4219, lat: 6.4281 },
  { name: 'Victoria Island, Ahmadu Bello Way', area: 'Victoria Island, Lagos', lng: 3.4143, lat: 6.4253 },
  { name: 'Adetokunbo Ademola Street & Eko Hotel', area: 'Victoria Island, Lagos', lng: 3.4312, lat: 6.4312 },
  { name: '1004 Estate, Victoria Island', area: 'Victoria Island, Lagos', lng: 3.4312, lat: 6.4325 },
  { name: 'Landmark Centre & Water Corporation Rd', area: 'Victoria Island, Lagos', lng: 3.4478, lat: 6.4234 },
  { name: 'Ikoyi, Kingsway Road (Alfred Rewane)', area: 'Ikoyi, Lagos', lng: 3.4402, lat: 6.4524 },
  { name: 'Awolowo Road, Ikoyi', area: 'Ikoyi, Lagos', lng: 3.4189, lat: 6.4456 },
  { name: 'Bourdillon Road & Alexander Avenue', area: 'Ikoyi, Lagos', lng: 3.4489, lat: 6.4542 },
  { name: 'Banana Island Residential Estate', area: 'Ikoyi, Lagos', lng: 3.4568, lat: 6.4632 },
  { name: 'Parkview Estate, Ikoyi', area: 'Ikoyi, Lagos', lng: 3.4498, lat: 6.4589 },
  { name: 'Lagos Island Marina, CMS & Broad Street', area: 'Lagos Island, Lagos', lng: 3.3824, lat: 6.4562 },
  { name: 'Balogun Market & Idumota', area: 'Lagos Island, Lagos', lng: 3.3856, lat: 6.4612 },
  { name: 'TBS (Tafawa Balewa Square) & Onikan', area: 'Lagos Island, Lagos', lng: 3.4012, lat: 6.4478 }
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

  if (straightLine < 0.05) return 0;

  // Road network factor for Lagos terrain and bridges (1.32x straight line)
  const roadDistance = straightLine * 1.32;
  return Number(Math.max(0.5, roadDistance).toFixed(1));
}

/**
 * Helper to detect area center coordinates when custom addresses are typed
 */
export function getLagosAreaCoordinates(text: string): [number, number] {
  const t = text.toLowerCase();
  if (t.includes('hammed oghere') || t.includes('oghere') || t.includes('egbe') || t.includes('laisu')) {
    return [3.2842, 6.5458]; // Hammed Oghere / Egbe, Alimosho
  }
  if (t.includes('amodu') || t.includes('mushin') || t.includes('itire') || t.includes('ladipo')) {
    return [3.3489, 6.5186]; // Mushin / Itire
  }
  if (t.includes('ikotun') || t.includes('scoan')) return [3.2678, 6.5518];
  if (t.includes('idimu') || t.includes('council')) return [3.2754, 6.5684];
  if (t.includes('egbeda') || t.includes('akowonjo') || t.includes('gowon')) return [3.2942, 6.5982];
  if (t.includes('ipaja') || t.includes('baruwa') || t.includes('ayobo')) return [3.2674, 6.6189];
  if (t.includes('igando') || t.includes('iba')) return [3.2458, 6.5689];
  if (t.includes('ejigbo') || t.includes('bucknor') || t.includes('nnpc')) return [3.2984, 6.5412];
  if (t.includes('isolo') || t.includes('oke-afa') || t.includes('aswani')) return [3.3214, 6.5342];
  if (t.includes('surulere') || t.includes('adeniran') || t.includes('bode thomas') || t.includes('ogunlana') || t.includes('masha')) {
    return [3.3571, 6.4969];
  }
  if (t.includes('stadium') || t.includes('ojuelegba') || t.includes('tejuosho')) return [3.3642, 6.5021];
  if (t.includes('ikeja') || t.includes('allen') || t.includes('alausa') || t.includes('opebi') || t.includes('toyin')) {
    return [3.3551, 6.5986];
  }
  if (t.includes('computer village') || t.includes('otigba')) return [3.3402, 6.5934];
  if (t.includes('maryland') || t.includes('anthony') || t.includes('mende')) return [3.3684, 6.5714];
  if (t.includes('gbagada') || t.includes('ogudu') || t.includes('pedro')) return [3.3861, 6.5562];
  if (t.includes('yaba') || t.includes('sabo') || t.includes('akoka') || t.includes('unilag')) return [3.3769, 6.5115];
  if (t.includes('festac') || t.includes('amuwo') || t.includes('mile 2') || t.includes('apple junction')) return [3.2874, 6.4678];
  if (t.includes('trade fair') || t.includes('alaba') || t.includes('ojo') || t.includes('lasu')) return [3.2345, 6.4612];
  if (t.includes('apapa') || t.includes('wharf')) return [3.3639, 6.4442];
  if (t.includes('magodo') || t.includes('shangisha') || t.includes('cmd')) return [3.3812, 6.6214];
  if (t.includes('ogba') || t.includes('agege') || t.includes('pen cinema')) return [3.3371, 6.6342];
  if (t.includes('berger') || t.includes('ojodu') || t.includes('arepo') || t.includes('magboro')) return [3.3678, 6.6478];
  if (t.includes('ikorodu') || t.includes('ogolonto') || t.includes('agric')) return [3.5042, 6.6189];
  if (t.includes('oshodi') || t.includes('ajao')) return [3.3482, 6.5518];
  if (t.includes('airport') || t.includes('mmia') || t.includes('mma2')) return [3.3214, 6.5774];
  if (t.includes('lekki') || t.includes('admiralty') || t.includes('fola osibo') || t.includes('marwa')) return [3.4735, 6.4474];
  if (t.includes('chevron') || t.includes('agungi') || t.includes('osapa') || t.includes('ikate')) return [3.5356, 6.4389];
  if (t.includes('vgc') || t.includes('victoria garden city')) return [3.5512, 6.4512];
  if (t.includes('ajah') || t.includes('badore') || t.includes('addo')) return [3.5684, 6.4686];
  if (t.includes('sangotedo') || t.includes('novare') || t.includes('abijo') || t.includes('awoyaya')) return [3.6189, 6.4719];
  if (t.includes('eleko') || t.includes('ibeju') || t.includes('dangote') || t.includes('lakowe')) return [3.7645, 6.4512];
  if (t.includes('victoria island') || t.includes('adeola odeku') || t.includes('ahmadu bello') || t.includes('1004')) return [3.4219, 6.4281];
  if (t.includes('ikoyi') || t.includes('banana island') || t.includes('bourdillon') || t.includes('kingsway') || t.includes('parkview')) {
    return [3.4402, 6.4524];
  }
  if (t.includes('marina') || t.includes('broad street') || t.includes('cms') || t.includes('balogun') || t.includes('tbs')) {
    return [3.3824, 6.4562];
  }

  // Default Central Lagos
  return [3.3792, 6.5244];
}

/**
 * High-reliability address coordinate resolver for blur events, programmaticLookups, and verification
 */
export async function resolveAddressCoordinates(
  query: string,
  token?: string,
  googleKey?: string
): Promise<[number, number] | null> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return null;

  // 1. Google Geocoding lookup if key provided or present in env
  const gKey = googleKey || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  if (gKey && gKey.startsWith('AIzaSy')) {
    try {
      const gCoords = await geocodeGoogleAddress(trimmed, gKey);
      if (gCoords) return gCoords;
    } catch {}
  }

  const qLower = trimmed.toLowerCase();
  const words = qLower.split(/[\s,.-]+/).filter(w => w.length > 2);
  const houseNumMatch = trimmed.match(/^(\d+[\w-]*)\s+(.+)/i);
  const streetPart = houseNumMatch ? houseNumMatch[2].toLowerCase() : qLower;

  // 2. Direct local hub match
  for (const h of LAGOS_FALLBACK_HUBS) {
    const hName = h.name.toLowerCase();
    const hArea = h.area.toLowerCase();
    if (hName === qLower || `${hName}, ${hArea}` === qLower || hName.includes(streetPart) || hName.includes(qLower)) {
      return [h.lng, h.lat];
    }
    const matchCount = words.filter(w => hName.includes(w) || hArea.includes(w)).length;
    if (matchCount >= Math.min(2, words.length)) {
      return [h.lng, h.lat];
    }
  }

  // 2. Mapbox Geocoding lookup
  const mapboxToken = token || (import.meta as any).env?.VITE_MAPBOX_TOKEN || '';
  if (mapboxToken && mapboxToken.startsWith('pk.')) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?country=ng&proximity=3.3792,6.5244&limit=3&access_token=${mapboxToken}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.features) && data.features.length > 0) {
          const center = data.features[0].center;
          if (Array.isArray(center) && center.length === 2) {
            return center as [number, number];
          }
        }
      }
    } catch {}
  }

  // 3. Photon OSM fallback lookup
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&lat=6.5244&lon=3.3792&limit=3`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.features) && data.features.length > 0) {
        const coords = data.features[0].geometry?.coordinates;
        if (Array.isArray(coords) && coords.length === 2) {
          return coords as [number, number];
        }
      }
    }
  } catch {}

  // 4. Area heuristic match
  return getLagosAreaCoordinates(trimmed);
}

/**
 * Search Mapbox Geocoding Places with autocomplete for Nigeria / Lagos
 * Multi-tiered search: Smart Local Nigerian Database + Mapbox Places API + Photon OSM Fallback.
 */
export async function searchMapboxPlaces(
  query: string,
  token?: string,
  googleKey?: string
): Promise<MapboxPlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // 1. Google Places API (New) - Highest accuracy for Nigerian house numbers & streets
  const gKey = googleKey || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  let googleSuggestions: MapboxPlaceSuggestion[] = [];
  if (gKey && gKey.startsWith('AIzaSy')) {
    try {
      googleSuggestions = await searchGooglePlaces(trimmed, gKey);
    } catch (gErr) {
      console.warn('[Google Places Search Error]:', gErr);
    }
  }

  const mapboxToken = token || (import.meta as any).env?.VITE_MAPBOX_TOKEN || '';
  const qLower = trimmed.toLowerCase();
  const words = qLower.split(/[\s,.-]+/).filter(w => w.length > 2);
  const houseNumMatch = trimmed.match(/^(\d+[\w-]*)\s+(.+)/i);
  const houseNum = houseNumMatch ? houseNumMatch[1] : '';
  const streetPart = houseNumMatch ? houseNumMatch[2].toLowerCase() : qLower;

  // 2. Search our comprehensive Nigerian / Lagos database
  const localMatches: Array<{ score: number; item: MapboxPlaceSuggestion }> = [];
  for (const h of LAGOS_FALLBACK_HUBS) {
    const hName = h.name.toLowerCase();
    const hArea = h.area.toLowerCase();
    let score = 0;

    if (hName === qLower || `${hName}, ${hArea}` === qLower) {
      score = 100;
    } else if (hName.startsWith(qLower) || hName.startsWith(streetPart)) {
      score = 90;
    } else if (hName.includes(qLower) || hArea.includes(qLower)) {
      score = 80;
    } else if (hName.includes(streetPart) || hArea.includes(streetPart)) {
      score = 70;
    } else {
      const matchCount = words.filter(w => hName.includes(w) || hArea.includes(w)).length;
      if (matchCount >= Math.min(2, words.length)) {
        score = 40 + matchCount * 10;
      }
    }

    if (score > 0) {
      let displayName = `${h.name}, ${h.area}`;
      let text = h.name;
      if (houseNum && !h.name.match(new RegExp('^' + houseNum, 'i'))) {
        displayName = `${houseNum} ${h.name}, ${h.area}`;
        text = `${houseNum} ${h.name}`;
      }

      localMatches.push({
        score,
        item: {
          id: `hub-${h.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${h.lat.toFixed(3)}`,
          placeName: displayName,
          text,
          coordinates: [h.lng, h.lat],
          context: h.area,
          isVerified: true,
          category: 'hub'
        }
      });
    }
  }

  localMatches.sort((a, b) => b.score - a.score);
  const localSuggestions = localMatches.slice(0, 4).map(m => m.item);

  // 2. Query Mapbox Geocoding API (Nigeria nationwide biased to Lagos)
  const mapboxSuggestions: MapboxPlaceSuggestion[] = [];
  if (mapboxToken && mapboxToken.startsWith('pk.')) {
    try {
      const searchTerms = [trimmed];
      if (streetPart && streetPart !== qLower && streetPart.length > 2) {
        searchTerms.push(streetPart);
      }

      for (const term of searchTerms) {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(term)}.json?country=ng&proximity=3.3792,6.5244&limit=5&access_token=${mapboxToken}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.features) && data.features.length > 0) {
            const parsed: MapboxPlaceSuggestion[] = data.features.map((feat: any) => ({
              id: feat.id,
              placeName: feat.place_name,
              text: feat.text || feat.place_name.split(',')[0],
              coordinates: feat.center as [number, number],
              context: feat.context ? feat.context.map((c: any) => c.text).join(', ') : 'Lagos, Nigeria',
              isVerified: true,
              category: 'mapbox'
            }));

            mapboxSuggestions.push(...parsed);
            if (mapboxSuggestions.length >= 4) break;
          }
        }
      }
    } catch (err) {
      console.warn('[Mapbox] Geocoding API lookup:', err);
    }
  }

  // 3. Fallback to OpenStreetMap / Photon if Mapbox + local have few results
  const photonSuggestions: MapboxPlaceSuggestion[] = [];
  if (localSuggestions.length + mapboxSuggestions.length < 3) {
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&lat=6.5244&lon=3.3792&limit=4`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.features)) {
          for (const feat of data.features) {
            const p = feat.properties || {};
            const country = (p.country || '').toLowerCase();
            if (country && country !== 'nigeria' && country !== 'ng') continue;

            const name = p.name || p.street || trimmed;
            const areaParts = [p.street, p.district, p.city, p.state || 'Lagos', 'Nigeria'].filter(Boolean);
            const fullPlace = [name, ...areaParts.filter((x: string) => x !== name)].join(', ');

            if (feat.geometry?.coordinates) {
              photonSuggestions.push({
                id: `osm-${p.osm_id || Math.random().toString(36).substring(7)}`,
                placeName: fullPlace,
                text: name,
                coordinates: feat.geometry.coordinates as [number, number],
                context: areaParts.join(', '),
                isVerified: true,
                category: 'osm'
              });
            }
          }
        }
      }
    } catch {}
  }

  // 4. Determine coordinates for exact typed input card
  const bestReferenceCoords = localSuggestions.length > 0 
    ? localSuggestions[0].coordinates 
    : (mapboxSuggestions.length > 0 ? mapboxSuggestions[0].coordinates : getLagosAreaCoordinates(trimmed));

  const exactAddressItem: MapboxPlaceSuggestion = {
    id: `exact-user-input-${Date.now()}`,
    placeName: trimmed.toLowerCase().includes('lagos') || trimmed.toLowerCase().includes('nigeria') 
      ? trimmed 
      : `${trimmed}, Lagos, Nigeria`,
    text: trimmed,
    coordinates: bestReferenceCoords,
    context: 'Use Custom Address Exactly as Typed',
    isExactUserAddress: true,
    isVerified: true,
    category: 'exact'
  };

  // Combine and deduplicate (Google first, followed by local hubs, Mapbox, OSM, and exact address)
  const combined = [
    ...googleSuggestions,
    ...localSuggestions,
    ...mapboxSuggestions,
    ...photonSuggestions,
    exactAddressItem
  ];

  const seen = new Set<string>();
  const deduplicated: MapboxPlaceSuggestion[] = [];

  for (const item of combined) {
    const key = item.placeName.toLowerCase().replace(/[\s,.-]+/g, '');
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(item);
    }
  }

  return deduplicated.slice(0, 7);
}

// Client-Side Mapbox Route Cache (1 Hour TTL to avoid redundant billing)
interface CachedRoute {
  distanceKm: number;
  durationMinutes: number;
  polyline?: any;
  cachedAt: number;
}
const clientRouteCache = new Map<string, CachedRoute>();
const ROUTE_CACHE_TTL_MS = 1000 * 60 * 60;

/**
 * Calculates exact driving distance (km) and driving time (minutes) between 2 coordinates
 * Checks memory cache first to avoid repeat billing for identical queries.
 */
export async function calculateDrivingRoute(
  pickupCoords: [number, number],
  dropoffCoords: [number, number],
  token?: string,
  googleKey?: string
): Promise<RouteCalculationResult> {
  // Check identical locations (< 0.05 km)
  const isSameLocation =
    Math.abs(pickupCoords[0] - dropoffCoords[0]) < 0.0001 &&
    Math.abs(pickupCoords[1] - dropoffCoords[1]) < 0.0001;

  if (isSameLocation) {
    return {
      distanceKm: 0,
      durationMinutes: 0,
      polyline: null,
      source: 'mapbox-directions-api'
    };
  }

  // 1. Compute via Google Routes API v2 first if Google Key is provided or present in env
  const gKey = googleKey || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  if (gKey && gKey.startsWith('AIzaSy')) {
    try {
      const googleRoute = await calculateGoogleDrivingRoute(pickupCoords, dropoffCoords, gKey);
      if (googleRoute && googleRoute.distanceKm > 0) {
        return googleRoute;
      }
    } catch (gErr) {
      console.warn('[Google Routes Calculation Fallback]:', gErr);
    }
  }

  const cacheKey = `${pickupCoords[0].toFixed(3)},${pickupCoords[1].toFixed(3)}->${dropoffCoords[0].toFixed(3)},${dropoffCoords[1].toFixed(3)}`;
  const cached = clientRouteCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < ROUTE_CACHE_TTL_MS) {
    return {
      distanceKm: cached.distanceKm,
      durationMinutes: cached.durationMinutes,
      polyline: cached.polyline,
      source: 'mapbox-directions-api'
    };
  }

  const mapboxToken = token || (import.meta as any).env?.VITE_MAPBOX_TOKEN || '';

  if (mapboxToken && mapboxToken.startsWith('pk.')) {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?geometries=geojson&overview=full&access_token=${mapboxToken}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKm = Number((route.distance / 1000).toFixed(1));
          const durationMinutes = Math.max(1, Math.round(route.duration / 60));
          
          clientRouteCache.set(cacheKey, {
            distanceKm: Math.max(0.5, distanceKm),
            durationMinutes,
            polyline: route.geometry,
            cachedAt: Date.now()
          });

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
 * Calculates the complete delivery fare breakdown using the automatic pricing formula:
 * - Distance Charge = Distance in KM × Price per KM (if distance pricing enabled)
 * - Time Charge = Estimated Duration in Minutes × Price per Minute (if time pricing enabled)
 * - Subtotal = Base Fee + Distance Charge + Time Charge + Waiting Charge
 * - SubtotalBeforeVat = Math.max(Subtotal, Minimum Fare)
 * - Final Fare = SubtotalBeforeVat + Applicable VAT
 * - Rounded to nearest fareRoundingIncrement (e.g. ₦50)
 */
export function computeDeliveryFareBreakdown(params: {
  distanceKm: number;
  durationMinutes?: number;
  baseFare?: number;
  pricePerKm?: number;
  pricePerMinute?: number;
  minimumFare?: number;
  waitingChargePerMinute?: number;
  waitingFee?: number;
  waitingMinutes?: number;
  includeWaitingFee?: boolean;
  vatPercentage?: number;
  vatEnabled?: boolean;
  timePricingEnabled?: boolean;
  distancePricingEnabled?: boolean;
  fareRoundingIncrement?: number;
}): PricingBreakdown {
  const baseFare = Number(params.baseFare ?? 300);
  const pricePerKm = Number(params.pricePerKm ?? 250);
  const pricePerMinute = Number(params.pricePerMinute ?? 30);
  const minimumFare = Number(params.minimumFare ?? 1000);
  const waitingChargePerMinute = Number(params.waitingChargePerMinute ?? params.waitingFee ?? 50);
  const vatPercentage = Number(params.vatPercentage ?? 7.5);
  const vatEnabled = params.vatEnabled !== undefined ? Boolean(params.vatEnabled) : true;
  const timePricingEnabled = params.timePricingEnabled !== undefined ? Boolean(params.timePricingEnabled) : true;
  const distancePricingEnabled = params.distancePricingEnabled !== undefined ? Boolean(params.distancePricingEnabled) : true;
  const fareRoundingIncrement = Math.max(1, Number(params.fareRoundingIncrement ?? 50));

  const validDistance = Math.max(0, Number(params.distanceKm) || 0);
  const validDuration = Math.max(0, Number(params.durationMinutes) || 0);

  let waitingMins = Math.max(0, Number(params.waitingMinutes) || 0);
  if (params.includeWaitingFee && waitingMins === 0) {
    waitingMins = 1;
  }

  const distanceCharge = distancePricingEnabled ? Math.round(validDistance * pricePerKm) : 0;
  const timeCharge = timePricingEnabled ? Math.round(validDuration * pricePerMinute) : 0;
  const waitingCharge = waitingMins > 0 ? Math.round(waitingMins * waitingChargePerMinute) : 0;

  const subtotal = baseFare + distanceCharge + timeCharge + waitingCharge;
  const isMinimumFareApplied = subtotal < minimumFare;
  const subtotalBeforeVat = Math.max(subtotal, minimumFare);

  const vatAmount = vatEnabled ? Number(((subtotalBeforeVat * vatPercentage) / 100).toFixed(2)) : 0;
  const totalBeforeRounding = subtotalBeforeVat + vatAmount;

  const finalFare = Math.max(
    minimumFare,
    Math.round(totalBeforeRounding / fareRoundingIncrement) * fareRoundingIncrement
  );

  return {
    distanceKm: validDistance,
    durationMinutes: validDuration,
    baseFare,
    pricePerKm,
    distanceCost: distanceCharge,
    distanceCharge,
    pricePerMinute,
    timeCharge,
    waitingCharge,
    waitingFee: waitingCharge,
    subtotal,
    isMinimumFareApplied,
    subtotalBeforeVat,
    vatPercentage: vatEnabled ? vatPercentage : 0,
    vatAmount,
    totalBeforeRounding,
    fareRoundingIncrement,
    finalFare,
  };
}

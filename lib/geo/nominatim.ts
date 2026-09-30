// OpenStreetMap / Nominatim Geocoding API Client with Resilient Caching & Fallbacks

export interface GeocodingResult {
  placeId: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  type: string;
}

// In-memory cache to respect Nominatim rate-limits (1 request/second) and prevent repetitive queries
const geocodingCache = new Map<string, GeocodingResult[]>();

export async function searchLocationOSM(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const cacheKey = trimmed.toLowerCase();
  if (geocodingCache.has(cacheKey)) {
    return geocodingCache.get(cacheKey)!;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed
    )}&addressdetails=1&limit=5`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AgriSupplyChainLogisticsPlatform/1.0 (contact@agricorp-demo.org)',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`Nominatim geocoding warning: ${res.status} ${res.statusText}`);
      return getFallbackLocations(trimmed);
    }

    const data = await res.json();
    const results: GeocodingResult[] = data.map((item: any) => ({
      placeId: String(item.place_id),
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type || 'place',
    }));

    geocodingCache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error fetching from Nominatim API:', error);
    return getFallbackLocations(trimmed);
  }
}

export async function reverseGeocodeOSM(lat: number, lon: number): Promise<string> {
  const cacheKey = `rev_${lat.toFixed(4)}_${lon.toFixed(4)}`;
  const cached = (geocodingCache as any).get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AgriSupplyChainLogisticsPlatform/1.0 (contact@agricorp-demo.org)',
        Accept: 'application/json',
      },
    });

    if (!res.ok) return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    const data = await res.json();
    const name = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    (geocodingCache as any).set(cacheKey, name);
    return name;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

function getFallbackLocations(query: string): GeocodingResult[] {
  const fallbacks: GeocodingResult[] = [
    { placeId: 'fb-1', name: 'Salinas Valley Agricultural Hub', displayName: 'Salinas, Monterey County, California, USA', latitude: 36.6777, longitude: -121.6555, type: 'agriculture' },
    { placeId: 'fb-2', name: 'Oakland Port Reefer Terminal', displayName: 'Port of Oakland, Oakland, Alameda County, California, USA', latitude: 37.8044, longitude: -122.2712, type: 'port' },
    { placeId: 'fb-3', name: 'Sacramento Northern Cross-Dock', displayName: 'Sacramento, Sacramento County, California, USA', latitude: 38.5816, longitude: -121.4944, type: 'logistics' },
    { placeId: 'fb-4', name: 'Fresno Foothills Citrus Co-op', displayName: 'Fresno, Fresno County, California, USA', latitude: 36.7468, longitude: -119.7726, type: 'orchard' },
    { placeId: 'fb-5', name: 'Bakersfield Gateway Logistics Center', displayName: 'Bakersfield, Kern County, California, USA', latitude: 35.3733, longitude: -119.0187, type: 'terminal' },
  ];

  const q = query.toLowerCase();
  const matched = fallbacks.filter(f => f.name.toLowerCase().includes(q) || f.displayName.toLowerCase().includes(q));
  return matched.length > 0 ? matched : [fallbacks[0]];
}

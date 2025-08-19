import { CONFIG } from "../config";

export type GeocodeResult = {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
};

export async function geocodeCity(q: string): Promise<GeocodeResult[]> {
  const key = CONFIG.API_KEY;
  // Try OpenWeather Geocoding if we have a key
  if (key) {
    try {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${key}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          return data.map((d: any) => ({
            name: d.name,
            lat: d.lat,
            lon: d.lon,
            country: d.country,
            state: d.state,
          }));
        }
      }
    } catch {}
  }

  // Fallback: Open-Meteo Geocoding (no API key)
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.results ?? [];
    return results.map((r: any) => ({
      name: r.name,
      lat: r.latitude,
      lon: r.longitude,
      country: r.country,
      state: r.admin1,
    }));
  } catch {
    return [];
  }
}

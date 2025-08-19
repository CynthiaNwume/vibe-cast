import * as Location from "expo-location";
import Constants from "expo-constants";
import { CONFIG } from "../config";
import type { WeatherBundle } from "./types";

// ---------------- constants ----------------
const OW_ONECALL = "https://api.openweathermap.org/data/3.0/onecall";
const OW_WEATHER = "https://api.openweathermap.org/data/2.5/weather";
const OW_FORECAST = "https://api.openweathermap.org/data/2.5/forecast";

// Set this true ONLY if you subscribe to One Call 3.0
const USE_ONECALL = false;

// ---------------- helpers ----------------
async function safeFetch(url: string, timeoutMs = CONFIG.FETCH_TIMEOUT_MS ?? 8000): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    const body = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
    try { return JSON.parse(body); } catch { return body as any; }
  } finally {
    clearTimeout(timer);
  }
}

// ---- mappers ----
function mapOneCall(json: any): WeatherBundle {
  return {
    timezone: json.timezone,
    current: {
      dt: json.current.dt,
      temp: json.current.temp,
      feels_like: json.current.feels_like,
      wind_speed: json.current.wind_speed,
      wind_deg: json.current.wind_deg,                       // NEW
      uvi: json.current.uvi,
      clouds: json.current.clouds ?? 0,
      humidity: json.current.humidity,                       // NEW
      pressure: json.current.pressure,                       // NEW
      weather: [{
        main: json.current.weather?.[0]?.main ?? "Clear",
        description: json.current.weather?.[0]?.description ?? ""
      }],
    },
    hourly: (json.hourly ?? []).map((h: any) => ({
      dt: h.dt,
      temp: h.temp,
      pop: h.pop,
      weather: [{ main: h.weather?.[0]?.main ?? "—" }],
    })),
    daily: (json.daily ?? []).map((d: any) => ({
      dt: d.dt,
      temp: { min: d.temp?.min, max: d.temp?.max },
      pop: d.pop,
      weather: [{ main: d.weather?.[0]?.main ?? "—" }],
      sunrise: d.sunrise,                                    // NEW
      sunset: d.sunset,                                      // NEW
      uvi: d.uvi,                                            // NEW
      humidity: d.humidity,                                  // NEW
      pressure: d.pressure,                                  // NEW
    })),
    source: "live-openweather",
  };
}

function mapOW25(current: any, forecast: any): WeatherBundle {
  // group 3h steps → days for min/max
  const byDay = new Map<string, { min: number; max: number; main: string; pop: number; dt: number }>();
  for (const it of forecast.list ?? []) {
    const date = new Date(it.dt * 1000);
    const key = date.toISOString().slice(0, 10);
    const t = it.main?.temp ?? 0;
    const rec = byDay.get(key) ?? { min: t, max: t, main: it.weather?.[0]?.main ?? "—", pop: it.pop ?? 0, dt: it.dt };
    rec.min = Math.min(rec.min, it.main?.temp_min ?? t);
    rec.max = Math.max(rec.max, it.main?.temp_max ?? t);
    if (!byDay.has(key)) rec.main = it.weather?.[0]?.main ?? rec.main;
    rec.pop = Math.max(rec.pop, it.pop ?? 0);
    byDay.set(key, rec);
  }
  const daily = Array.from(byDay.values())
    .slice(0, 7)
    .map((d) => ({
      dt: d.dt,
      temp: { min: d.min, max: d.max },
      pop: d.pop,
      weather: [{ main: d.main }],
      // sunrise/sunset/uvi not provided by v2.5 -> left undefined
    }));

  return {
    timezone: String(forecast.city?.name ?? forecast.city?.country ?? "UTC"),
    current: {
      dt: current.dt,
      temp: current.main?.temp,
      feels_like: current.main?.feels_like ?? current.main?.temp,
      wind_speed: (CONFIG.UNITS === "metric" ? (current.wind?.speed ?? 0) * 3.6 : current.wind?.speed ?? 0),
      wind_deg: current.wind?.deg,                           // NEW
      clouds: current.clouds?.all ?? 0,
      humidity: current.main?.humidity,                      // NEW
      pressure: current.main?.pressure,                      // NEW
      weather: [{
        main: current.weather?.[0]?.main ?? "Clear",
        description: current.weather?.[0]?.description ?? ""
      }],
    },
    hourly: (forecast.list ?? []).slice(0, 12).map((h: any) => ({
      dt: h.dt,
      temp: h.main?.temp,
      pop: h.pop ?? 0,
      weather: [{ main: h.weather?.[0]?.main ?? "—" }],
    })),
    daily,
    source: "live-openweather",
  };
}

function mapOpenMeteo(json: any): WeatherBundle {
  const tz = json.timezone ?? "auto";

  // --- hourly ---
  const hourlyTimes: string[] = json.hourly?.time ?? [];
  const hourlyTemps: number[] = json.hourly?.temperature_2m ?? [];
  const hourlyPop: number[] = json.hourly?.precipitation_probability ?? [];
  const hourlyCloud: number[] = json.hourly?.cloudcover ?? [];
  const windHourly: number[] = json.hourly?.windspeed_10m ?? [];

  const hourly = hourlyTimes.map((t: string, i: number) => ({
    dt: Math.floor(new Date(t).getTime() / 1000),
    temp: hourlyTemps[i],
    pop: hourlyPop[i] ?? 0,
    weather: [{
      main: (hourlyPop[i] ?? 0) > 40 ? "Rain" : ((hourlyCloud[i] ?? 0) > 60 ? "Clouds" : "Clear"),
    }],
  }));

  // --- current ---
  const nowISO: string | undefined =
    json.current_weather_time || json.current_weather?.time || hourlyTimes[0];
  const nowDt = nowISO ? Math.floor(new Date(nowISO).getTime() / 1000) : hourly[0]?.dt;

  const currentIndex = Math.max(0, hourly.findIndex((h: { dt: number }) => h.dt === nowDt));
  const current = hourly[currentIndex] ?? hourly[0];

  // --- daily ---
  const dailyTimes: string[] = json.daily?.time ?? [];
  const tmax: number[] = json.daily?.temperature_2m_max ?? [];
  const tmin: number[] = json.daily?.temperature_2m_min ?? [];
  const dpop: number[] = json.daily?.precipitation_probability_max ?? [];
  const sunriseStr: string[] = json.daily?.sunrise ?? [];              // NEW
  const sunsetStr: string[] = json.daily?.sunset ?? [];                // NEW
  const uviMax: number[] = json.daily?.uv_index_max ?? [];             // NEW

  const daily = dailyTimes.map((t: string, i: number) => ({
    dt: Math.floor(new Date(t).getTime() / 1000),
    temp: { min: tmin[i], max: tmax[i] },
    pop: dpop[i] ?? 0,
    weather: [{ main: (dpop[i] ?? 0) > 40 ? "Rain" : "Clear" }],
    sunrise: sunriseStr[i] ? Math.floor(new Date(sunriseStr[i]).getTime() / 1000) : undefined,
    sunset: sunsetStr[i] ? Math.floor(new Date(sunsetStr[i]).getTime() / 1000) : undefined,
    uvi: uviMax[i],
  }));

  return {
    timezone: tz,
    current: {
      dt: current?.dt,
      temp: json.current_weather?.temperature ?? current?.temp,
      feels_like: json.current_weather?.temperature ?? current?.temp,
      wind_speed: json.current_weather?.windspeed ?? windHourly[currentIndex] ?? 0,
      wind_deg: json.current_weather?.winddirection,                      // NEW
      uvi: undefined,
      clouds: hourlyCloud[currentIndex] ?? 0,
      humidity: undefined,
      pressure: undefined,
      weather: current?.weather ?? [{ main: "Clear", description: "" }],
    },
    hourly: hourly.slice(0, 12),
    daily: daily.slice(0, 7),
    source: "live-openmeteo",
  };
}

// ---------------- public API ----------------
export async function getPermissionAndCoords() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("Location permission denied");
  const loc = await Location.getCurrentPositionAsync({});
  return { lat: loc.coords.latitude, lon: loc.coords.longitude };
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherBundle> {
  const key = CONFIG.API_KEY || (Constants.expoConfig?.extra as any)?.WEATHER_API_KEY;

  // 1) OpenWeather One Call 3.0 (only if subscribed)
  if (key && USE_ONECALL) {
    try {
      const url = `${OW_ONECALL}?lat=${lat}&lon=${lon}&appid=${key}&units=${CONFIG.UNITS}&exclude=minutely,alerts`;
      const json = await safeFetch(url);
      if (json?.current) {
        console.log("[weather] using LIVE: OpenWeather One Call");
        return mapOneCall(json);
      }
    } catch (e) {
      console.warn("[weather] One Call 3.0 failed:", (e as Error).message);
    }
  }

  // 2) OpenWeather v2.5 (current + forecast)
  if (key) {
    try {
      const cur = await safeFetch(`${OW_WEATHER}?lat=${lat}&lon=${lon}&appid=${key}&units=${CONFIG.UNITS}`);
      const fc  = await safeFetch(`${OW_FORECAST}?lat=${lat}&lon=${lon}&appid=${key}&units=${CONFIG.UNITS}`);
      if (cur?.weather && fc?.list) {
        console.log("[weather] using LIVE: OpenWeather v2.5");
        return mapOW25(cur, fc);
      }
    } catch (e) {
      console.warn("[weather] v2.5 fallback failed:", (e as Error).message);
    }
  }

  // 3) Open-Meteo (no key) — LIVE, include sunrise/sunset + uv_index_max, match units
  const tempUnit = CONFIG.UNITS === "imperial" ? "fahrenheit" : "celsius";
  const windUnit = CONFIG.UNITS === "imperial" ? "mph" : "kmh";
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true` +
    `&hourly=temperature_2m,precipitation_probability,cloudcover,windspeed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max` +
    `&timezone=auto` +
    `&temperature_unit=${tempUnit}&windspeed_unit=${windUnit}`;
  const json = await safeFetch(url);
  console.log("[weather] using LIVE: Open-Meteo");
  return mapOpenMeteo(json);
}

export function themeForCondition(main: string): "clear" | "cloudy" | "rain" | "night" {
  const m = (main || "").toLowerCase();
  if (m.includes("rain") || m.includes("drizzle") || m.includes("storm") || m.includes("thunder")) return "rain";
  if (m.includes("cloud")) return "cloudy";
  if (m.includes("clear")) return "clear";
  return "night";
}

// Optional: demo generator
// export function getDemoWeather(): WeatherBundle {
//   return {
//     timezone: "America/Toronto",
//     current: {
//       dt: Math.floor(Date.now() / 1000),
//       temp: 23,
//       feels_like: 24,
//       wind_speed: 8,
//       wind_deg: 180,
//       uvi: 4,
//       clouds: 20,
//       humidity: 50,
//       pressure: 1015,
//       weather: [{ main: "Clear", description: "clear sky" }],
//     },
//     hourly: Array.from({ length: 12 }).map((_, i: number) => ({
//       dt: Math.floor(Date.now() / 1000) + i * 3600,
//       temp: 22 + Math.sin(i / 2) * 2,
//       pop: i % 5 === 0 ? 0.3 : 0.0,
//       weather: [{ main: i % 7 === 0 ? "Clouds" : "Clear" }],
//     })),
//     daily: Array.from({ length: 7 }).map((_, i: number) => ({
//       dt: Math.floor(Date.now() / 1000) + i * 86400,
//       temp: { min: 18 + (i % 2), max: 26 + (i % 3) },
//       pop: i === 3 ? 0.5 : 0.1,
//       weather: [{ main: i === 3 ? "Rain" : "Clear" }],
//       sunrise: Math.floor(Date.now() / 1000) + i * 86400 + 6 * 3600,
//       sunset: Math.floor(Date.now() / 1000) + i * 86400 + 20 * 3600,
//       uvi: 6 + (i % 3),
//     })),
//     source: "demo",
//   };
// }

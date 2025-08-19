import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WeatherBundle } from "./types";

const WEATHER_KEY = "vibecast:weather:last";
const COORDS_KEY = "vibecast:coords:last";

export async function saveWeather(bundle: WeatherBundle) {
  try {
    await AsyncStorage.setItem(
      WEATHER_KEY,
      JSON.stringify({ bundle, savedAt: Date.now() })
    );
  } catch {}
}

export async function loadWeather():
  Promise<{ bundle: WeatherBundle; savedAt: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(WEATHER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export async function saveCoords(lat: number, lon: number) {
  try { await AsyncStorage.setItem(COORDS_KEY, JSON.stringify({ lat, lon })); } catch {}
}

export async function loadCoords(): Promise<{ lat: number; lon: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(COORDS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

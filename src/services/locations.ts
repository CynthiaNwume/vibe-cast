import AsyncStorage from "@react-native-async-storage/async-storage";

export type Pin = { name: string; lat: number; lon: number };

const PINS_KEY = "vibecast:pins";
const MAX_PINS = 5;

export async function getPins(): Promise<Pin[]> {
  try {
    const raw = await AsyncStorage.getItem(PINS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function addPin(pin: Pin): Promise<void> {
  const pins = await getPins();
  const exists = pins.some(
    (p) => p.name === pin.name || (p.lat === pin.lat && p.lon === pin.lon)
  );
  const next = exists ? pins : [pin, ...pins].slice(0, MAX_PINS);
  await AsyncStorage.setItem(PINS_KEY, JSON.stringify(next));
}

export async function removePin(pin: Pin): Promise<void> {
  const pins = await getPins();
  const next = pins.filter(
    (p) => !(p.name === pin.name && p.lat === pin.lat && p.lon === pin.lon)
  );
  await AsyncStorage.setItem(PINS_KEY, JSON.stringify(next));
}

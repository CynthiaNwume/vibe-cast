import type { ColorValue } from "react-native";

export const colors = {
  bg: "#0b0b2b",
  neonPink: "#ff71ce",
  violet: "#7a5cff",
  malibu: "#66d9ff",
  mint: "#5af7b0",
  text: "rgba(255,255,255,0.92)",
  textDim: "rgba(255,255,255,0.66)",
  card: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.12)",
};

// define a tuple type with minimum 2 ColorValues
type Gradient = readonly [ColorValue, ColorValue, ...ColorValue[]];

export const gradients: Record<"clear" | "cloudy" | "rain" | "night", Gradient> = {
  clear: ["#ff71ce", "#7a5cff", "#66d9ff"],
  cloudy: ["#5a4b8a", "#3a2f6b", "#1c1a42"],
  rain: ["#4e5b9a", "#2a2b57", "#12122b"],
  night: ["#0b0b2b", "#151542", "#2a2a72"],
};

export const spacing = (n = 1) => n * 8;
export const radius = 16;

export const font = {
  display: "Audiowide_400Regular",
  body: "System",
};

export const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export const isGoldenHour = (date: Date) => {
  const h = date.getHours();
  return (h >= 6 && h <= 8) || (h >= 18 && h <= 20);
};

export const cToF = (c: number) => (c * 9) / 5 + 32;

export const labelForVibe = (score: number) => {
  if (score < 31) return "Stormy Mood";
  if (score < 71) return "Cruising";
  return "Neon Breeze";
};

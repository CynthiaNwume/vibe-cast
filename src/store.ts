import { create } from "zustand";

type Settings = {
  units: "metric" | "imperial";
  crt: boolean;
  setUnits: (u: Settings["units"]) => void;
  toggleCRT: () => void;
};

export const useSettings = create<Settings>((set) => ({
  units: "metric",
  crt: false,
  setUnits: (u) => set({ units: u }),
  toggleCRT: () => set((s) => ({ crt: !s.crt })),
}));

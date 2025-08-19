import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing } from "../theme";

type Day = { dt: number; min: number; max: number; main: string };

export default function DailyForecast({
  days = [],
  onSelect,
}: {
  days: Day[];
  onSelect?: (day: Day) => void;
}) {
  const weekday = (ts: number) =>
    new Date(ts * 1000).toLocaleDateString([], { weekday: "short" });

  return (
    <View style={styles.box}>
      {days.map((d, i) => (
        <Pressable
          key={i}
          onPress={() => onSelect?.(d)}
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.day}>{weekday(d.dt)}</Text>
          <Text style={styles.main}>{iconFor(d.main)} {d.main}</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.temp}>
            {Math.round(d.max)}° / {Math.round(d.min)}°
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function iconFor(main: string) {
  const m = (main || "").toLowerCase();
  if (m.includes("storm") || m.includes("thunder")) return "⛈️";
  if (m.includes("rain") || m.includes("drizzle")) return "🌧️";
  if (m.includes("snow")) return "❄️";
  if (m.includes("cloud")) return "☁️";
  if (m.includes("clear")) return "🌤️";
  return "🌥️";
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing(1.5),
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  day: { color: colors.text, width: 50 },
  main: { color: colors.text, opacity: 0.9 },
  temp: { color: colors.text, fontWeight: "600" },
});

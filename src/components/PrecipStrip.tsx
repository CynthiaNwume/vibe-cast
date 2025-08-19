import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";

/**
 * Renders next 12 hours of precip probability bars (0..1).
 * Pass an array like: [{ dt: number, pop: number }] (we'll accept missing/undefined -> 0).
 */
export default function PrecipStrip({
  hours = [],
}: {
  hours: { dt: number; pop?: number }[];
}) {
  const items = hours.slice(0, 12);
  const maxH = 56; // px bar max

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Rain chance</Text>
      <View style={styles.row}>
        {items.map((h, i) => {
          const pop = Math.max(0, Math.min(1, h.pop ?? 0));
          const height = Math.max(2, pop * maxH);
          const hour = new Date(h.dt * 1000).getHours();
          const label = `${(pop * 100).toFixed(0)}%`;
          return (
            <View key={i} style={styles.col}>
              <View style={[styles.bar, { height }]} />
              <Text style={styles.hour}>
                {hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? "a" : "p"}
              </Text>
              <Text style={styles.percent}>{label}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.legend}>Tap a day for detail ↑</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing(1.5),
  },
  title: { color: colors.text, marginBottom: 8, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  col: { alignItems: "center", width: 22 },
  bar: {
    width: 12,
    backgroundColor: "rgba(102,217,255,0.8)",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginBottom: 4,
  },
  hour: { color: colors.textDim, fontSize: 10 },
  percent: { color: colors.text, fontSize: 10, opacity: 0.9, marginTop: 2 },
  legend: { color: colors.textDim, fontSize: 12, marginTop: 8 },
});

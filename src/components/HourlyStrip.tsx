import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { colors, spacing, radius } from "../theme";

type Hour = { dt: number; temp: number; main: string };

export default function HourlyStrip({ hours, units }: { hours: Hour[]; units: "metric" | "imperial" }) {
  return (
    <FlatList
      data={hours}
      keyExtractor={(h) => String(h.dt)}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing(1) }}
      renderItem={({ item }) => {
        const t = new Date(item.dt * 1000);
        const hh = t.getHours();
        const lab = `${hh % 12 || 12}${hh < 12 ? "a" : "p"}`;
        return (
          <View style={styles.chip}>
            <Text style={styles.t}>{lab}</Text>
            <Text style={styles.temp}>{Math.round(item.temp)}°{units === "metric" ? "C" : "F"}</Text>
            <Text style={styles.cond}>{item.main}</Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 76,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(1),
    borderRadius: radius,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: "center",
    gap: 2,
  },
  t: { color: colors.textDim, fontSize: 12 },
  temp: { color: colors.text, fontSize: 18, fontFamily: "Audiowide_400Regular" },
  cond: { color: colors.malibu, fontSize: 12 },
});

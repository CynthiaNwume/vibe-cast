import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../theme";

type Props = {
  city: string;
  temp: number;
  feels: number;
  desc: string;
  wind: number;
  high?: number;
  low?: number;
  units: "metric" | "imperial";
};

export default function CurrentCard(p: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.city}>{p.city}</Text>
      <Text style={styles.temp}>
        {Math.round(p.temp)}°{p.units === "metric" ? "C" : "F"}
      </Text>
      <Text style={styles.desc}>{p.desc}</Text>
      <View style={styles.row}>
        <Text style={styles.meta}>Feels {Math.round(p.feels)}°</Text>
        <Text style={styles.meta}>Wind {Math.round(p.wind)} {p.units === "metric" ? "km/h" : "mph"}</Text>
        {p.high != null && p.low != null && (
          <Text style={styles.meta}>H {Math.round(p.high)}° / L {Math.round(p.low)}°</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius,
    padding: spacing(2),
  },
  city: { color: colors.mint, letterSpacing: 1, fontFamily: "Audiowide_400Regular" },
  temp: { color: colors.text, fontSize: 56, marginTop: spacing(1), fontFamily: "Audiowide_400Regular" },
  desc: { color: colors.textDim, marginTop: spacing(0.5) },
  row: { flexDirection: "row", gap: spacing(2), flexWrap: "wrap", marginTop: spacing(1) },
  meta: { color: colors.textDim },
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../theme";
import { clamp, isGoldenHour, labelForVibe } from "../utils";

type Props = {
  tempC: number;
  windKph: number;
  uv?: number;
  cloud: number; // 0-100
  precipProb?: number; // 0..1
  date: Date;
};

export function computeVibe({ tempC, windKph, uv = 4, cloud, precipProb = 0, date }: Props) {
  let score = 100;
  score -= Math.abs(tempC - 22) * 2;
  score -= Math.max(0, windKph - 10) * 1.2;
  score -= Math.max(0, uv - 6) * 2;
  if (isGoldenHour(date)) score += 10;
  score -= (precipProb ?? 0) * 15;
  score -= (cloud > 80 ? 5 : 0);
  return clamp(Math.round(score), 0, 100);
}

export default function VibeMeter(props: Props) {
  const score = computeVibe(props);
  const label = labelForVibe(score);

  return (
    <View style={styles.box}>
      <Text style={styles.score}>{score}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.sub}>Vibe score</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    gap: spacing(2),
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius,
    padding: spacing(2),
  },
  score: { fontSize: 42, color: colors.mint, fontFamily: "Audiowide_400Regular" },
  label: { color: colors.text, fontSize: 16 },
  sub: { color: colors.textDim, fontSize: 12, marginTop: 4 },
});

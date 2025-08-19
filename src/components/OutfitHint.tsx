import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";

export default function OutfitHint({
  tempC,
  precipProb = 0,
  windKph = 0,
}: {
  tempC: number;
  precipProb?: number; // 0..1
  windKph?: number;
}) {
  const rain = (precipProb ?? 0) >= 0.4;
  const windy = windKph >= 25;

  let line = "Graphic tee + sneakers";
  let emoji = "😎";

  if (tempC <= -5) { line = "Heavy coat, gloves, beanie"; emoji = "🧥🧤"; }
  else if (tempC <= 5) { line = "Coat + hoodie"; emoji = "🧣"; }
  else if (tempC <= 12) { line = "Light jacket + jeans"; emoji = "🧥"; }
  else if (tempC <= 20) { line = "Long-sleeve or tee"; emoji = "👕"; }
  else if (tempC <= 28) { line = "Tee + shorts"; emoji = "🩳"; }
  else { line = "Tank + shorts, hydrate"; emoji = "🔥"; }

  if (rain) { line += " • Pack a light rain jacket"; emoji = "🌧️"; }
  if (windy) { line += " • Windbreaker helps"; emoji = "🌬️"; }

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Outfit hint {emoji}</Text>
      <Text style={styles.text}>{line}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing(1.5),
    borderRadius: 12,
  },
  title: { color: colors.text, opacity: 0.9, marginBottom: 4 },
  text: { color: colors.text },
});

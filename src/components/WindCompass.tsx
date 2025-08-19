import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";

/**
 * Props:
 * - dirDeg: wind direction in degrees (meteorological: 0/360 = North, 90 = East ...)
 * - speed: wind speed (displayed as provided; you pass km/h or mph from the parent)
 * - units: "km/h" | "mph"
 */
export default function WindCompass({
  dirDeg = 0,
  speed = 0,
  units = "km/h",
}: {
  dirDeg?: number;
  speed?: number;
  units?: string;
}) {
  // Normalize to [0, 360)
  const deg = ((dirDeg % 360) + 360) % 360;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Wind</Text>
        <Text style={styles.sub}>{Math.round(speed)} {units}</Text>
      </View>

      <View style={styles.compassBox}>
        {/* ring */}
        <View style={styles.ring}>
          {/* N/E/S/W markers */}
          <Text style={[styles.marker, styles.N]}>N</Text>
          <Text style={[styles.marker, styles.E]}>E</Text>
          <Text style={[styles.marker, styles.S]}>S</Text>
          <Text style={[styles.marker, styles.W]}>W</Text>

          {/* arrow */}
          <View style={[styles.arrowWrap, { transform: [{ rotate: `${deg}deg` }] }]}>
            <View style={styles.arrow} />
          </View>
        </View>
      </View>

      <Text style={styles.dir}>
        {deg.toFixed(0)}°
      </Text>
    </View>
  );
}

const SIZE = 120;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing(1.5),
    gap: spacing(1),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: { color: colors.text, fontWeight: "600" },
  sub: { color: colors.text, opacity: 0.8 },
  compassBox: { alignItems: "center", justifyContent: "center" },
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowWrap: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 28,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: colors.neonPink,
    marginTop: 8, // offset from center pivot
  },
  marker: {
    position: "absolute",
    color: colors.text,
    opacity: 0.8,
    fontSize: 12,
  },
  N: { top: 6 },
  S: { bottom: 6 },
  E: { right: 8 },
  W: { left: 8 },
  dir: { color: colors.textDim, textAlign: "center", marginTop: 6 },
});

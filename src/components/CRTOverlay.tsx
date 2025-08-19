import React from "react";
import { View, StyleSheet } from "react-native";

// Subtle scanlines + chromatic aberration border glow
export default function CRTOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return <View pointerEvents="none" style={styles.overlay} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    // scanlines
    backgroundImage:
      "repeating-linear-gradient( to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 2px, transparent 4px)",
  } as any,
});

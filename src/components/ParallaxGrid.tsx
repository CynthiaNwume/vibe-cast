import React from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { colors } from "../theme";

// A subtle wireframe grid that drifts vertically
export default function ParallaxGrid() {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -40] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[styles.grid, { transform: [{ translateY }] }]}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <View key={`row-${i}`} style={styles.row} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={`col-${i}`} style={styles.col} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flex: 1 },
  row: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ translateY: 0 }],
  },
  col: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});

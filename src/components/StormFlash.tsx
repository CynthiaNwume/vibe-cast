import React from "react";
import { Animated, Easing, StyleSheet } from "react-native";

export default function StormFlash({ active }: { active: boolean }) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    let timer: any;
    function schedule() {
      if (!active) return;
      const delay = 2500 + Math.random() * 7000; // random gaps
      timer = setTimeout(() => {
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.9, duration: 80, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]).start(() => schedule());
      }, delay);
    }
    if (active) schedule();
    return () => clearTimeout(timer);
  }, [active, opacity]);

  if (!active) return null;
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: "white", opacity }]} />;
}

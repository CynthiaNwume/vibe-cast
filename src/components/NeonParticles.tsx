import React from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

type Dot = {
  x: Animated.Value;
  y: Animated.Value;
  s: number; // size
  o: Animated.Value; // opacity
  d: number; // duration
};

export default function NeonParticles({ count = 18 }: { count?: number }) {
  const dots = React.useRef<Dot[]>(
    Array.from({ length: count }).map(() => ({
      x: new Animated.Value(Math.random() * 100),
      y: new Animated.Value(Math.random() * 100),
      s: 6 + Math.random() * 10,
      o: new Animated.Value(Math.random() * 0.8 + 0.2),
      d: 8000 + Math.random() * 7000,
    }))
  ).current;

  React.useEffect(() => {
    const loops = dots.map((dot) => {
      const animate = () => {
        dot.x.setValue(Math.random() * 100);
        dot.y.setValue(Math.random() * 100);
        Animated.parallel([
          Animated.timing(dot.x, { toValue: Math.random() * 100, duration: dot.d, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
          Animated.timing(dot.y, { toValue: Math.random() * 100, duration: dot.d, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
          Animated.sequence([
            Animated.timing(dot.o, { toValue: 1, duration: dot.d * 0.4, useNativeDriver: false }),
            Animated.timing(dot.o, { toValue: 0.25, duration: dot.d * 0.6, useNativeDriver: false }),
          ]),
        ]).start(animate);
      };
      animate();
      return () => {};
    });
    return () => { loops.forEach((stop) => stop && stop()); };
  }, [dots]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {dots.map((d, i) => {
        const left = d.x.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
        const top = d.y.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { width: d.s, height: d.s, borderRadius: d.s / 2, left, top, opacity: d.o },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    backgroundColor: "rgba(255,113,206,0.7)", // neon pink-ish
    shadowColor: "#ff71ce",
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
});

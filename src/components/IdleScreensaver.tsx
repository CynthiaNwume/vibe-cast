import React from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { colors } from "../theme";

export default function IdleScreensaver({
  idleMs = 10000,
  activeChildren, // the UI to fade out
  backgroundChildren, // the animated background that stays
}: {
  idleMs?: number;
  activeChildren: React.ReactNode;
  backgroundChildren?: React.ReactNode;
}) {
  const [idle, setIdle] = React.useState(false);
  const fade = React.useRef(new Animated.Value(1)).current;
  const timerRef = React.useRef<any>(null);

  function reset() {
    clearTimeout(timerRef.current);
    setIdle(false);
    Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    timerRef.current = setTimeout(() => {
      setIdle(true);
      Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    }, idleMs);
  }

  React.useEffect(() => {
    reset();
    return () => clearTimeout(timerRef.current);
  }, []);

  // Let parent call this on any user interaction:
  (IdleScreensaver as any).reset = reset;

  return (
    <>
      {backgroundChildren}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fade }]}>
        {activeChildren}
      </Animated.View>

      {idle && (
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.tapHint]}>
          <Text style={{ color: colors.textDim }}>Tap to return</Text>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tapHint: { alignItems: "center", justifyContent: "center" },
});

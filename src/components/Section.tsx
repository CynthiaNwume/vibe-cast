import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../theme";

export default function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing(2) },
  title: { color: colors.textDim, marginBottom: spacing(1), letterSpacing: 1 },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius,
    padding: spacing(2),
  },
});

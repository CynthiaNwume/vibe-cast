import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";

function fmtTime(ts: number) {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function fmtDelta(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function GoldenHourCard({ sunset }: { sunset?: number }) {
  // Need today's sunset to show anything
  if (!sunset) return null;

  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000); // tick every 30s
    return () => clearInterval(id);
  }, []);

  const startMs = sunset * 1000 - 60 * 60 * 1000; // 1 hour before sunset
  const endMs = sunset * 1000;

  let title = "Golden hour";
  let subtitle = `Sunset at ${fmtTime(sunset)}`;
  let pill = "";
  if (now < startMs) {
    pill = `Starts in ${fmtDelta(startMs - now)}`;
  } else if (now >= startMs && now < endMs) {
    pill = "Happening now ✨";
  } else {
    pill = "Starts again tomorrow";
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{pill}</Text>
      </View>
      <Text style={styles.tip}>
        Pro tip: warm white balance (~5200K), slight exposure down for pop.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing(2),
    gap: 6,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: "600" },
  subtitle: { color: colors.textDim },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 213, 128, 0.18)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  pillText: { color: colors.text, letterSpacing: 0.5 },
  tip: { color: colors.textDim, marginTop: 6, fontSize: 12 },
});

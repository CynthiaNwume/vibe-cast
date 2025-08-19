import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { colors, spacing } from "../theme";

type Hour = { dt: number; temp: number; pop?: number };
type Day = {
  dt: number;
  temp?: { min: number; max: number };
  weather?: { main: string; description?: string }[];
  sunrise?: number;  // NEW
  sunset?: number;   // NEW
  uvi?: number;      // NEW
};

function fmtTime(ts?: number) {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function fmtDate(ts: number) {
  const d = new Date(ts * 1000);
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

export default function DayDetailsModal({
  visible,
  onClose,
  day,
  allHours,
  units,
  current,
}: {
  visible: boolean;
  onClose: () => void;
  day: Day | null;
  allHours: Hour[];
  units: "metric" | "imperial";
  current?: { humidity?: number; pressure?: number; uvi?: number; wind_speed?: number };
}) {
  if (!visible || !day) return null;

  const base = new Date(day.dt * 1000);
  const start = new Date(base); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(start.getDate() + 1);

  const hoursForDay = allHours.filter(
    (h) => h.dt * 1000 >= +start && h.dt * 1000 < +end
  );
  const fallbackHours = allHours.filter((h) => h.dt >= day.dt).slice(0, 12);
  const hours = hoursForDay.length ? hoursForDay : fallbackHours;

  const temps = hours.map((h) => h.temp);
  const tMin = Math.min(...temps, day.temp?.min ?? temps[0] ?? 0);
  const tMax = Math.max(...temps, day.temp?.max ?? temps[0] ?? 0);
  const range = Math.max(1, tMax - tMin);

  const toC = (t: number) => (units === "metric" ? t : ((t - 32) * 5) / 9);
  const toSpeed = (v: number | undefined) =>
    units === "metric" ? `${Math.round(v ?? 0)} km/h` : `${Math.round((v ?? 0) * 0.621371)} mph`;

  const main = day.weather?.[0]?.main ?? "—";
  const desc = day.weather?.[0]?.description ?? main;

  const stats = {
    high: Math.round(day.temp?.max ?? tMax),
    low: Math.round(day.temp?.min ?? tMin),
    humidity: current?.humidity,
    pressure: current?.pressure,
    uv: day.uvi ?? current?.uvi,                // prefer per-day UV
    wind: toSpeed(current?.wind_speed),
    sunrise: day.sunrise,
    sunset: day.sunset,
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{fmtDate(day.dt)}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>Close</Text>
            </Pressable>
          </View>

          <Text style={styles.desc}>{desc}</Text>

          {/* Stats grid */}
          <View style={styles.grid}>
            <Row k="High" v={`${stats.high}°`} />
            <Row k="Low" v={`${stats.low}°`} />
            <Row k="UV" v={stats.uv !== undefined ? String(stats.uv) : "—"} />
            <Row k="Humidity" v={stats.humidity !== undefined ? `${stats.humidity}%` : "—"} />
            <Row k="Pressure" v={stats.pressure !== undefined ? `${stats.pressure} hPa` : "—"} />
            <Row k="Wind" v={stats.wind} />
            <Row k="Sunrise" v={fmtTime(stats.sunrise)} />
            <Row k="Sunset" v={fmtTime(stats.sunset)} />
          </View>

          {/* Temp trend (spark bars) */}
          <Text style={[styles.k, { marginTop: 8, marginBottom: 6 }]}>Temperature trend</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 6 }}>
            <View style={styles.sparkRow}>
              {hours.map((h, i) => {
                const hC = toC(h.temp);
                const norm = (hC - toC(tMin)) / toC(range);
                const height = Math.max(6, 64 * norm);
                const hour = new Date(h.dt * 1000).getHours();
                return (
                  <View key={i} style={styles.sparkCol}>
                    <View style={[styles.sparkBar, { height }]} />
                    <Text style={styles.sparkHour}>
                      {hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? "a" : "p"}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Rain chance */}
          <Text style={[styles.k, { marginTop: 8, marginBottom: 6 }]}>Rain chance</Text>
          <View style={styles.sparkRow}>
            {hours.map((h, i) => {
              const pop = Math.max(0, Math.min(1, h.pop ?? 0));
              const height = Math.max(4, 56 * pop);
              return (
                <View key={i} style={styles.sparkCol}>
                  <View style={[styles.rainBar, { height }]} />
                  <Text style={styles.sparkHour}>{Math.round(pop * 100)}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.k}>{k}</Text>
      <Text style={styles.v}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing(2),
    maxHeight: "85%",
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  title: { color: colors.text, fontSize: 18, fontWeight: "600" },
  closeBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.card },
  closeTxt: { color: colors.text },
  desc: { color: colors.textDim, marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: { width: "30%", backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 10 },
  k: { color: colors.textDim, fontSize: 12 },
  v: { color: colors.text, marginTop: 4, fontSize: 16 },
  sparkRow: { flexDirection: "row", gap: 10 },
  sparkCol: { alignItems: "center" },
  sparkBar: { width: 10, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: "rgba(255,113,206,0.9)" },
  rainBar: { width: 10, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: "rgba(102,217,255,0.9)" },
  sparkHour: { color: colors.textDim, fontSize: 10, marginTop: 4 },
});

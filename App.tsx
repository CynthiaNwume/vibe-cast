// App.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Font from "expo-font";

import { colors, gradients, spacing } from "./src/theme";
import ParallaxGrid from "./src/components/ParallaxGrid";
import CRTOverlay from "./src/components/CRTOverlay";
import CurrentCard from "./src/components/CurrentCard";
import HourlyStrip from "./src/components/HourlyStrip";
import DailyForecast from "./src/components/DailyForecast";
import Section from "./src/components/Section";
import VibeMeter from "./src/components/VibeMeter";
import { fetchWeather, getPermissionAndCoords, themeForCondition } from "./src/services/weather";
import { useSettings } from "./src/store";

// extras
import MusicToggle from "./src/components/MusicToggle";
import StormFlash from "./src/components/StormFlash";
import ShareCard from "./src/components/ShareCard";
import CitySearchModal from "./src/components/CitySearchModal";
import IdleScreensaver from "./src/components/IdleScreensaver";
import type { GeocodeResult } from "./src/services/geocode";
import { saveWeather, loadWeather, saveCoords, loadCoords } from "./src/services/cache";
// import { refreshNotifications } from "./src/services/alerts";
import SavedChips from "./src/components/SavedChips";
import { addPin, type Pin } from "./src/services/locations";
import NeonParticles from "./src/components/NeonParticles";
import OutfitHint from "./src/components/OutfitHint";
import StormRumble from "./src/components/StormRumble";
import { tap } from "./src/utils/haptics";
import WindCompass from "./src/components/WindCompass";
import PrecipStrip from "./src/components/PrecipStrip";
import DayDetailsModal from "./src/components/DayDetailsModal";
import GoldenHourCard from "./src/components/GoldenHourCard";


export default function App() {
  const [loaded] = Font.useFonts({
    Audiowide_400Regular: require("./assets/fonts/Audiowide-Regular.ttf"),
  });

  const units = useSettings((s) => s.units);
  const toggleCRT = useSettings((s) => s.toggleCRT);
  const crt = useSettings((s) => s.crt);
  const setUnits = useSettings((s) => s.setUnits);
  const [selectedDay, setSelectedDay] = React.useState<any | null>(null);

  const [state, setState] = React.useState<{
    loading: boolean;
    error?: string;
    themeKey: keyof typeof gradients;
    data?: any;
    city?: string;
    condMain?: string;
  }>({ loading: true, themeKey: "clear" });

  const [coords, setCoords] = React.useState<{ lat: number; lon: number } | null>(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [pinsRefreshToken, setPinsRefreshToken] = React.useState(0);

  async function loadByCoords(lat: number, lon: number, fallbackCity = "Your City") {
    try {
      const data = await fetchWeather(lat, lon);
      const main = data.current?.weather?.[0]?.main ?? "Clear";
      const themeKey = themeForCondition(main);

      const cityLabel =
        typeof data.timezone === "string"
          ? data.timezone.split("/").pop()?.replace("_", " ")
          : String(data.timezone ?? fallbackCity);

      setState({
        loading: false,
        data,
        themeKey,
        condMain: main,
        city: cityLabel || fallbackCity,
        error: undefined,
      });

      setCoords({ lat, lon });
      setLastUpdated(new Date());
      saveWeather(data);
      saveCoords(lat, lon);
      // schedule smart alerts from the latest forecast
     // refreshNotifications(data);

    } catch (e: any) {
      console.warn("[loadByCoords] fetch failed:", e?.message || e);
      setState((s) => ({
        ...s,
        loading: false,
        error: "Could not load live weather. Check your network or API key.",
      }));
    }
  }

  async function pickCity(c: GeocodeResult) {
    setState((s) => ({ ...s, loading: true }));
    await loadByCoords(c.lat, c.lon, c.name);
    setState((s) => ({ ...s, city: c.name }));
  }

  async function pickPin(p: Pin) {
    setState((s) => ({ ...s, loading: true }));
    await loadByCoords(p.lat, p.lon, p.name);
    setState((s) => ({ ...s, city: p.name }));
  }

  async function onPinCurrent() {
    if (!coords || !state.city) {
      Alert.alert("Nothing to pin", "Load a city first, then pin it.");
      return;
    }
    await addPin({ name: state.city, lat: coords.lat, lon: coords.lon });
    setPinsRefreshToken((n) => n + 1);
  }

  React.useEffect(() => {
    (async () => {
      // 1) hydrate from cache (instant UI)
      const cached = await loadWeather();
      if (cached?.bundle) {
        const main = cached.bundle.current?.weather?.[0]?.main ?? "Clear";
        const themeKey = themeForCondition(main);
        setState((s) => ({
          ...s,
          loading: false,
          data: cached.bundle,
          themeKey,
          condMain: main,
          city:
            (typeof cached.bundle.timezone === "string"
              ? cached.bundle.timezone.split("/").pop()?.replace("_", " ")
              : String(cached.bundle.timezone ?? "Your City")) || "Your City",
          error: undefined,
        }));
        setLastUpdated(new Date(cached.savedAt));
      }

      // 2) fresh coords → load live
      try {
        const { lat, lon } = await getPermissionAndCoords();
        await loadByCoords(lat, lon);
      } catch {
        const last = await loadCoords();
        if (last) await loadByCoords(last.lat, last.lon, "Saved Location");
        else await loadByCoords(43.65, -79.38, "Toronto");
      }
    })();
  }, []);

  function resetIdle() {
    (IdleScreensaver as any).reset?.();
  }

  async function onRefresh() {
    try {
      setRefreshing(true);
      const last = await loadCoords();
      if (last) await loadByCoords(last.lat, last.lon, state.city || "Your City");
      else {
        const { lat, lon } = await getPermissionAndCoords();
        await loadByCoords(lat, lon, state.city || "Your City");
      }
    } finally {
      setRefreshing(false);
    }
  }

  if (!loaded) return null;

  const d = state.data;
  const isStorm = !!(state.condMain || "").toLowerCase().match(/storm|thunder/);

  return (
    <LinearGradient colors={gradients[state.themeKey]} style={styles.fill}>
      {/* single wrapper child prevents stray text nodes */}
      <View style={styles.fill} onTouchStart={resetIdle}>
        <StatusBar barStyle="light-content" />
        <ParallaxGrid />
        <NeonParticles count={20} />
        <StormRumble active={isStorm} />
        <StormFlash active={isStorm} />

        <IdleScreensaver
          idleMs={10000}
          backgroundChildren={null}
          activeChildren={
            <ScrollView
              contentContainerStyle={styles.container}
              refreshControl={
                <RefreshControl
                  tintColor={colors.mint}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
            >
              {/* Header */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.logo}>VibeCast</Text>
                {!!d && (
                  <Text
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          d.source === "live-openweather"
                            ? "rgba(90,247,176,0.18)"
                            : d.source === "live-openmeteo"
                            ? "rgba(102,217,255,0.18)"
                            : "rgba(255,113,206,0.18)",
                      },
                    ]}
                  >
                    {d.source === "live-openweather"
                      ? "LIVE • OpenWeather"
                      : d.source === "live-openmeteo"
                      ? "LIVE • Open-Meteo"
                      : "DEMO"}
                  </Text>
                )}
              </View>
              {lastUpdated && (
                <Text style={styles.updated}>
                  Updated {lastUpdated.toLocaleTimeString()}
                </Text>
              )}
              {state.error && (
                <Text style={{ color: "#ffb3b3", marginTop: 4 }}>
                  {state.error}
                </Text>
              )}

              {/* Pinned chips */}
              <SavedChips onPick={pickPin} refreshToken={pinsRefreshToken} />

              {/* Controls row */}
              <View style={styles.row}>
                <Pressable
                  style={styles.toggle}
                  onPress={() => {
                    tap();
                    setUnits(units === "metric" ? "imperial" : "metric");
                  }}
                >
                  <Text style={styles.toggleText}>
                    {units === "metric" ? "°C" : "°F"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.toggle}
                  onPress={() => {
                    tap();
                    toggleCRT();
                  }}
                >
                  <Text style={styles.toggleText}>
                    {crt ? "CRT: ON" : "CRT: OFF"}
                  </Text>
                </Pressable>

                <MusicToggle />

                <Pressable
                  style={styles.toggle}
                  onPress={() => {
                    tap();
                    setSearchOpen(true);
                  }}
                >
                  <Text style={styles.toggleText}>City</Text>
                </Pressable>

                <Pressable
                  style={styles.toggle}
                  onPress={() => {
                    tap();
                    onPinCurrent();
                  }}
                >
                  <Text style={styles.toggleText}>Pin</Text>
                </Pressable>
              </View>

              {/* Content */}
              {state.loading && (
                <View style={{ marginTop: spacing(4) }}>
                  <ActivityIndicator color={colors.mint} />
                </View>
              )}

              {!state.loading && d && (
                <>
                  <ShareCard>
                    <CurrentCard
                      city={state.city || "—"}
                      temp={d.current.temp}
                      feels={d.current.feels_like}
                      desc={d.current.weather?.[0]?.description ?? "—"}
                      wind={d.current.wind_speed}
                      high={d.daily?.[0]?.temp?.max}
                      low={d.daily?.[0]?.temp?.min}
                      units={units}
                    />
                  </ShareCard>

                  <Section title="Next 12 hours">
                    <HourlyStrip
                      units={units}
                      hours={(d.hourly ?? []).slice(0, 12).map((h: any) => ({
                        dt: h.dt,
                        temp: h.temp,
                        main: h.weather?.[0]?.main ?? "—",
                      }))}
                    />
                  </Section>

                  <Section title="Golden hour">
                    <GoldenHourCard sunset={d.daily?.[0]?.sunset} />
                  </Section>


                  <Section title="Vibe">
                    <VibeMeter
                      tempC={
                        units === "metric"
                          ? d.current.temp
                          : ((d.current.temp - 32) * 5) / 9
                      }
                      windKph={
                        units === "metric"
                          ? d.current.wind_speed
                          : d.current.wind_speed * 1.60934
                      }
                      uv={d.current.uvi}
                      cloud={d.current.clouds}
                      precipProb={d.hourly?.[0]?.pop}
                      date={new Date()}
                    />
                  </Section>

                  <Section title="Outfit">
                    <OutfitHint
                      tempC={
                        units === "metric"
                          ? d.current.temp
                          : ((d.current.temp - 32) * 5) / 9
                      }
                      precipProb={d.hourly?.[0]?.pop}
                      windKph={
                        units === "metric"
                          ? d.current.wind_speed
                          : d.current.wind_speed * 1.60934
                      }
                    />
                  </Section>

                  <Section title="Wind">
                  <WindCompass
                    dirDeg={d.current.wind_deg ?? 0}
                    speed={d.current.wind_speed}     // already in km/h or mph
                    units={units === "metric" ? "km/h" : "mph"}  // use the state var, not getState()
                     />
                    </Section>


                  <Section title="Rain next 12h">
                   <PrecipStrip hours={(d.hourly ?? []).slice(0, 12).map((h: any) => ({ dt: h.dt, pop: h.pop ?? 0 }))} />
                  </Section>


                  <DailyForecast
                    days={(d.daily ?? []).slice(0, 7).map((day: any) => ({
                      dt: day.dt,
                      min: day.temp.min,
                      max: day.temp.max,
                      main: day.weather?.[0]?.main ?? "—",
                    }))}
                    onSelect={(day) => setSelectedDay(day)}

                  />
                  <DayDetailsModal
                    visible={!!selectedDay}
                    onClose={() => setSelectedDay(null)}
                    day={selectedDay}
                    allHours={(d?.hourly ?? []) as any}
                    units={units}
                    current={d?.current}
                  />

                </>
              )}

              <Text style={styles.footer}>
                Made for vibes • {new Date().getFullYear()}
              </Text>
            </ScrollView>
          }
        />

        {/* overlays inside the single wrapper */}
        <CRTOverlay visible={crt} />
        <CitySearchModal
          visible={searchOpen}
          onClose={() => setSearchOpen(false)}
          onPick={pickCity}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing(2), paddingBottom: spacing(6), gap: spacing(2) },
  logo: {
    color: colors.neonPink,
    fontSize: 28,
    letterSpacing: 2,
    marginTop: spacing(1),
    marginBottom: spacing(0.5),
    fontFamily: "Audiowide_400Regular",
  },
  badge: {
    marginLeft: 10,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 12,
    letterSpacing: 1,
  },
  updated: { color: colors.textDim, marginTop: 2 },
  row: {
    flexDirection: "row",
    gap: spacing(1),
    marginBottom: spacing(1),
    alignItems: "center",
    flexWrap: "wrap",
  },
  toggle: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  toggleText: { color: colors.text, letterSpacing: 1 },
  footer: { color: colors.textDim, textAlign: "center", marginTop: spacing(3) },
});

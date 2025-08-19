import React from "react";
import { Modal, View, TextInput, FlatList, Text, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, radius, spacing } from "../theme";
import { geocodeCity, type GeocodeResult } from "../services/geocode";

const STORAGE_KEY = "recentCities";

export default function CitySearchModal({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (c: GeocodeResult) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<GeocodeResult[]>([]);
  const [recents, setRecents] = React.useState<GeocodeResult[]>([]);

  React.useEffect(() => { if (visible) loadRecents(); }, [visible]);

  async function loadRecents() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) setRecents(JSON.parse(raw));
  }

  async function saveRecent(item: GeocodeResult) {
    const list = [item, ...recents.filter(r => r.name !== item.name)].slice(0, 6);
    setRecents(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  async function search() {
    if (!query.trim()) { setResults([]); return; }
    const out = await geocodeCity(query.trim());
    setResults(out);
  }

  function pick(item: GeocodeResult) {
    saveRecent(item);
    onPick(item);
    onClose();
    setQuery("");
    setResults([]);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <TextInput
            placeholder="Search city (e.g., Toronto)"
            placeholderTextColor={colors.textDim}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            style={styles.input}
          />
          <FlatList
            data={results.length ? results : recents}
            keyExtractor={(_, i) => String(i)}
            ListHeaderComponent={
              <Text style={styles.header}>{results.length ? "Results" : "Recent"}</Text>
            }
            renderItem={({ item }) => (
              <Pressable style={styles.item} onPress={() => pick(item)}>
                <Text style={styles.itemText}>
                  {item.name}{item.state ? `, ${item.state}` : ""}{item.country ? `, ${item.country}` : ""}
                </Text>
              </Pressable>
            )}
          />
          <Pressable onPress={onClose} style={styles.close}>
            <Text style={{ color: colors.text }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "rgba(15,15,40,0.95)",
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    padding: spacing(2),
    borderColor: colors.border, borderWidth: 1,
  },
  input: {
    backgroundColor: colors.card, color: colors.text,
    padding: spacing(1.5), borderRadius: radius, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing(1),
  },
  header: { color: colors.textDim, marginBottom: spacing(1) },
  item: { paddingVertical: spacing(1), borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  itemText: { color: colors.text },
  close: {
    alignSelf: "center", marginTop: spacing(2), paddingHorizontal: spacing(2), paddingVertical: spacing(1),
    borderWidth: 1, borderRadius: 12, borderColor: colors.border,
  },
});

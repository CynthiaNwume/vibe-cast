import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { colors, spacing } from "../theme";
import { getPins, removePin, type Pin } from "../services/locations";

export default function SavedChips({
  onPick,
  refreshToken = 0,
}: {
  onPick: (p: Pin) => void;
  refreshToken?: number; // bump this to force reload after adding/removing pins
}) {
  const [pins, setPins] = React.useState<Pin[]>([]);

  async function load() {
    const list = await getPins();
    setPins(list);
  }

  React.useEffect(() => {
    load();
  }, [refreshToken]);

  if (!pins.length) return null;

  function confirmRemove(pin: Pin) {
    Alert.alert("Remove pin", `Remove ${pin.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await removePin(pin);
          load();
        },
      },
    ]);
  }

  return (
    <View style={{ marginTop: spacing(1) }}>
      <Text style={styles.label}>Pinned</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {pins.map((p, i) => (
          <Pressable
            key={`${p.name}-${i}`}
            onPress={() => onPick(p)}
            onLongPress={() => confirmRemove(p)}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{p.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textDim, marginBottom: 6 },
  row: { gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  chipText: { color: colors.text },
});

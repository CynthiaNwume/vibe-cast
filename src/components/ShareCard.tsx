import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { colors } from "../theme";

export default function ShareCard({ children }: React.PropsWithChildren<{}>) {
  const ref = React.useRef<ViewShot>(null);

  async function share() {
    const uri = await ref.current?.capture?.(); // ← no args
    if (!uri) return;
    const dest = FileSystem.cacheDirectory + `vibecast-${Date.now()}.png`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    await Sharing.shareAsync(dest);
  }

  return (
    <View>
      {/* Move options here */}
      <ViewShot
        ref={ref}
        options={{ format: "png", quality: 1 }}
        style={{ borderRadius: 16, overflow: "hidden" }}
      >
        {children}
      </ViewShot>

      <Pressable onPress={share} style={styles.btn}>
        <Text style={styles.txt}>Share</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { marginTop: 8, alignSelf: "flex-end", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  txt: { color: colors.text },
});

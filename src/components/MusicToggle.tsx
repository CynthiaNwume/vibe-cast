import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { colors } from "../theme";

export default function MusicToggle() {
  const player = useAudioPlayer(require("../../assets/audio/pad.mp3"));
  const [on, setOn] = React.useState(false);

  React.useEffect(() => {
    // allow playback even if the phone is on silent
    setAudioModeAsync({ playsInSilentMode: true });
    player.loop = true;        // loop the pad
    player.muted = true;       // start muted (OFF)
    return () => {
      // useAudioPlayer cleans up automatically; nothing required here
    };
  }, []);

  React.useEffect(() => {
    player.muted = !on;
    if (on) {
      // expo-audio doesn't auto-rewind; seek to 0 then play
      player.seekTo(0);
      player.play();
    } else {
      player.pause();
    }
  }, [on]);

  return (
    <Pressable onPress={() => setOn(v => !v)} style={styles.btn}>
      <Text style={styles.txt}>{on ? "Music: ON" : "Music: OFF"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  txt: { color: colors.text, letterSpacing: 1 },
});

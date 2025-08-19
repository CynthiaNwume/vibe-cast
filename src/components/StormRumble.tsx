import React from "react";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";

export default function StormRumble({ active }: { active: boolean }) {
  const player = useAudioPlayer(require("../../assets/audio/rumble.mp3"));

  React.useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
    player.loop = false;
    player.muted = !active;
  }, []);

  React.useEffect(() => {
    let timer: any;
    function schedule() {
      if (!active) return;
      // random gaps between 6s and 18s
      const delay = 6000 + Math.random() * 12000;
      timer = setTimeout(async () => {
        try {
          player.seekTo(0);
          await player.play();
        } catch {}
        schedule();
      }, delay);
    }
    schedule();
    return () => clearTimeout(timer);
  }, [active]);

  return null;
}

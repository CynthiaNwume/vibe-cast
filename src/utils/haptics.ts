import * as Haptics from "expo-haptics";

export async function tap() {
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}
export async function success() {
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}
export async function warn() {
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
}

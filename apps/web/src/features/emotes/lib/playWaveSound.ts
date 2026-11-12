import { notificationSettingsPreference } from "@/features/notifications/lib/notificationSettingsPreferences";
import { getSoundCatalog } from "@/features/sounds/lib/soundCatalog";

// Plays at the notification volume of the settings, read on every play so a
// change applies to the next sound.
export const playWaveSound = (): void => {
    const effect = getSoundCatalog().wave;
    effect.setVolume(notificationSettingsPreference.get().volume);
    void effect.play();
};

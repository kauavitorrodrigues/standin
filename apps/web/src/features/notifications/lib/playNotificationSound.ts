import { NOTIFICATION_SOUND } from "@/features/notifications/consts/notificationSettings";
import { notificationSettingsPreference } from "@/features/notifications/lib/notificationSettingsPreferences";
import { getSoundCatalog } from "@/features/sounds/lib/soundCatalog";
import { throttle } from "@/lib/throttle";

// Plays at the volume saved in the settings, read on every play so a change
// applies to the next sound.
export const playNotificationSoundNow = (): void => {
    const effect = getSoundCatalog().notification;
    effect.setVolume(notificationSettingsPreference.get().volume);
    void effect.play();
};

// A burst of messages makes one sound at the start and one at the end of
// the window instead of one per message.
export const playNotificationSound = throttle(
    playNotificationSoundNow,
    NOTIFICATION_SOUND.throttleMs
);

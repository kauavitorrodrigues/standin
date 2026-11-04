import { NOTIFICATION_SOUND } from "@/features/notifications/consts/notificationSettings";
import { notificationSettingsPreference } from "@/features/notifications/lib/notificationSettingsPreferences";
import { getSoundCatalog } from "@/features/sounds/lib/soundCatalog";
import { throttle } from "@/lib/throttle";

// Plays at the notification volume of the settings, read on every play so a
// change applies to the next sound.
export const playHandRaiseSoundNow = (): void => {
    const effect = getSoundCatalog().handRaise;
    effect.setVolume(notificationSettingsPreference.get().volume);
    void effect.play();
};

// Several hands at once make one sound at the start and one at the end of the
// window instead of one per hand.
export const playHandRaiseSound = throttle(
    playHandRaiseSoundNow,
    NOTIFICATION_SOUND.throttleMs
);

import {
    getPreferredDeviceId,
    subscribeToPreferredDeviceId,
} from "@/features/media-devices/lib/mediaDevicePreferences";
import type { SoundEffect } from "@/features/sounds/lib/SoundEffect";

const effects = new Set<SoundEffect>();
let stopListening: (() => void) | null = null;

// Every live effect plays through the speaker the person chose, also when
// they change it while the app is open. The subscription is only held while
// there is an effect to move.
const track = (effect: SoundEffect): void => {
    effects.add(effect);
    effect.setSinkId(getPreferredDeviceId("speaker"));

    stopListening ??= subscribeToPreferredDeviceId("speaker", (deviceId) => {
        effects.forEach((tracked) => tracked.setSinkId(deviceId || null));
    });
};

const untrack = (effect: SoundEffect): void => {
    effects.delete(effect);
    if (effects.size > 0) return;

    stopListening?.();
    stopListening = null;
};

export const registry = { track, untrack };

import { outputVolumePreference } from "@/features/media-devices/lib/audioSettingsPreferences";
import { getSoundCatalog } from "@/features/sounds/lib/soundCatalog";

// A tone at the volume that other people's voices get, through the chosen
// speaker. A way to check the level and the device without anyone else
// being in the space.
export const playSpeakerTest = (): void => {
    const effect = getSoundCatalog().speakerTest;
    effect.setVolume(outputVolumePreference.get());
    void effect.play();
};

import { NOTIFICATION_SOUND } from "@/features/notifications/consts/notificationSettings";
import { createToneUrl } from "@/features/sounds/lib/createToneUrl";
import { SoundEffect } from "@/features/sounds/lib/SoundEffect";

type SoundCatalog = {
    notification: SoundEffect;
};

let catalog: SoundCatalog | null = null;

// Every sound of the app, made once per session on first use. Joining a
// space asks for it ahead of time, so the first notification does not wait
// on the load. Sounds for features that do not exist yet are added here as
// they arrive.
export const getSoundCatalog = (): SoundCatalog => {
    catalog ??= {
        notification: new SoundEffect(
            createToneUrl(
                NOTIFICATION_SOUND.frequencyHz,
                NOTIFICATION_SOUND.durationSeconds
            )
        ),
    };
    return catalog;
};

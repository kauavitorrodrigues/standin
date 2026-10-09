import {
    CHAT_NOTIFY_MODE_IDS,
    CHAT_SOUND_MODE_IDS,
    DEFAULT_NOTIFICATION_SETTINGS,
    NEARBY_NOTIFY_MODE_IDS,
    NOTIFICATION_SETTINGS_STORAGE_KEY,
    type NotificationSettings,
} from "@/features/notifications/consts/notificationSettings";
import { createLocalPreference } from "@/lib/createLocalPreference";
import { pickAllowed } from "@/lib/pickAllowed";

const parseNotificationSettings = (stored: unknown): NotificationSettings => {
    if (typeof stored !== "object" || stored === null)
        return DEFAULT_NOTIFICATION_SETTINGS;

    const record = stored as Record<string, unknown>;
    const defaults = DEFAULT_NOTIFICATION_SETTINGS;
    return {
        chatNotify: pickAllowed(
            record.chatNotify,
            CHAT_NOTIFY_MODE_IDS,
            defaults.chatNotify
        ),
        chatSound: pickAllowed(
            record.chatSound,
            CHAT_SOUND_MODE_IDS,
            defaults.chatSound
        ),
        nearbyNotify: pickAllowed(
            record.nearbyNotify,
            NEARBY_NOTIFY_MODE_IDS,
            defaults.nearbyNotify
        ),
    };
};

export const notificationSettingsPreference = createLocalPreference({
    key: NOTIFICATION_SETTINGS_STORAGE_KEY,
    fallback: DEFAULT_NOTIFICATION_SETTINGS,
    parse: parseNotificationSettings,
});

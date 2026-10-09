// Which chat messages raise a notification or a sound while the tab is in the
// background. Mentions and replies do not exist in the chat yet.
export const CHAT_NOTIFY_MODE_IDS = ["all", "direct", "none"] as const;
export type ChatNotifyMode = (typeof CHAT_NOTIFY_MODE_IDS)[number];

export const CHAT_SOUND_MODE_IDS = ["all", "direct", "never"] as const;
export type ChatSoundMode = (typeof CHAT_SOUND_MODE_IDS)[number];

// Whether someone coming into range while the tab is in the background is
// announced.
export const NEARBY_NOTIFY_MODE_IDS = ["all", "none"] as const;
export type NearbyNotifyMode = (typeof NEARBY_NOTIFY_MODE_IDS)[number];

export type NotificationSettings = {
    chatNotify: ChatNotifyMode;
    chatSound: ChatSoundMode;
    nearbyNotify: NearbyNotifyMode;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    chatNotify: "direct",
    chatSound: "direct",
    nearbyNotify: "all",
};

export const NOTIFICATION_SETTINGS_STORAGE_KEY = "notification_settings";

export const NOTIFICATION_SOUND = {
    frequencyHz: 880,
    durationSeconds: 0.18,
    volume: 0.12,
} as const;

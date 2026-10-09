import { useSyncExternalStore } from "react";
import { notificationSettingsPreference } from "@/features/notifications/lib/notificationSettingsPreferences";

export const useNotificationSettingsPreference = () =>
    useSyncExternalStore(
        notificationSettingsPreference.subscribe,
        notificationSettingsPreference.get
    );

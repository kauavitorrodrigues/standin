import { NOTIFICATIONS_ENABLED_STORAGE_KEY } from "@/features/notifications/consts/preference";
import { createLocalPreference } from "@/lib/createLocalPreference";

// On unless the person turned it off: the browser permission is what gates
// notifications by default, this is only the way to opt out of them.
export const notificationsEnabledPreference = createLocalPreference({
    key: NOTIFICATIONS_ENABLED_STORAGE_KEY,
    fallback: true,
    parse: (stored) => stored !== false,
});

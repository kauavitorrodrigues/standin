import { useCallback, useSyncExternalStore } from "react";
import { NOTIFICATION_PERMISSION } from "@/features/notifications/consts/permission";
import { useNotificationPermission } from "@/features/notifications/hooks/useNotificationPermission";
import { notificationsEnabledPreference } from "@/features/notifications/lib/notificationPreferences";
import {
    areNotificationsEnabled,
    canChangeNotifications,
} from "@/features/notifications/utils/notificationPermissionStatus";

export const useNotificationSettings = () => {
    const { permission, request } = useNotificationPermission();
    const isPreferred = useSyncExternalStore(
        notificationsEnabledPreference.subscribe,
        notificationsEnabledPreference.get
    );

    // Turning on may need to ask the browser first, and stays off if it says
    // no. Turning off only drops the preference: a permission cannot be taken
    // back from the page.
    const setEnabled = useCallback(
        async (enabled: boolean) => {
            if (!enabled) {
                notificationsEnabledPreference.set(false);
                return;
            }

            const granted =
                permission === NOTIFICATION_PERMISSION.GRANTED ||
                (await request()) === NOTIFICATION_PERMISSION.GRANTED;
            if (granted) notificationsEnabledPreference.set(true);
        },
        [permission, request]
    );

    return {
        permission,
        isEnabled: areNotificationsEnabled(permission, isPreferred),
        canChange: canChangeNotifications(permission),
        setEnabled,
    };
};

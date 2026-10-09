import {
    NOTIFICATION_PERMISSION,
    type NotificationPermissionState,
} from "@/features/notifications/consts/permission";

// Notifications are shown only when the browser allows them and the person
// has not turned them off in the app.
export const areNotificationsEnabled = (
    permission: NotificationPermissionState,
    isPreferred: boolean
): boolean => permission === NOTIFICATION_PERMISSION.GRANTED && isPreferred;

// Once the browser blocked the site, or has no notifications, nothing in the
// app can change that.
export const canChangeNotifications = (
    permission: NotificationPermissionState
): boolean =>
    permission !== NOTIFICATION_PERMISSION.DENIED &&
    permission !== NOTIFICATION_PERMISSION.UNSUPPORTED;

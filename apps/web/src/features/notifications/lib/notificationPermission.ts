import {
    NOTIFICATION_PERMISSION,
    type NotificationPermissionState,
} from "@/features/notifications/consts/permission";

const isSupported = (): boolean =>
    typeof window !== "undefined" && "Notification" in window;

export const getNotificationPermission = (): NotificationPermissionState =>
    isSupported()
        ? Notification.permission
        : NOTIFICATION_PERMISSION.UNSUPPORTED;

// Asks the browser, which only shows its prompt while the permission is
// still "default". Answers with the resulting permission.
export const requestNotificationPermission =
    async (): Promise<NotificationPermissionState> => {
        if (!isSupported()) return NOTIFICATION_PERMISSION.UNSUPPORTED;
        return Notification.requestPermission();
    };

import { NOTIFICATION_PERMISSION } from "@/features/notifications/consts/permission";
import { getNotificationPermission } from "@/features/notifications/lib/notificationPermission";

// Nothing is shown without the browser's permission. The tag makes a newer
// notification of the same kind replace the previous one.
export const showBrowserNotification = (
    title: string,
    body: string,
    tag: string,
    onClick?: () => void
): void => {
    if (getNotificationPermission() !== NOTIFICATION_PERMISSION.GRANTED) return;

    const notification = new Notification(title, { body, tag });
    notification.onclick = () => {
        window.focus();
        onClick?.();
    };
};

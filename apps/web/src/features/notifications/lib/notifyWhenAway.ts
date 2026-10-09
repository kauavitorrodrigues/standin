import { notificationsEnabledPreference } from "@/features/notifications/lib/notificationPreferences";
import { playNotificationSound } from "@/features/notifications/lib/playNotificationSound";
import { showBrowserNotification } from "@/features/notifications/lib/showBrowserNotification";

type AwayNotification = {
    title: string;
    body: string;
    tag: string;
    // Each is decided by its own setting, so a notification can come without
    // a sound and the other way around.
    showNotification: boolean;
    playSound: boolean;
};

// Everything here is for the person who is tabbed away: with the tab in
// front they already see what happens. The master switch of the settings
// turns it all off.
export const notifyWhenAway = ({
    title,
    body,
    tag,
    showNotification,
    playSound,
}: AwayNotification): void => {
    if (!document.hidden) return;
    if (!notificationsEnabledPreference.get()) return;

    if (showNotification) showBrowserNotification(title, body, tag);
    if (playSound) playNotificationSound();
};

export const NOTIFICATION_PERMISSION = {
    DEFAULT: "default",
    GRANTED: "granted",
    DENIED: "denied",
    UNSUPPORTED: "unsupported",
} as const;

// What the browser reports, or that it has no notifications at all.
export type NotificationPermissionState =
    (typeof NOTIFICATION_PERMISSION)[keyof typeof NOTIFICATION_PERMISSION];

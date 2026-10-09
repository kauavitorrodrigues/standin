import { useCallback, useEffect, useState } from "react";
import {
    getNotificationPermission,
    requestNotificationPermission,
} from "@/features/notifications/lib/notificationPermission";

// The browser's permission, kept live: it can change in the site settings
// while the page is open.
export const useNotificationPermission = () => {
    const [permission, setPermission] = useState(getNotificationPermission);

    useEffect(() => {
        if (!navigator.permissions) return;

        let status: PermissionStatus | null = null;
        let cancelled = false;
        const sync = () => setPermission(getNotificationPermission());

        navigator.permissions
            .query({ name: "notifications" })
            .then((result) => {
                if (cancelled) return;
                status = result;
                status.addEventListener("change", sync);
            })
            .catch(() => {});

        return () => {
            cancelled = true;
            status?.removeEventListener("change", sync);
        };
    }, []);

    const request = useCallback(async () => {
        const result = await requestNotificationPermission();
        setPermission(result);
        return result;
    }, []);

    return { permission, request };
};

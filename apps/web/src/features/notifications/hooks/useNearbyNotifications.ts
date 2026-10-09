import { useEffect, useRef } from "react";
import { notificationSettingsPreference } from "@/features/notifications/lib/notificationSettingsPreferences";
import { notifyWhenAway } from "@/features/notifications/lib/notifyWhenAway";

type NearbyNotificationsOptions = {
    nearbyUserIds: readonly string[];
    getName: (userId: string) => string;
};

// Tells a person who is tabbed away that someone came into range. Whoever was
// already there when this started, or stays, is not announced again.
export const useNearbyNotifications = ({
    nearbyUserIds,
    getName,
}: NearbyNotificationsOptions) => {
    const previousRef = useRef<ReadonlySet<string>>(new Set(nearbyUserIds));
    const getNameRef = useRef(getName);
    useEffect(() => {
        getNameRef.current = getName;
    });

    useEffect(() => {
        const previous = previousRef.current;
        previousRef.current = new Set(nearbyUserIds);

        const arrivals = nearbyUserIds.filter((id) => !previous.has(id));
        if (arrivals.length === 0) return;

        const { nearbyNotify } = notificationSettingsPreference.get();
        if (nearbyNotify === "none") return;

        notifyWhenAway({
            title: "Alguém chegou por perto",
            body: arrivals.map((id) => getNameRef.current(id)).join(", "),
            tag: "nearby",
            showNotification: true,
            playSound: false,
        });
    }, [nearbyUserIds]);
};

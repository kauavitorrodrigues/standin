import { useCallback, useSyncExternalStore } from "react";
import type { CustomStatus } from "@standin/contracts";
import { usePrivacyMode } from "@/features/media-devices/hooks/usePrivacyMode";
import { setPrivacyPreference } from "@/features/media-devices/lib/privacyPreferences";
import { USER_STATUSES, type UserStatus } from "../consts/user-status";
import {
    customStatusPreference,
    getIdle,
    manualAwayPreference,
    setIdle,
    subscribeToIdle,
} from "../lib/availabilityStore";
import type { CustomStatusDraft } from "../types/availability";
import { buildCustomStatus } from "../utils/customStatus";
import { chooseStatus, resolveUserStatus } from "../utils/userStatus";

/**
 * The status of the local person. Busy is the do not disturb mode: they hear
 * and see nobody and nobody hears or sees them. Away takes the person out of
 * the office, by choice or after five minutes with no input, and only ends
 * when they choose to return. The custom status is the line with an emoji. All
 * of it is remembered on the device, except the away from inactivity.
 */
export const useUserStatus = () => {
    const isBusy = usePrivacyMode("headphones");
    const isManualAway = useSyncExternalStore(
        manualAwayPreference.subscribe,
        manualAwayPreference.get
    );
    const isIdle = useSyncExternalStore(subscribeToIdle, getIdle);
    const customStatus = useSyncExternalStore(
        customStatusPreference.subscribe,
        customStatusPreference.get
    );

    const setStatus = useCallback((status: UserStatus) => {
        const chosen = chooseStatus(status);
        setPrivacyPreference("headphones", chosen.isBusy);
        manualAwayPreference.set(chosen.isManualAway);
        // Choosing a status is how the person comes back from the away that
        // came from inactivity, which activity does not end.
        setIdle(false);
    }, []);

    const returnToOffice = useCallback(
        () => setStatus(USER_STATUSES.ACTIVE),
        [setStatus]
    );

    // Returns whether the draft was a valid status and was kept.
    const saveCustomStatus = useCallback((draft: CustomStatusDraft) => {
        const status: CustomStatus | null = buildCustomStatus(
            draft,
            Date.now(),
            customStatusPreference.get()?.expiresAt ?? null
        );
        if (!status) return false;

        customStatusPreference.set(status);
        return true;
    }, []);

    const clearCustomStatus = useCallback(
        () => customStatusPreference.set(null),
        []
    );

    return {
        status: resolveUserStatus({ isBusy, isManualAway, isIdle }),
        setStatus,
        returnToOffice,
        customStatus,
        saveCustomStatus,
        clearCustomStatus,
    };
};

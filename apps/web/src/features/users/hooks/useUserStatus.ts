import { useCallback } from "react";
import { usePrivacyMode } from "@/features/media-devices/hooks/usePrivacyMode";
import { setPrivacyPreference } from "@/features/media-devices/lib/privacyPreferences";
import type { UserStatus } from "../consts/user-status";
import { isBusyStatus, statusOfBusy } from "../utils/userStatus";

/**
 * The status of the local person. Busy is the do not disturb mode: they hear
 * and see nobody and nobody hears or sees them. It is remembered on the device.
 */
export const useUserStatus = () => {
    const isBusy = usePrivacyMode("headphones");

    const setStatus = useCallback(
        (status: UserStatus) =>
            setPrivacyPreference("headphones", isBusyStatus(status)),
        []
    );

    return { status: statusOfBusy(isBusy), setStatus };
};

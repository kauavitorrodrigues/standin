import { useSyncExternalStore } from "react";
import {
    getPrivacyPreference,
    subscribeToPrivacyPreference,
    type PrivacyMode,
} from "@/features/media-devices/lib/privacyPreferences";

/** Live value of a privacy mode of the local person. */
export const usePrivacyMode = (mode: PrivacyMode): boolean =>
    useSyncExternalStore(
        (onChange) => subscribeToPrivacyPreference(mode, onChange),
        () => getPrivacyPreference(mode)
    );

export type PrivacyMode = "headphones" | "focus";

// Headphones are remembered across visits like the microphone, so a person who
// wanted to be left alone is still left alone after a reload. Focus mode has
// no control yet, so it only lives as long as the page does.
const PERSISTED_PRIVACY_KEY: Partial<Record<PrivacyMode, string>> = {
    headphones: "media_headphones_enabled",
};

const sessionPrivacy: Partial<Record<PrivacyMode, boolean>> = {};

type PrivacyListener = () => void;
const privacyListeners: Record<PrivacyMode, Set<PrivacyListener>> = {
    headphones: new Set(),
    focus: new Set(),
};

/** Reads a privacy mode. Both start off. */
export const getPrivacyPreference = (mode: PrivacyMode): boolean => {
    const key = PERSISTED_PRIVACY_KEY[mode];
    if (!key) return sessionPrivacy[mode] ?? false;

    try {
        return localStorage.getItem(key) === "true";
    } catch {
        return sessionPrivacy[mode] ?? false;
    }
};

/** Stores a privacy mode and tells every listener of the same tab. */
export const setPrivacyPreference = (
    mode: PrivacyMode,
    enabled: boolean
): void => {
    sessionPrivacy[mode] = enabled;
    const key = PERSISTED_PRIVACY_KEY[mode];
    if (key) {
        try {
            localStorage.setItem(key, String(enabled));
        } catch {
            // The choice still holds for this visit through the session value.
        }
    }
    privacyListeners[mode].forEach((listener) => listener());
};

/** Calls the listener when the mode changes. Returns the unsubscribe. */
export const subscribeToPrivacyPreference = (
    mode: PrivacyMode,
    listener: PrivacyListener
): (() => void) => {
    privacyListeners[mode].add(listener);
    return () => privacyListeners[mode].delete(listener);
};

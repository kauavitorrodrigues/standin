import type { OnboardingChecklistPreferences } from "../types/preferences";

const DEFAULT_PREFERENCES: OnboardingChecklistPreferences = {
    autoOpened: false,
    celebrated: false,
};

const keyOf = (userId: string) => `onboarding_checklist_${userId}`;

// What the checklist remembers per person in this browser. The progress itself
// is on the server; this only keeps the panel from nagging.
export function readChecklistPreferences(
    userId: string
): OnboardingChecklistPreferences {
    try {
        const raw = localStorage.getItem(keyOf(userId));
        if (raw === null) return DEFAULT_PREFERENCES;
        const parsed: Partial<OnboardingChecklistPreferences> = JSON.parse(raw);
        return {
            autoOpened: parsed.autoOpened === true,
            celebrated: parsed.celebrated === true,
        };
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

export function writeChecklistPreferences(
    userId: string,
    patch: Partial<OnboardingChecklistPreferences>
): void {
    try {
        localStorage.setItem(
            keyOf(userId),
            JSON.stringify({ ...readChecklistPreferences(userId), ...patch })
        );
    } catch {
        // Without storage the panel may open again on the next visit, which
        // is harmless.
    }
}

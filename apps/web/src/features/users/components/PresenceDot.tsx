import { usePrivacyMode } from "@/features/media-devices/hooks/usePrivacyMode";

/**
 * The status dot on the avatar of the person: green when they are available and
 * amber when they asked not to be disturbed.
 */
export const PresenceDot = () => {
    const isDoNotDisturb = usePrivacyMode("headphones");

    if (isDoNotDisturb) {
        return (
            <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-muted bg-amber-500" />
        );
    }

    return (
        <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-muted bg-emerald-500" />
    );
};

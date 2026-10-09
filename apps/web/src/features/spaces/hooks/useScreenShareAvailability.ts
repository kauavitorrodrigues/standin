import { useScreenShareSettingsPreference } from "@/features/media-devices/hooks/useScreenShareSettingsPreference";
import { getIdleGraceMs } from "@/features/media-devices/lib/screenConstraints";
import { toast } from "@/components/ui/toast";
import { useStopShareWithoutViewers } from "@/features/media-devices/hooks/useStopShareWithoutViewers";
import { ScreenShareMessages } from "@/features/spaces/components/forms/Messages";

type ScreenShareAvailabilityOptions = {
    isSharing: boolean;
    stop: () => void;
    nearbyUserIds: readonly string[];
};

export const useScreenShareAvailability = ({
    isSharing,
    stop,
    nearbyUserIds,
}: ScreenShareAvailabilityOptions) => {
    const hasViewers = nearbyUserIds.length > 0;
    const graceMs = getIdleGraceMs(useScreenShareSettingsPreference());

    // A share nobody can receive is only a capture running for nothing, so it
    // ends after a while without anyone nearby.
    useStopShareWithoutViewers({
        isSharing,
        hasViewers,
        stop,
        graceMs,
        onStopped: () =>
            toast.add({
                title: ScreenShareMessages.stoppedNoViewers,
                type: "info",
            }),
    });

    // Sharing needs someone to share with, so the button only shows up once a
    // peer is close enough to receive it. It stays visible while a share is
    // running, otherwise walking away would leave no way to stop it.
    return { canShareScreen: isSharing || hasViewers };
};

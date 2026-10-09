import type { useSpaceConnection } from "@/features/game/multiplayer/hooks/useSpaceConnection";
import { useScreenShareAvailability } from "@/features/spaces/hooks/useScreenShareAvailability";
import type { SpaceMediaControls } from "@/features/spaces/types/mediaControls";

type SpaceConnection = ReturnType<typeof useSpaceConnection>;

type SpaceMediaControlsOptions = {
    video: SpaceConnection["video"];
    micError: SpaceConnection["localAudioError"];
};

// Called once per page: the share availability hook has side effects (it
// stops a share nobody can receive), so it must not run per rendered control.
export const useSpaceMediaControls = ({
    video,
    micError,
}: SpaceMediaControlsOptions): SpaceMediaControls => {
    const { canShareScreen } = useScreenShareAvailability({
        isSharing: video.screenShare.isSharing,
        stop: video.screenShare.stop,
        nearbyUserIds: video.nearbyUserIds,
    });

    return {
        canShareScreen,
        screenShare: video.screenShare,
        micError,
        cameraError: video.localCameraError,
    };
};

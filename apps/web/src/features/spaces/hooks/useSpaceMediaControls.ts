import type { NearbyChatConnection } from "@/features/nearby-chat/types/nearby-chat";
import type { useSpaceConnection } from "@/features/game/multiplayer/hooks/useSpaceConnection";
import { useScreenShareAvailability } from "@/features/spaces/hooks/useScreenShareAvailability";
import type { SpaceSoundboard } from "@/features/soundboard/types/space";
import type { SpaceMediaControls } from "@/features/spaces/types/mediaControls";

type SpaceConnection = ReturnType<typeof useSpaceConnection>;

type SpaceMediaControlsOptions = {
    video: SpaceConnection["video"];
    micError: SpaceConnection["localAudioError"];
    sendEmote: SpaceConnection["sendEmote"];
    nearbyChat: NearbyChatConnection;
    soundboard: SpaceSoundboard | null;
};

// Called once per page: the share availability hook has side effects (it
// stops a share nobody can receive), so it must not run per rendered control.
export const useSpaceMediaControls = ({
    video,
    micError,
    sendEmote,
    nearbyChat,
    soundboard,
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
        sendEmote,
        nearbyChat,
        soundboard,
    };
};

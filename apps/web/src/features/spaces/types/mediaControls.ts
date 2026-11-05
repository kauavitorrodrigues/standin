import type { NearbyChatConnection } from "@/features/nearby-chat/types/nearby-chat";
import type { SpaceSoundboard } from "@/features/soundboard/types/space";
import type { SpaceAnnouncing } from "@/features/spaces/announcing/types/announcing";
import type { SpaceHandRaise } from "@/features/spaces/hand-raise/types/handRaise";
import type { useSpaceConnection } from "@/features/game/multiplayer/hooks/useSpaceConnection";

type SpaceConnection = ReturnType<typeof useSpaceConnection>;

// What the media controls need from the space connection. Built once by
// useSpaceMediaControls and shared by every place the controls are rendered.
export type SpaceMediaControls = {
    canShareScreen: boolean;
    screenShare: SpaceConnection["video"]["screenShare"];
    micError: SpaceConnection["localAudioError"];
    cameraError: SpaceConnection["video"]["localCameraError"];
    sendEmote: SpaceConnection["sendEmote"];
    sendConfetti: SpaceConnection["sendConfetti"];
    setDancing: SpaceConnection["setDancing"];
    nearbyChat: NearbyChatConnection;
    // Null where the person cannot play clips, such as a guest.
    soundboard: SpaceSoundboard | null;
    // Null where the person cannot announce, such as a guest.
    announcing: SpaceAnnouncing | null;
    // Null where the person cannot raise a hand, such as a guest.
    handRaise: SpaceHandRaise | null;
};

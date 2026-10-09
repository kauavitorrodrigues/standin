import type { useSpaceConnection } from "@/features/game/multiplayer/hooks/useSpaceConnection";

type SpaceConnection = ReturnType<typeof useSpaceConnection>;

// What the media controls need from the space connection. Built once by
// useSpaceMediaControls and shared by every place the controls are rendered.
export type SpaceMediaControls = {
    canShareScreen: boolean;
    screenShare: SpaceConnection["video"]["screenShare"];
    micError: SpaceConnection["localAudioError"];
    cameraError: SpaceConnection["video"]["localCameraError"];
};

import { useEffect, useState } from "react";
import type {
    CameraState,
    GameEngineHandle,
} from "@/features/game/types/game";

const DEFAULT_CAMERA_STATE: CameraState = {
    canZoomIn: true,
    canZoomOut: true,
    isFollowingPlayer: true,
};

export const useCameraState = (
    handle: GameEngineHandle | null
): CameraState => {
    const [cameraState, setCameraState] =
        useState<CameraState>(DEFAULT_CAMERA_STATE);

    useEffect(() => {
        if (!handle) return;

        return handle.subscribeToCameraState(setCameraState);
    }, [handle]);

    return cameraState;
};

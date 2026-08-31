import type Phaser from "phaser";
import type { MapAssetManifest } from "@/features/game/types/tilemap";

export type GameEngineOptions = {
    container: HTMLElement;
    map: MapAssetManifest;
    initialCameraOffsetX: number;
};

export type CameraState = {
    canZoomIn: boolean;
    canZoomOut: boolean;
    isFollowingPlayer: boolean;
};

export type GameEngineHandle = {
    game: Phaser.Game;
    destroy: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    focusOnPlayer: () => void;
    subscribeToCameraState: (
        listener: (state: CameraState) => void
    ) => () => void;
};

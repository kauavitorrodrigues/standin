import type Phaser from "phaser";
import type { HoverState } from "@/features/game/types/hover";
import type { GameMapData } from "@/features/game/types/tilemap";

export type GameEngineOptions = {
    container: HTMLElement;
    map: GameMapData;
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
    subscribeToHover: (
        event: string,
        listener: (hover: HoverState | null) => void
    ) => () => void;
    // Where the selected target is on the canvas, null with none selected.
    subscribeToSelected: (
        event: string,
        listener: (state: HoverState | null) => void
    ) => () => void;
    // A click with no drag of the camera, on a target or on the empty map
    // (null).
    subscribeToHoverClick: (
        event: string,
        listener: (id: string | null) => void
    ) => () => void;
    // Keeps a target outlined until it is selected no more (null).
    selectHover: (event: string, id: string | null) => void;
    // Keeps the outline of a target while the mouse is on its card.
    pinHover: (event: string, id: string | null) => void;
};

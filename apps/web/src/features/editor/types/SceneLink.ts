import type { SceneSyncTarget } from "@/features/editor/types/SceneSyncTarget";

// How the engine hands its scene to whoever drives it from outside.
export type SceneLink = {
    attachScene: (scene: SceneSyncTarget) => void;
    detachScene: () => void;
};

import type { SceneSyncTarget } from "@/features/maps/__shared__/types/SceneSyncTarget";

// How the engine hands its scene to whoever drives it from outside.
export type SceneLink = {
    attachScene: (scene: SceneSyncTarget) => void;
    detachScene: () => void;
};

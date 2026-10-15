import { useCallback } from "react";
import type { GameMapData } from "@/features/game/types/tilemap";
import { createMapPreviewEngine } from "./createMapPreviewEngine";

// The ref callback of the element the preview is drawn into. The game lives
// as long as the element and the map it was given.
export const useMapPreviewEngine = (map: GameMapData) =>
    useCallback(
        (container: HTMLDivElement | null) => {
            if (!container) return;
            return createMapPreviewEngine({ container, map });
        },
        [map]
    );

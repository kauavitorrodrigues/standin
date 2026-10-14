import type { GameMapData } from "@/features/game/types/tilemap";
import { useMapPreviewEngine } from "./useMapPreviewEngine";

// Fills its parent with the map. Give it a parent of the proportion of the
// map, the camera fits the whole map inside.
export const MapPreviewCanvas = ({ map }: { map: GameMapData }) => {
    const containerRef = useMapPreviewEngine(map);

    return <div ref={containerRef} className="size-full" />;
};

import { useCallback, useEffect, useRef, useState } from "react";
import { createGameEngine } from "@/features/game/lib/Engine";
import type { GameEngineHandle } from "@/features/game/types/game";
import type { MapAssetManifest } from "@/features/game/types/tilemap";

export const useGameEngine = (
    map: MapAssetManifest | null,
    initialCameraOffsetX: number
) => {
    const [handle, setHandle] = useState<GameEngineHandle | null>(null);

    const offsetRef = useRef(initialCameraOffsetX);
    useEffect(() => {
        offsetRef.current = initialCameraOffsetX;
    }, [initialCameraOffsetX]);

    const containerRef = useCallback(
        (container: HTMLDivElement | null) => {
            if (!container || !map) return;

            const engine = createGameEngine({
                container,
                map,
                initialCameraOffsetX: offsetRef.current,
            });
            setHandle(engine);

            return () => {
                engine.destroy();
                setHandle(null);
            };
        },
        [map]
    );

    return { containerRef, handle };
};

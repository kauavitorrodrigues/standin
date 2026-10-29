import { useCallback, useEffect, useRef, useState } from "react";
import { useEffectivePerformanceSettings } from "@/features/settings/performance/hooks/useEffectivePerformanceSettings";
import { getFpsLimit } from "@/features/settings/performance/lib/performanceValues";
import { applyFpsLimit } from "@/features/game/utils/fpsLimit";
import { createGameEngine } from "@/features/game/lib/Engine";
import { getWebglProbe } from "@/features/game/utils/probeWebgl";
import { useMapRenderSync } from "@/features/game/hooks/useMapRenderSync";
import type { GameEngineHandle } from "@/features/game/types/game";
import type { GameMapData } from "@/features/game/types/tilemap";

export const useGameEngine = (
    map: GameMapData | null,
    initialCameraOffsetX: number
) => {
    const [handle, setHandle] = useState<GameEngineHandle | null>(null);

    const offsetRef = useRef(initialCameraOffsetX);
    useEffect(() => {
        offsetRef.current = initialCameraOffsetX;
    }, [initialCameraOffsetX]);

    // A new limit in the settings applies to the running game.
    const fpsLimit = getFpsLimit(useEffectivePerformanceSettings());
    useEffect(() => {
        if (handle) applyFpsLimit(handle.game, fpsLimit);
    }, [handle, fpsLimit]);

    const containerRef = useCallback(
        (container: HTMLDivElement | null) => {
            if (!container || !map) return;
            // With no WebGL the page says so (see GameCanvas) and there is no
            // game to start: Phaser would fall back to a canvas that is too
            // slow for the space.
            if (getWebglProbe().status === "unsupported") return;

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

    useMapRenderSync(handle, map?.id ?? "");

    return { containerRef, handle };
};

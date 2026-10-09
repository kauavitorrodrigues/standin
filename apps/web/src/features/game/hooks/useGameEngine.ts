import { useCallback, useEffect, useRef, useState } from "react";
import { usePerformanceSettingsPreference } from "@/features/settings/performance/hooks/usePerformanceSettingsPreference";
import { getFpsLimit } from "@/features/settings/performance/lib/performanceValues";
import { applyFpsLimit } from "@/features/game/utils/fpsLimit";
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

    // A new limit in the settings applies to the running game.
    const fpsLimit = getFpsLimit(usePerformanceSettingsPreference());
    useEffect(() => {
        if (handle) applyFpsLimit(handle.game, fpsLimit);
    }, [handle, fpsLimit]);

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

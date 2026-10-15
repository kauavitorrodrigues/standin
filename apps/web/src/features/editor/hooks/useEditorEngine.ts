import type { TileRect } from "@/features/editor/types/tile-rect";
import { useCallback, useRef, useState } from "react";
import type { Cell } from "@standin/contracts";
import { createEditorEngine } from "@/features/editor/lib/EditorEngine";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { THUMBNAIL_MESSAGES } from "@/features/editor/consts/messages";
import { applyToolbarAnchor } from "@/features/editor/utils/applyToolbarAnchor";
import { formatCell } from "@/features/editor/utils/formatCell";
import type { GameMapData } from "@/features/game/types/tilemap";
import type { ZoneNameRequest } from "@/features/editor/types/zone-name-request";
import type { FrameConfig } from "@/features/editor/types/FrameConfig";
import type { SceneLink } from "@/features/editor/types/SceneLink";
import type { EditorEngineHandle } from "@/features/editor/types/editor";

/**
 * Mounts the Phaser game in the container and destroys it when the container
 * goes away or the map changes, so no canvas is left behind. The cell under
 * the cursor is written straight into the readout element, never into state.
 */
export const useEditorEngine = (
    map: GameMapData,
    sceneLink?: SceneLink,
    frame?: FrameConfig
) => {
    const store = useEditorStore();
    const draftStore = useDraftStore();
    const engineRef = useRef<EditorEngineHandle | null>(null);
    const coordinatesRef = useRef<HTMLElement | null>(null);
    const hintRef = useRef<HTMLElement | null>(null);
    // The bar over the selected object, moved by the scene without a render.
    const toolbarRef = useRef<HTMLDivElement | null>(null);
    // The bar over the selected zone, moved the same way.
    const zoneToolbarRef = useRef<HTMLDivElement | null>(null);
    // Set only when the zone tool asks for a name, never by pointer moves.
    const [zoneNameRequest, setZoneNameRequest] =
        useState<ZoneNameRequest | null>(null);

    const containerRef = useCallback(
        (container: HTMLDivElement | null) => {
            if (!container) return;

            const engine = createEditorEngine({
                container,
                map,
                store,
                draftStore,
                frame,
                onHint: (text: string | null) => {
                    if (!hintRef.current) return;
                    hintRef.current.textContent = text ?? "";
                },
                onSelectionAnchor: (anchor) =>
                    applyToolbarAnchor(toolbarRef.current, anchor),
                onHoverCell: (cell: Cell | null) => {
                    if (!coordinatesRef.current) return;
                    coordinatesRef.current.textContent = formatCell(cell);
                },
                onSceneReady: sceneLink?.attachScene,
                onSceneLost: sceneLink?.detachScene,
                onZoneNameRequest: setZoneNameRequest,
                onZoneAnchor: (anchor) =>
                    applyToolbarAnchor(zoneToolbarRef.current, anchor),
            });
            engineRef.current = engine;

            return () => {
                engineRef.current = null;
                engine.destroy();
            };
        },
        [map, store, draftStore, sceneLink, frame]
    );

    const fitCamera = useCallback(() => engineRef.current?.fitCamera(), []);

    const focusCell = useCallback(
        (cell: Cell) => engineRef.current?.focusCell(cell),
        []
    );

    const confirmZoneName = useCallback((label: string) => {
        setZoneNameRequest(null);
        engineRef.current?.confirmZoneName(label);
    }, []);

    const cancelZoneName = useCallback(() => {
        setZoneNameRequest(null);
        engineRef.current?.cancelZoneName();
    }, []);

    const captureThumbnail = useCallback((): Promise<Blob> => {
        const engine = engineRef.current;
        if (!engine)
            return Promise.reject(new Error(THUMBNAIL_MESSAGES.CAPTURE_FAILED));
        return engine.captureThumbnail();
    }, []);

    const captureNativeSnapshot = useCallback(
        (rect?: TileRect): Promise<Blob> => {
            const engine = engineRef.current;
            if (!engine)
                return Promise.reject(
                    new Error(THUMBNAIL_MESSAGES.CAPTURE_FAILED)
                );
            return engine.captureNativeSnapshot(rect);
        },
        []
    );

    return {
        containerRef,
        coordinatesRef,
        hintRef,
        toolbarRef,
        zoneToolbarRef,
        fitCamera,
        focusCell,
        captureThumbnail,
        captureNativeSnapshot,
        zoneNameRequest,
        confirmZoneName,
        cancelZoneName,
    };
};

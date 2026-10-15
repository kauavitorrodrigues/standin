import Phaser from "phaser";
import {
    GAME_PHYSICS_CONFIG,
    GAME_RENDER_CONFIG,
} from "@/features/game/consts/game-config";
import {
    bindGameResize,
    destroyGameWhenReady,
} from "@/features/game/utils/game";
import { EDITOR_EVENTS } from "@/features/editor/consts/events";
import { EDITOR_STATUS } from "@/features/editor/consts/status";
import { EDITOR_RENDER_CONFIG } from "@/features/editor/consts/game-config";
import { THUMBNAIL_MESSAGES } from "@/features/editor/consts/messages";
import { EDITOR_SCENE_KEYS } from "@/features/editor/consts/scene-keys";
import { EditorScene } from "@/features/editor/scenes/EditorScene";
import type { ZoomLevel } from "@standin/contracts";
import type { ZoneNameRequest } from "@/features/editor/types/zone-name-request";
import type {
    EditorEngineHandle,
    EditorEngineOptions,
} from "@/features/editor/types/editor";

export const createEditorEngine = ({
    container,
    map,
    store,
    draftStore,
    frame,
    onHoverCell,
    onHint,
    onSelectionAnchor,
    onZoneAnchor,
    onSceneReady,
    onSceneLost,
    onZoneNameRequest,
}: EditorEngineOptions): EditorEngineHandle => {
    const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: container,
        width: container.clientWidth,
        height: container.clientHeight,
        pixelArt: GAME_RENDER_CONFIG.PIXEL_ART,
        roundPixels: EDITOR_RENDER_CONFIG.ROUND_PIXELS,
        backgroundColor: GAME_RENDER_CONFIG.BACKGROUND_COLOR,
        disableContextMenu: GAME_RENDER_CONFIG.DISABLE_CONTEXT_MENU,
        scale: {
            mode: Phaser.Scale.RESIZE,
        },
        // Only needed to build the footprint zones of placed objects.
        physics: {
            default: GAME_PHYSICS_CONFIG.SYSTEM,
            arcade: {
                debug: GAME_PHYSICS_CONFIG.DEBUG,
            },
        },
        scene: [],
    });

    // The scene tells React only about discrete changes. These listeners are
    // the whole way from the scene to the store and the DOM.
    const handleZoomChanged = (zoom: ZoomLevel) => store.setZoom(zoom);
    const handleSceneReady = () => {
        store.setStatus(EDITOR_STATUS.READY);
        const scene = game.scene.getScene(EDITOR_SCENE_KEYS.EDITOR);
        if (scene instanceof EditorScene) onSceneReady?.(scene);
    };

    const handleZoneNameRequested = (request: ZoneNameRequest) =>
        onZoneNameRequest?.(request);
    const handleZoneNameClosed = () => onZoneNameRequest?.(null);

    store.setStatus(EDITOR_STATUS.LOADING);
    game.events.on(EDITOR_EVENTS.ZONE_NAME_REQUESTED, handleZoneNameRequested);
    game.events.on(EDITOR_EVENTS.ZONE_NAME_CLOSED, handleZoneNameClosed);
    game.events.on(EDITOR_EVENTS.ZOOM_CHANGED, handleZoomChanged);
    game.events.on(EDITOR_EVENTS.SCENE_READY, handleSceneReady);
    game.events.on(EDITOR_EVENTS.CELL_HOVERED, onHoverCell);
    if (onHint) game.events.on(EDITOR_EVENTS.HINT_CHANGED, onHint);
    if (onSelectionAnchor) {
        game.events.on(
            EDITOR_EVENTS.SELECTION_ANCHOR_CHANGED,
            onSelectionAnchor
        );
    }

    if (onZoneAnchor) {
        game.events.on(EDITOR_EVENTS.ZONE_ANCHOR_CHANGED, onZoneAnchor);
    }

    game.scene.add(EDITOR_SCENE_KEYS.EDITOR, EditorScene, true, {
        map,
        store,
        draftStore,
        frame,
    });

    const unbindResize = bindGameResize(game, container);

    return {
        game,
        fitCamera: () => game.events.emit(EDITOR_EVENTS.FIT_REQUESTED),
        focusCell: (cell) =>
            game.events.emit(EDITOR_EVENTS.FOCUS_CELL_REQUESTED, cell),
        confirmZoneName: (label) =>
            game.events.emit(EDITOR_EVENTS.ZONE_NAME_CONFIRMED, label),
        cancelZoneName: () =>
            game.events.emit(EDITOR_EVENTS.ZONE_NAME_CANCELLED),
        captureThumbnail: () => {
            const scene = game.scene.getScene(EDITOR_SCENE_KEYS.EDITOR);
            if (!(scene instanceof EditorScene)) {
                return Promise.reject(
                    new Error(THUMBNAIL_MESSAGES.CAPTURE_FAILED)
                );
            }
            return scene.captureThumbnail();
        },
        captureNativeSnapshot: (rect) => {
            const scene = game.scene.getScene(EDITOR_SCENE_KEYS.EDITOR);
            if (!(scene instanceof EditorScene)) {
                return Promise.reject(
                    new Error(THUMBNAIL_MESSAGES.CAPTURE_FAILED)
                );
            }
            return scene.captureNativeSnapshot(rect);
        },
        destroy: () => {
            onSceneLost?.();
            game.events.off(
                EDITOR_EVENTS.ZONE_NAME_REQUESTED,
                handleZoneNameRequested
            );
            game.events.off(
                EDITOR_EVENTS.ZONE_NAME_CLOSED,
                handleZoneNameClosed
            );
            game.events.off(EDITOR_EVENTS.ZOOM_CHANGED, handleZoomChanged);
            game.events.off(EDITOR_EVENTS.SCENE_READY, handleSceneReady);
            game.events.off(EDITOR_EVENTS.CELL_HOVERED, onHoverCell);
            if (onHint) game.events.off(EDITOR_EVENTS.HINT_CHANGED, onHint);
            if (onSelectionAnchor) {
                game.events.off(
                    EDITOR_EVENTS.SELECTION_ANCHOR_CHANGED,
                    onSelectionAnchor
                );
            }
            if (onZoneAnchor) {
                game.events.off(
                    EDITOR_EVENTS.ZONE_ANCHOR_CHANGED,
                    onZoneAnchor
                );
            }
            unbindResize();
            destroyGameWhenReady(game);
        },
    };
};

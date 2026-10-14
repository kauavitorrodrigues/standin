import Phaser from "phaser";
import {
    buildTilemap,
    ensureAssetTextures,
    loadMapAssets,
    registerAssetAnimations,
    renderObjectLayers,
    renderTileLayers,
} from "@/features/game/renderers";
import { EDITOR_EVENTS } from "@/features/editor/consts/events";
import { EDITOR_SCENE_KEYS } from "@/features/editor/consts/scene-keys";
import { captureMapThumbnail } from "@/features/editor/lib/captureMapThumbnail";
import { captureNativeSnapshot } from "@/features/editor/lib/captureNativeSnapshot";
import type { TileRect } from "@/features/editor/types/tile-rect";
import { showsCellHighlight } from "@/features/editor/utils/showsCellHighlight";
import { CellHighlight } from "@/features/editor/lib/CellHighlight";
import { EditorCameraController } from "@/features/editor/lib/EditorCameraController";
import type { DraftStore } from "@/features/editor/lib/DraftStore";
import type { EditorStore } from "@/features/editor/lib/EditorStore";
import { EditorToolRouter } from "@/features/editor/lib/EditorToolRouter";
import { EditorObjectRenderer } from "@/features/editor/lib/EditorObjectRenderer";
import { EditorTileRenderer } from "@/features/editor/lib/EditorTileRenderer";
import { GridOverlay } from "@/features/editor/lib/GridOverlay";
import { SelectionAnchorTracker } from "@/features/editor/lib/SelectionAnchorTracker";
import { SelectionOverlay } from "@/features/editor/lib/SelectionOverlay";
import { FrameController } from "@/features/editor/lib/FrameController";
import { FrameOverlay } from "@/features/editor/lib/FrameOverlay";
import { isEditable } from "@/features/editor/utils/isEditable";
import type { FrameConfig } from "@/features/editor/types/FrameConfig";
import { ZoneOverlay } from "@/features/editor/lib/ZoneOverlay";
import { TOOL_REGISTRY } from "@/features/editor/consts/toolRegistry";
import { bindEditorCameraInput } from "@/features/editor/utils/bindEditorCameraInput";
import { bindToolInput } from "@/features/editor/utils/bindToolInput";
import { getHoverCell } from "@/features/editor/utils/getHoverCell";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";
import type {
    AssetDefinition,
    Cell,
    CellDiff,
    MapLayout,
    PlacedAsset,
    Tileset,
} from "@standin/contracts";
import type { GameMapData } from "@/features/game/types/tilemap";
import type { EditorSceneInitData } from "@/features/editor/types/editor";
import type {
    ThumbnailDrawable,
    ThumbnailSize,
} from "@/features/editor/types/thumbnail";
import { THUMBNAIL_MESSAGES } from "@/features/editor/consts/messages";

// Draws the map for editing: no avatar, no player physics, no interaction and
// no camera that follows anyone. It reads the store directly and tells React
// only about discrete changes, through `game.events`.
export class EditorScene extends Phaser.Scene {
    private mapData!: GameMapData;
    private store!: EditorStore;
    private draftStore!: DraftStore;
    private frameConfig: FrameConfig | null = null;
    private toolRouter: EditorToolRouter | null = null;
    private objectRenderer: EditorObjectRenderer | null = null;
    private tileRenderer: EditorTileRenderer | null = null;
    private zoneOverlay: ZoneOverlay | null = null;
    private selectionOverlay: SelectionOverlay | null = null;
    private anchorTracker: SelectionAnchorTracker | null = null;
    private frameOverlay: FrameOverlay | null = null;
    private mapSizePx: ThumbnailSize = { width: 0, height: 0 };

    constructor() {
        super({ key: EDITOR_SCENE_KEYS.EDITOR });
    }

    init(data: EditorSceneInitData): void {
        this.mapData = data.map;
        this.store = data.store;
        this.draftStore = data.draftStore;
        this.frameConfig = data.frame ?? null;
    }

    preload(): void {
        loadMapAssets(this.load, this.mapData);
    }

    create(): void {
        const { tilemap, tilesets } = buildTilemap(this, this.mapData);
        this.mapSizePx = {
            width: tilemap.widthInPixels,
            height: tilemap.heightInPixels,
        };

        const assets = this.mapData.assets ?? [];
        ensureAssetTextures(this.textures, assets);
        registerAssetAnimations(this, assets);

        const tileLayers = renderTileLayers(tilemap, tilesets);
        renderObjectLayers(this, tilemap);

        this.tileRenderer = new EditorTileRenderer(
            this,
            tilemap,
            tileLayers,
            this.mapData.id,
            this.mapData.layout as unknown as MapLayout
        );
        this.objectRenderer = new EditorObjectRenderer(
            this,
            assets,
            tilemap.heightInPixels
        );
        this.objectRenderer.sync(this.mapData.placed ?? []);
        this.zoneOverlay = new ZoneOverlay(this, this.store);
        this.selectionOverlay = new SelectionOverlay(
            this,
            this.store,
            this.draftStore
        );
        this.anchorTracker = new SelectionAnchorTracker(
            this,
            this.store,
            this.draftStore,
            (anchor) =>
                this.game.events.emit(
                    EDITOR_EVENTS.SELECTION_ANCHOR_CHANGED,
                    anchor
                )
        );
        this.setZones(this.mapData.layout as unknown as MapLayout);

        const camera = new EditorCameraController(
            this.cameras.main,
            tilemap.widthInPixels,
            tilemap.heightInPixels,
            this.store.getState().zoom,
            (zoom) => this.game.events.emit(EDITOR_EVENTS.ZOOM_CHANGED, zoom)
        );
        const grid = new GridOverlay(
            this,
            tilemap.widthInPixels,
            tilemap.heightInPixels
        );
        const highlight = new CellHighlight(this);
        let hoveredCell: Cell | null = null;

        const refreshHighlight = () => {
            const visible = showsCellHighlight(this.store.getState().tool);
            if (hoveredCell && visible) highlight.show(hoveredCell);
            else highlight.hide();
        };

        const updateHover = (pointer: Phaser.Input.Pointer) => {
            const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const cell = getHoverCell({
                worldX: world.x,
                worldY: world.y,
                columns: tilemap.width,
                rows: tilemap.height,
            });
            const sameCell =
                cell?.[0] === hoveredCell?.[0] &&
                cell?.[1] === hoveredCell?.[1];
            if (sameCell) return;

            hoveredCell = cell;
            refreshHighlight();
            this.game.events.emit(EDITOR_EVENTS.CELL_HOVERED, cell);
        };

        // The camera only applies a move or a zoom, and clamps it to its
        // bounds, when it draws. Until then its scroll and its matrix disagree
        // and a point read from it lands on the wrong cell. So the cell under
        // the pointer is read after the draw, once per frame, from the last
        // place the pointer was.
        let hoverPointer: Phaser.Input.Pointer | null = null;
        const refreshHoverAfterDraw = (pointer: Phaser.Input.Pointer) => {
            const scheduled = hoverPointer !== null;
            hoverPointer = pointer;
            if (scheduled) return;

            this.events.once(Phaser.Scenes.Events.RENDER, () => {
                const latest = hoverPointer;
                hoverPointer = null;
                if (latest) updateHover(latest);
            });
        };

        const clearHover = () => {
            if (!hoveredCell) return;
            hoveredCell = null;
            highlight.hide();
            this.game.events.emit(EDITOR_EVENTS.CELL_HOVERED, null);
        };

        const syncWithStore = () => {
            const { zoom, gridVisible, layerVisibility } =
                this.store.getState();
            grid.setVisible(gridVisible);
            refreshHighlight();
            camera.setZoom(zoom);
            this.tileRenderer?.setLayersVisible(layerVisibility);
        };

        const handleResize = () => camera.handleViewResize();
        const handleFit = () => camera.fit();
        const handleFocusCell = (cell: Cell) => camera.focusCell(cell);

        camera.refreshBounds();
        camera.fit();
        grid.setVisible(this.store.getState().gridVisible);
        this.tileRenderer?.setLayersVisible(
            this.store.getState().layerVisibility
        );

        const frameController = this.createFrame(tilemap.width, tilemap.height);

        const panState = { spaceHeld: false };
        const unbindInput = bindEditorCameraInput(
            this,
            camera,
            this.store,
            panState
        );
        this.toolRouter = new EditorToolRouter({
            registry: TOOL_REGISTRY,
            source: bindToolInput(this),
            store: this.store,
            env: { scene: this, store: this.store },
            columns: tilemap.width,
            rows: tilemap.height,
            interceptor: frameController ?? undefined,
            isSpaceHeld: () => panState.spaceHeld,
            getModel: () => this.draftStore.getState().draft,
            dispatch: this.draftStore.dispatchGesture,
            onHint: (text) =>
                this.game.events.emit(EDITOR_EVENTS.HINT_CHANGED, text),
        });
        const unsubscribeStore = this.store.subscribe(syncWithStore);

        this.input.on(Phaser.Input.Events.POINTER_MOVE, refreshHoverAfterDraw);
        this.input.on(Phaser.Input.Events.POINTER_WHEEL, refreshHoverAfterDraw);
        this.input.on(Phaser.Input.Events.GAME_OUT, clearHover);
        this.scale.on(Phaser.Scale.Events.RESIZE, handleResize);
        this.game.events.on(EDITOR_EVENTS.FIT_REQUESTED, handleFit);
        this.game.events.on(
            EDITOR_EVENTS.FOCUS_CELL_REQUESTED,
            handleFocusCell
        );

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.toolRouter?.destroy();
            this.toolRouter = null;
            unbindInput();
            unsubscribeStore();
            frameController?.destroy();
            this.frameOverlay?.destroy();
            this.frameOverlay = null;
            this.input.off(
                Phaser.Input.Events.POINTER_MOVE,
                refreshHoverAfterDraw
            );
            this.input.off(
                Phaser.Input.Events.POINTER_WHEEL,
                refreshHoverAfterDraw
            );
            this.input.off(Phaser.Input.Events.GAME_OUT, clearHover);
            this.scale.off(Phaser.Scale.Events.RESIZE, handleResize);
            this.game.events.off(EDITOR_EVENTS.FIT_REQUESTED, handleFit);
            this.game.events.off(
                EDITOR_EVENTS.FOCUS_CELL_REQUESTED,
                handleFocusCell
            );
            grid.destroy();
            highlight.destroy();
            this.objectRenderer?.destroy();
            this.zoneOverlay?.destroy();
            this.selectionOverlay?.destroy();
            this.selectionOverlay = null;
            this.anchorTracker?.destroy();
            this.anchorTracker = null;
            this.objectRenderer = null;
            this.tileRenderer = null;
            this.zoneOverlay = null;
        });

        this.game.events.emit(EDITOR_EVENTS.SCENE_READY);
    }

    // The frame of an area, when the shell asked for one: its overlay and the
    // controller that drags it.
    private createFrame(columns: number, rows: number): FrameController | null {
        const config = this.frameConfig;
        if (!config) return null;

        this.frameOverlay = new FrameOverlay(
            this,
            config.store,
            this.draftStore,
            columns,
            rows
        );
        return new FrameController({
            scene: this,
            store: config.store,
            limits: config.limits,
            columns,
            rows,
            isEditable: () => isEditable(this.store.getState()),
            onHint: (text) =>
                this.game.events.emit(EDITOR_EVENTS.HINT_CHANGED, text),
        });
    }

    // Brings the drawn objects to `placed`, touching only the ones that
    // changed. `assets` are the definitions of any asset not in the map yet.
    syncObjects(
        placed: readonly PlacedAsset[],
        assets: readonly AssetDefinition[] = [],
        options: { animate?: boolean } = {}
    ): void {
        this.objectRenderer?.setAssets(assets);
        this.objectRenderer?.sync(placed, options);
    }

    // Puts and removes the tiles of a diff on the layers that have them.
    applyTileDiff(diff: readonly CellDiff[]): Promise<void> {
        return this.tileRenderer?.applyTileDiff(diff) ?? Promise.resolve();
    }

    // Brings the tile layers to `layout` through the diff against the last
    // layout drawn. `library` supplies the image of a tileset added by it.
    syncTiles(
        layout: MapLayout,
        library: readonly Tileset[] = []
    ): Promise<void> {
        return (
            this.tileRenderer?.syncTiles(layout, library) ?? Promise.resolve()
        );
    }

    // The whole map as a PNG, whatever the zoom and the camera. Only tiles and
    // objects are drawn, so the grid, the highlight and the zones stay out.
    captureThumbnail(): Promise<Blob> {
        return this.captureWith(captureMapThumbnail);
    }

    // The same picture at the exact size of the map, without scaling. With a
    // rectangle in tiles, only that region, also at native resolution.
    captureNativeSnapshot(rect?: TileRect): Promise<Blob> {
        return this.captureWith((scene, drawables, mapSize) =>
            captureNativeSnapshot(scene, drawables, mapSize, rect)
        );
    }

    private async captureWith(
        capture: (
            scene: Phaser.Scene,
            drawables: readonly ThumbnailDrawable[],
            mapSize: ThumbnailSize
        ) => Promise<Blob>
    ): Promise<Blob> {
        const tileRenderer = this.tileRenderer;
        const objectRenderer = this.objectRenderer;
        if (!tileRenderer || !objectRenderer) {
            throw new Error(THUMBNAIL_MESSAGES.CAPTURE_FAILED);
        }

        await tileRenderer.settled();
        await objectRenderer.settled();

        // The photo shows every layer, whatever the user hid to work.
        tileRenderer.setLayersVisible({});
        try {
            return await capture(
                this,
                [...tileRenderer.getLayers(), ...objectRenderer.getDisplays()],
                this.mapSizePx
            );
        } finally {
            tileRenderer.setLayersVisible(
                this.store.getState().layerVisibility
            );
        }
    }

    setZones(layout: MapLayout): void {
        this.zoneOverlay?.setZones(getLayoutZones(layout));
    }

    setZonesVisible(visible: boolean): void {
        this.zoneOverlay?.setVisible(visible);
    }
}

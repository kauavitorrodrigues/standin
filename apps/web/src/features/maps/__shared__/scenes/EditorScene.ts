import Phaser from "phaser";
import {
    buildTilemap,
    ensureAssetTextures,
    loadMapAssets,
    registerAssetAnimations,
    renderObjectLayers,
    renderTileLayers,
} from "@/features/game/renderers";
import { EDITOR_EVENTS } from "@/features/maps/__shared__/consts/events";
import { EDITOR_SCENE_KEYS } from "@/features/maps/__shared__/consts/scene-keys";
import { captureMapThumbnail } from "@/features/maps/__shared__/lib/captureMapThumbnail";
import { showsCellHighlight } from "@/features/maps/__shared__/utils/showsCellHighlight";
import { CellHighlight } from "@/features/maps/__shared__/lib/CellHighlight";
import { EditorCameraController } from "@/features/maps/__shared__/lib/EditorCameraController";
import type { DraftStore } from "@/features/maps/__shared__/lib/DraftStore";
import type { EditorStore } from "@/features/maps/__shared__/lib/EditorStore";
import { EditorToolRouter } from "@/features/maps/__shared__/lib/EditorToolRouter";
import { EditorObjectRenderer } from "@/features/maps/__shared__/lib/EditorObjectRenderer";
import { EditorTileRenderer } from "@/features/maps/__shared__/lib/EditorTileRenderer";
import { GridOverlay } from "@/features/maps/__shared__/lib/GridOverlay";
import { SelectionAnchorTracker } from "@/features/maps/__shared__/lib/SelectionAnchorTracker";
import { SelectionOverlay } from "@/features/maps/__shared__/lib/SelectionOverlay";
import { ZoneOverlay } from "@/features/maps/__shared__/lib/ZoneOverlay";
import { TOOL_REGISTRY } from "@/features/maps/__shared__/consts/toolRegistry";
import { bindEditorCameraInput } from "@/features/maps/__shared__/utils/bindEditorCameraInput";
import { bindToolInput } from "@/features/maps/__shared__/utils/bindToolInput";
import { getHoverCell } from "@/features/maps/__shared__/utils/getHoverCell";
import { getLayoutZones } from "@/features/maps/__shared__/utils/getLayoutZones";
import type {
    AssetDefinition,
    Cell,
    CellDiff,
    MapLayout,
    PlacedAsset,
    Tileset,
} from "@standin/contracts";
import type { GameMapData } from "@/features/game/types/tilemap";
import type { EditorSceneInitData } from "@/features/maps/__shared__/types/editor";
import type { ThumbnailSize } from "@/features/maps/__shared__/types/thumbnail";
import { THUMBNAIL_MESSAGES } from "@/features/maps/__shared__/consts/messages";

// Draws the map for editing: no avatar, no player physics, no interaction and
// no camera that follows anyone. It reads the store directly and tells React
// only about discrete changes, through `game.events`.
export class EditorScene extends Phaser.Scene {
    private mapData!: GameMapData;
    private store!: EditorStore;
    private draftStore!: DraftStore;
    private toolRouter: EditorToolRouter | null = null;
    private objectRenderer: EditorObjectRenderer | null = null;
    private tileRenderer: EditorTileRenderer | null = null;
    private zoneOverlay: ZoneOverlay | null = null;
    private selectionOverlay: SelectionOverlay | null = null;
    private anchorTracker: SelectionAnchorTracker | null = null;
    private mapSizePx: ThumbnailSize = { width: 0, height: 0 };

    constructor() {
        super({ key: EDITOR_SCENE_KEYS.EDITOR });
    }

    init(data: EditorSceneInitData): void {
        this.mapData = data.map;
        this.store = data.store;
        this.draftStore = data.draftStore;
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
    async captureThumbnail(): Promise<Blob> {
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
            return await captureMapThumbnail(
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

import type Phaser from "phaser";
import { cellToWorld, TILE_SIZE } from "@standin/contracts";
import type { Cell, ZoomLevel } from "@standin/contracts";
import { EDITOR_ZOOM_DIRECTIONS } from "@/features/editor/consts/camera";
import { getCameraBounds } from "@/features/editor/utils/getCameraBounds";
import { getFitZoom } from "@/features/editor/utils/getFitZoom";
import { clampZoom } from "@/features/editor/utils/clampZoom";
import { getNextZoom } from "@/features/editor/utils/getNextZoom";

// Moves and zooms the camera of the editor. The zoom stays between the first
// and the last level. It tells whoever listens each time the zoom is applied.
export class EditorCameraController {
    private readonly camera: Phaser.Cameras.Scene2D.Camera;
    private readonly mapWidth: number;
    private readonly mapHeight: number;
    private readonly onZoomChange: (zoom: ZoomLevel) => void;
    private readonly marginTiles: number | undefined;
    private zoom: ZoomLevel;
    private viewWidth: number;
    private viewHeight: number;

    constructor(
        camera: Phaser.Cameras.Scene2D.Camera,
        mapWidth: number,
        mapHeight: number,
        initialZoom: ZoomLevel,
        onZoomChange: (zoom: ZoomLevel) => void,
        marginTiles?: number
    ) {
        this.marginTiles = marginTiles;
        this.camera = camera;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.zoom = initialZoom;
        this.onZoomChange = onZoomChange;
        this.viewWidth = camera.width;
        this.viewHeight = camera.height;
    }

    getZoom(): ZoomLevel {
        return this.zoom;
    }

    setZoom(zoom: ZoomLevel): void {
        if (zoom === this.zoom) return;
        this.applyZoom(zoom);
    }

    zoomIn(): void {
        this.setZoom(getNextZoom(this.zoom, EDITOR_ZOOM_DIRECTIONS.IN));
    }

    zoomOut(): void {
        this.setZoom(getNextZoom(this.zoom, EDITOR_ZOOM_DIRECTIONS.OUT));
    }

    /**
     * Multiplies the zoom by a factor keeping the point of the map under the
     * given screen position (px of the view) where it is, so the zoom goes
     * toward the pointer.
     */
    zoomAt(factor: number, screenX: number, screenY: number): void {
        const next = clampZoom(this.zoom * factor);
        if (next === this.zoom) return;

        const halfWidth = this.camera.width / 2;
        const halfHeight = this.camera.height / 2;
        const worldX =
            this.camera.scrollX + halfWidth + (screenX - halfWidth) / this.zoom;
        const worldY =
            this.camera.scrollY +
            halfHeight +
            (screenY - halfHeight) / this.zoom;

        this.applyZoom(next);
        this.camera.scrollX = worldX - halfWidth - (screenX - halfWidth) / next;
        this.camera.scrollY =
            worldY - halfHeight - (screenY - halfHeight) / next;
    }

    /**
     * Uses the largest zoom where the target fits and centers it. The target is
     * the whole map, or a rectangle of it (world px) such as the frame of an area.
     */
    fit(
        target?: { x: number; y: number; width: number; height: number },
        padding: { x: number; y: number } = { x: 0, y: 0 }
    ): void {
        const area = target ?? {
            x: 0,
            y: 0,
            width: this.mapWidth,
            height: this.mapHeight,
        };
        this.applyZoom(
            getFitZoom({
                mapWidth: area.width,
                mapHeight: area.height,
                viewWidth: this.camera.width,
                viewHeight: this.camera.height,
                paddingX: padding.x,
                paddingY: padding.y,
            })
        );
        this.camera.centerOn(area.x + area.width / 2, area.y + area.height / 2);
    }

    /** Centers the view on a cell, keeping the zoom. The bounds still apply. */
    focusCell(cell: Cell): void {
        const [worldX, worldY] = cellToWorld(cell[0], cell[1]);
        this.camera.centerOn(worldX + TILE_SIZE / 2, worldY + TILE_SIZE / 2);
    }

    /** Moves the view by a distance in screen px. The bounds keep it inside the map. */
    panBy(screenX: number, screenY: number): void {
        this.camera.scrollX += screenX / this.zoom;
        this.camera.scrollY += screenY / this.zoom;
    }

    /** Recalculates what the camera may show. Call it when the view changes size. */
    refreshBounds(): void {
        const bounds = getCameraBounds({
            mapWidth: this.mapWidth,
            mapHeight: this.mapHeight,
            viewWidth: this.camera.width,
            viewHeight: this.camera.height,
            zoom: this.zoom,
            marginTiles: this.marginTiles,
        });

        this.camera.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    /**
     * Keeps the point of the map at the center of the view where it is when
     * the view changes size, so the map stays centered in what is visible,
     * then recalculates the bounds.
     */
    handleViewResize(): void {
        this.camera.scrollX -= (this.camera.width - this.viewWidth) / 2;
        this.camera.scrollY -= (this.camera.height - this.viewHeight) / 2;
        this.viewWidth = this.camera.width;
        this.viewHeight = this.camera.height;
        this.refreshBounds();
    }

    private applyZoom(zoom: ZoomLevel): void {
        this.zoom = zoom;
        this.camera.setZoom(zoom);
        this.refreshBounds();
        this.onZoomChange(zoom);
    }
}

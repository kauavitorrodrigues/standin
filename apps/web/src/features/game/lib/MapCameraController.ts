import type Phaser from "phaser";
import { MAP_CAMERA_CONFIG } from "@/features/game/consts/camera";
import { resolveClampedZoom } from "@/features/game/utils/zoom";
import type { CameraState } from "@/features/game/types/game";

export class MapCameraController {
    
    private readonly camera: Phaser.Cameras.Scene2D.Camera;
    private readonly mapWidth: number;
    private readonly mapHeight: number;
    private readonly onStateChange: (state: CameraState) => void;
    private followOffsetXPixels: number = MAP_CAMERA_CONFIG.NO_HORIZONTAL_FOLLOW_OFFSET;
    private isFollowing = false;

    constructor(
        camera: Phaser.Cameras.Scene2D.Camera,
        mapWidth: number,
        mapHeight: number,
        onStateChange: (state: CameraState) => void
    ) {
        this.camera = camera;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.onStateChange = onStateChange;
    }

    zoomIn(): void {
        this.applyZoomDelta(MAP_CAMERA_CONFIG.ZOOM_STEP);
    }

    zoomOut(): void {
        this.applyZoomDelta(-MAP_CAMERA_CONFIG.ZOOM_STEP);
    }

    getState(): CameraState {
        return this.resolveState(this.camera.zoom);
    }

    follow(
        target: Phaser.GameObjects.GameObject,
        offsetXPixels: number = MAP_CAMERA_CONFIG.NO_HORIZONTAL_FOLLOW_OFFSET
    ): void {
        this.followOffsetXPixels = offsetXPixels;
        this.isFollowing = true;
        this.camera.startFollow(
            target,
            MAP_CAMERA_CONFIG.FOLLOW_ROUND_PIXELS,
            MAP_CAMERA_CONFIG.FOLLOW_LERP,
            MAP_CAMERA_CONFIG.FOLLOW_LERP,
            this.resolveFollowOffsetX(),
            MAP_CAMERA_CONFIG.NO_VERTICAL_FOLLOW_OFFSET
        );
        this.onStateChange(this.resolveState(this.camera.zoom));
    }

    /** Re-engages follow on the same target, keeping whatever offset was last set via `follow()`. */
    recenterOn(target: Phaser.GameObjects.GameObject): void {
        this.follow(target, this.followOffsetXPixels);
    }

    stopFollow(): void {
        if (!this.isFollowing) return;

        this.isFollowing = false;
        this.camera.stopFollow();
        this.onStateChange(this.resolveState(this.camera.zoom));
    }

    pan(deltaX: number, deltaY: number): void {
        this.camera.scrollX -= deltaX / this.camera.zoom;
        this.camera.scrollY -= deltaY / this.camera.zoom;
    }

    /** Applies the boot-time zoom: the larger of the configured default and the cover zoom. */
    applyInitialZoom(): void {
        this.setZoomWithinBounds(
            Math.max(MAP_CAMERA_CONFIG.DEFAULT_ZOOM, this.resolveCoverZoom())
        );
    }

    /**
     * Re-applies the zoom needed for the map to always cover the current
     * viewport (never leaving empty margins). Only ever grows the zoom from
     * whatever the user currently has set, safe to call on every resize.
     */
    fitToViewport(): void {
        this.setZoomWithinBounds(
            Math.max(this.camera.zoom, this.resolveCoverZoom())
        );
    }

    private resolveCoverZoom(): number {
        return Math.max(
            this.camera.width / this.mapWidth,
            this.camera.height / this.mapHeight
        );
    }

    private resolveMinZoom(): number {
        return Math.max(MAP_CAMERA_CONFIG.MIN_ZOOM, this.resolveCoverZoom());
    }

    private resolveMaxZoom(): number {
        return Math.max(
            MAP_CAMERA_CONFIG.MAX_ZOOM,
            this.resolveCoverZoom() + MAP_CAMERA_CONFIG.ZOOM_STEP
        );
    }

    private resolveState(zoom: number): CameraState {
        return {
            canZoomIn: zoom < this.resolveMaxZoom(),
            canZoomOut: zoom > this.resolveMinZoom(),
            isFollowingPlayer: this.isFollowing,
        };
    }

    private setZoomWithinBounds(preferredZoom: number): void {
        const targetZoom = resolveClampedZoom(
            preferredZoom,
            MAP_CAMERA_CONFIG.NO_ZOOM_DELTA,
            this.resolveMinZoom(),
            this.resolveMaxZoom()
        );

        this.camera.setZoom(targetZoom);
        this.camera.followOffset.x = this.resolveFollowOffsetX();
        this.onStateChange(this.resolveState(targetZoom));
    }

    private resolveFollowOffsetX(): number {
        return -this.followOffsetXPixels / this.camera.zoom;
    }

    private applyZoomDelta(delta: number): void {
        const targetZoom = resolveClampedZoom(
            this.camera.zoom,
            delta,
            this.resolveMinZoom(),
            this.resolveMaxZoom()
        );

        this.camera.zoomTo(targetZoom, MAP_CAMERA_CONFIG.ZOOM_TWEEN_DURATION_MS);
        this.camera.followOffset.x = -this.followOffsetXPixels / targetZoom;
        this.onStateChange(this.resolveState(targetZoom));
    }
}

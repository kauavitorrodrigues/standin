import type Phaser from "phaser";
import { AVATAR } from "@standin/contracts";
import { MAP_CAMERA_CONFIG } from "@/features/game/consts/camera";
import { cameraZoomPreference } from "@/features/game/lib/cameraZoomPreference";
import { resolveClampedZoom } from "@/features/game/utils/zoom";
import { snapToScreenPixel } from "@/features/game/utils/snapToScreenPixel";
import type { CameraState } from "@/features/game/types/game";

// The followed point is the feet of the avatar. The view centers on the middle
// of the visible body instead, so the body sits in the middle and not the feet.
// The offset is in world px, so it does not change with the zoom.
const FOLLOW_OFFSET_Y = AVATAR.visible.h / 2;

// What Phaser keeps on the camera that its typings leave out.
type RoundingCamera = Phaser.Cameras.Scene2D.Camera & {
    renderRoundPixels: boolean;
    clampX: (x: number) => number;
    clampY: (y: number) => number;
};

type Scroll = { x: number; y: number };

export class MapCameraController {
    private readonly camera: Phaser.Cameras.Scene2D.Camera;
    private readonly mapWidth: number;
    private readonly mapHeight: number;
    private readonly onStateChange: (state: CameraState) => void;
    private followOffsetXPixels: number =
        MAP_CAMERA_CONFIG.NO_HORIZONTAL_FOLLOW_OFFSET;
    private isFollowing = false;
    // Where the running zoom tween is heading. Each wheel tick builds on it and
    // not on the half-tweened camera zoom, so fast scrolling adds up.
    private targetZoom: number | null = null;
    // The scroll Phaser worked out in the last frame, before it was moved to a
    // screen px, and the one it was moved to. When the camera still shows the
    // second at the start of a frame, nobody moved it, and the first is what the
    // frame must start from: otherwise a drag of less than a screen px per
    // frame would be rounded away each time and never go anywhere.
    private exactScroll: Scroll = { x: 0, y: 0 };
    private snappedScroll: Scroll = { x: Number.NaN, y: Number.NaN };

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
        this.snapScrollToScreenPixels();
    }

    // Phaser floors the scroll of a camera with `roundPixels` to whole world px,
    // and at a high zoom that is a step of several screen px, so the avatar
    // shakes against the floor as it walks. The scroll is moved to whole screen
    // px instead, after Phaser has worked it out, and the drawing is still
    // snapped to whole px (`renderRoundPixels`) when the zoom is a whole number,
    // which keeps the pixel art sharp. The edges of the map win over the
    // rounding, so the view never goes past them.
    private snapScrollToScreenPixels(): void {
        const camera = this.camera as RoundingCamera;
        if (typeof camera.preRender !== "function") return;

        const preRender = camera.preRender.bind(camera);
        camera.preRender = () => {
            camera.scrollX = this.resumeFromExact(camera.scrollX, "x");
            camera.scrollY = this.resumeFromExact(camera.scrollY, "y");
            preRender();

            this.exactScroll = { x: camera.scrollX, y: camera.scrollY };
            let x = snapToScreenPixel(camera.scrollX, camera.zoomX);
            let y = snapToScreenPixel(camera.scrollY, camera.zoomY);
            if (camera.useBounds) {
                x = camera.clampX(x);
                y = camera.clampY(y);
            }
            camera.scrollX = x;
            camera.scrollY = y;
            this.snappedScroll = { x, y };
            camera.renderRoundPixels =
                Number.isInteger(camera.zoomX) &&
                Number.isInteger(camera.zoomY);
        };
    }

    // The scroll the frame starts from on one axis: the exact one of the last
    // frame if the camera still shows the one it was snapped to, and what the
    // camera shows if someone moved it since.
    private resumeFromExact(shown: number, axis: keyof Scroll): number {
        return shown === this.snappedScroll[axis]
            ? this.exactScroll[axis]
            : shown;
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
            FOLLOW_OFFSET_Y
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

    /** Centers the view on a point of the map and lets go of the player. */
    focusPoint(x: number, y: number, offsetXPixels = 0): void {
        this.stopFollow();
        this.camera.centerOn(x, y);
        this.camera.scrollX += offsetXPixels / this.camera.zoom;
    }

    pan(deltaX: number, deltaY: number): void {
        // Builds on the exact scroll and not on the snapped one the camera shows,
        // so a drag of a fraction of a screen px per frame adds up.
        const { camera } = this;
        camera.scrollX =
            this.resumeFromExact(camera.scrollX, "x") - deltaX / camera.zoom;
        camera.scrollY =
            this.resumeFromExact(camera.scrollY, "y") - deltaY / camera.zoom;
        // What the camera shows now is the drag's own value, not a snapped one.
        this.snappedScroll = { x: Number.NaN, y: Number.NaN };
    }

    /** Applies the boot-time zoom: the one the player left last time, else the larger of the configured default and the cover zoom. */
    applyInitialZoom(): void {
        this.setZoomWithinBounds(
            cameraZoomPreference.get() ??
                Math.max(
                    MAP_CAMERA_CONFIG.DEFAULT_ZOOM,
                    this.resolveCoverZoom()
                )
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

        this.targetZoom = null;
        this.camera.setZoom(targetZoom);
        this.camera.followOffset.x = this.resolveFollowOffsetX();
        this.onStateChange(this.resolveState(targetZoom));
    }

    private resolveFollowOffsetX(): number {
        return -this.followOffsetXPixels / this.camera.zoom;
    }

    private applyZoomDelta(delta: number): void {
        const targetZoom = resolveClampedZoom(
            this.targetZoom ?? this.camera.zoom,
            delta,
            this.resolveMinZoom(),
            this.resolveMaxZoom()
        );

        this.camera.zoomTo(
            targetZoom,
            MAP_CAMERA_CONFIG.ZOOM_TWEEN_DURATION_MS
        );
        this.camera.followOffset.x = -this.followOffsetXPixels / targetZoom;
        this.targetZoom = targetZoom;
        cameraZoomPreference.set(targetZoom);
        this.onStateChange(this.resolveState(targetZoom));
    }
}

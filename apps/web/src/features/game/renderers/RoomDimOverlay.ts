import Phaser from "phaser";
import type { GameRoom } from "@/features/game/types/room";
import { ROOM_DIM } from "@/features/game/consts/room-dim";
import { prefersReducedMotion } from "@/features/game/utils/prefersReducedMotion";
import { getRoomPolygonPoints } from "@/features/game/utils/roomDimGeometry";

type WorldBounds = { x: number; y: number; width: number; height: number };

// Darkens everything outside a room and leaves the room shape clear. It is a
// world sized RenderTexture filled with the veil and then erased where the
// room is, so the cutout edge is crisp and follows a rectangle or a polygon.
// The veil is static for a given room, so it is drawn once in show. Being in
// world space it follows the camera zoom and scroll with no extra math. The
// camera is bound to the map, so the veil covers everything visible. The
// bounds must fit the GPU texture limit.
export class RoomDimOverlay {
    private readonly layer: Phaser.GameObjects.RenderTexture;
    private readonly roomShape: Phaser.GameObjects.Graphics;
    private readonly bounds: WorldBounds;
    private room: GameRoom | null = null;
    private fade: Phaser.Tweens.Tween | null = null;
    private readonly scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, bounds: WorldBounds) {
        this.scene = scene;
        this.bounds = bounds;
        this.layer = scene.add
            .renderTexture(bounds.x, bounds.y, bounds.width, bounds.height)
            .setOrigin(0, 0)
            .setDepth(ROOM_DIM.DEPTH)
            .setAlpha(ROOM_DIM.HIDDEN_ALPHA)
            .setVisible(false);
        this.roomShape = scene.make.graphics({}, false);
    }

    show(room: GameRoom): void {
        this.room = room;
        this.redraw();
        this.layer.setVisible(true);
        this.fadeTo(ROOM_DIM.ALPHA, null);
    }

    hide(): void {
        this.fadeTo(ROOM_DIM.HIDDEN_ALPHA, () => {
            this.room = null;
            this.layer.setVisible(false);
        });
    }

    destroy(): void {
        this.fade?.stop();
        this.fade = null;
        this.layer.destroy();
        this.roomShape.destroy();
    }

    private fadeTo(alpha: number, onDone: (() => void) | null): void {
        this.fade?.stop();
        this.fade = null;
        if (prefersReducedMotion()) {
            this.layer.setAlpha(alpha);
            onDone?.();
            return;
        }
        this.fade = this.scene.tweens.add({
            targets: this.layer,
            alpha,
            duration: ROOM_DIM.FADE_DURATION_MS,
            onComplete: () => {
                this.fade = null;
                onDone?.();
            },
        });
    }

    private redraw(): void {
        if (this.room === null) return;
        const { x: originX, y: originY } = this.bounds;
        this.layer.clear();
        this.layer.fill(ROOM_DIM.COLOR, 1);
        this.drawRoomShape(this.room, originX, originY);
        this.layer.erase(this.roomShape);
    }

    private drawRoomShape(
        room: GameRoom,
        originX: number,
        originY: number
    ): void {
        const points = getRoomPolygonPoints(room).map(
            (point) =>
                new Phaser.Geom.Point(point.x - originX, point.y - originY)
        );
        this.roomShape.clear();
        this.roomShape.fillStyle(0xffffff, 1);
        this.roomShape.fillPoints(points, true);
    }
}

import type Phaser from "phaser";
import { TILE_SIZE, type DoorSlot } from "@standin/contracts";
import { DOOR_SLOT_OVERLAY } from "@/features/editor/consts/door-slots";
import type { DoorSlotOverlayView } from "@/features/editor/types/DoorSlotOverlayView";

// A pulsing rounded outline on every gap where the door being placed fits.
// It draws above the tiles and objects and below the ghost.
export class DoorSlotOverlay implements DoorSlotOverlayView {
    private readonly scene: Phaser.Scene;
    private graphics: Phaser.GameObjects.Graphics | null = null;
    private pulse: Phaser.Tweens.Tween | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    show(slots: readonly DoorSlot[]): void {
        this.stopPulse();
        if (slots.length === 0) {
            this.graphics?.setVisible(false);
            return;
        }

        const graphics =
            this.graphics ??
            this.scene.add.graphics().setDepth(DOOR_SLOT_OVERLAY.DEPTH);
        this.graphics = graphics;

        graphics.clear();
        graphics.fillStyle(
            DOOR_SLOT_OVERLAY.COLOR,
            DOOR_SLOT_OVERLAY.FILL_ALPHA
        );
        graphics.lineStyle(
            DOOR_SLOT_OVERLAY.STROKE_WIDTH,
            DOOR_SLOT_OVERLAY.COLOR,
            DOOR_SLOT_OVERLAY.STROKE_ALPHA
        );
        slots.forEach((slot) => {
            const x = slot.tileX * TILE_SIZE + DOOR_SLOT_OVERLAY.INSET;
            const y =
                (slot.tileY - slot.height + 1) * TILE_SIZE +
                DOOR_SLOT_OVERLAY.INSET;
            const width = slot.width * TILE_SIZE - DOOR_SLOT_OVERLAY.INSET * 2;
            const height =
                slot.height * TILE_SIZE - DOOR_SLOT_OVERLAY.INSET * 2;
            graphics.fillRoundedRect(
                x,
                y,
                width,
                height,
                DOOR_SLOT_OVERLAY.CORNER_RADIUS
            );
            graphics.strokeRoundedRect(
                x,
                y,
                width,
                height,
                DOOR_SLOT_OVERLAY.CORNER_RADIUS
            );
        });
        graphics.setVisible(true);
        this.startPulse(graphics);
    }

    hide(): void {
        this.stopPulse();
        this.graphics?.setVisible(false);
    }

    destroy(): void {
        this.stopPulse();
        this.graphics?.destroy();
        this.graphics = null;
    }

    private startPulse(graphics: Phaser.GameObjects.Graphics): void {
        graphics.setAlpha(DOOR_SLOT_OVERLAY.PULSE_MAX_ALPHA);
        this.pulse = this.scene.tweens.add({
            targets: graphics,
            alpha: DOOR_SLOT_OVERLAY.PULSE_MIN_ALPHA,
            duration: DOOR_SLOT_OVERLAY.PULSE_DURATION_MS,
            yoyo: true,
            repeat: -1,
        });
    }

    private stopPulse(): void {
        this.pulse?.stop();
        this.pulse = null;
    }
}

import Phaser from "phaser";
import { DESK_GUIDE } from "@/features/game/consts/desk-guide";
import type { HoverTarget } from "@/features/game/types/hover";
import { prefersReducedMotion } from "@/features/game/utils/prefersReducedMotion";

// Outlines the given desks with a soft pulse, to show where a desk can be
// claimed. It only draws; which desks are free is decided by the caller.
export class DeskGuideHighlight {
    private readonly graphics: Phaser.GameObjects.Graphics;
    private readonly scene: Phaser.Scene;
    private pulse: Phaser.Tweens.Tween | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.graphics = scene.add
            .graphics()
            .setDepth(DESK_GUIDE.DEPTH)
            .setVisible(false);
    }

    show(desks: readonly HoverTarget[]): void {
        this.graphics.clear();
        if (desks.length === 0) {
            this.hide();
            return;
        }

        const { PADDING, COLOR } = DESK_GUIDE;
        this.graphics.fillStyle(COLOR, DESK_GUIDE.FILL_ALPHA);
        this.graphics.lineStyle(
            DESK_GUIDE.LINE_WIDTH,
            COLOR,
            DESK_GUIDE.LINE_ALPHA
        );
        for (const { bounds } of desks) {
            const x = bounds.x - PADDING;
            const y = bounds.y - PADDING;
            const width = bounds.width + PADDING * 2;
            const height = bounds.height + PADDING * 2;
            this.graphics.fillRect(x, y, width, height);
            this.graphics.strokeRect(x, y, width, height);
        }
        this.graphics.setVisible(true);
        this.startPulse();
    }

    hide(): void {
        this.stopPulse();
        this.graphics.clear();
        this.graphics.setVisible(false);
    }

    destroy(): void {
        this.stopPulse();
        this.graphics.destroy();
    }

    private startPulse(): void {
        if (this.pulse || prefersReducedMotion()) return;

        this.pulse = this.scene.tweens.add({
            targets: this.graphics,
            alpha: DESK_GUIDE.PULSE_MIN_ALPHA,
            duration: DESK_GUIDE.PULSE_MS,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });
    }

    private stopPulse(): void {
        this.pulse?.remove();
        this.pulse = null;
        this.graphics.setAlpha(1);
    }
}

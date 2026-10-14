import Phaser from "phaser";
import { EDITOR_EVENTS } from "@/features/maps/__shared__/consts/events";
import type { ScreenRect } from "@/features/maps/__shared__/types/screen-rect";
import type { ZoneRect } from "@/features/maps/__shared__/types/zone-rect";
import { getZoneAnchor } from "@/features/maps/__shared__/utils/getZoneAnchor";
import { isSameScreenRect } from "@/features/maps/__shared__/utils/isSameScreenRect";

// Tells React where the tracked zone is on the screen, after each draw, so the
// bar over it follows the camera. It sends an event only when the place
// changed (a pan, a zoom, a resize of the zone or of the window) and never
// touches state: the listener writes to the DOM.
export class ZoneAnchorTracker {
    private readonly scene: Phaser.Scene;
    private rect: ZoneRect | null = null;
    private last: ScreenRect | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        scene.events.on(Phaser.Scenes.Events.RENDER, this.update);
    }

    // The zone to follow, or null to stop.
    track(rect: ZoneRect | null): void {
        this.rect = rect;
        this.update();
    }

    destroy(): void {
        this.scene.events?.off(Phaser.Scenes.Events.RENDER, this.update);
        this.rect = null;
        this.emit(null);
    }

    private update = (): void => {
        this.emit(this.rect ? this.measure(this.rect) : null);
    };

    private measure(rect: ZoneRect): ScreenRect {
        const camera = this.scene.cameras.main;
        return getZoneAnchor({
            rect,
            worldView: camera.worldView,
            zoom: camera.zoom,
            canvasBounds: this.scene.game.canvas.getBoundingClientRect(),
            displayScale: this.scene.scale.displayScale,
        });
    }

    private emit(anchor: ScreenRect | null): void {
        if (isSameScreenRect(anchor, this.last)) return;

        this.last = anchor;
        this.scene.game?.events.emit(EDITOR_EVENTS.ZONE_ANCHOR_CHANGED, anchor);
    }
}

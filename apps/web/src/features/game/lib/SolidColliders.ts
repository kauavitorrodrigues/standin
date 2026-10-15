import type Phaser from "phaser";
import type { SolidColliderPort } from "@/features/game/types/placed-sync";
import type { PlacedRect } from "@/features/game/utils/placed";

// The static bodies of the solid objects, one zone per rectangle of the
// footprint, kept by object id so a single object can be rebuilt or dropped
// without touching the others.
export class SolidColliders implements SolidColliderPort {
    private readonly scene: Phaser.Scene;
    private readonly group: Phaser.Physics.Arcade.StaticGroup;
    private readonly zonesById = new Map<string, Phaser.GameObjects.Zone[]>();

    constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.StaticGroup) {
        this.scene = scene;
        this.group = group;
    }

    set(id: string, rects: readonly PlacedRect[]): void {
        this.remove(id);
        if (rects.length === 0) return;

        const zones = rects.map(({ x, y, width, height }) => {
            const zone = this.scene.add.zone(
                x + width / 2,
                y + height / 2,
                width,
                height
            );
            this.scene.physics.add.existing(zone, true);
            this.group.add(zone);
            return zone;
        });
        this.zonesById.set(id, zones);
    }

    remove(id: string): void {
        this.zonesById
            .get(id)
            ?.forEach((zone) => this.group.remove(zone, true, true));
        this.zonesById.delete(id);
    }
}

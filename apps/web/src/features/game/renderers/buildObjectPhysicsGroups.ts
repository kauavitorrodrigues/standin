import type Phaser from "phaser";
import {
    resolveObjectRecords,
    type ResolvedObjectCenter,
} from "@/features/game/utils/map";
import { OBJECT_DATA_KEYS } from "@/features/game/consts/object-data-keys";

export type ObjectPhysicsGroups = {
    solidGroup: Phaser.Physics.Arcade.StaticGroup;
    interactableGroup: Phaser.Physics.Arcade.StaticGroup;
};

const createZoneAt = (
    scene: Phaser.Scene,
    center: ResolvedObjectCenter
): Phaser.GameObjects.Zone => {
    const zone = scene.add.zone(
        center.centerX,
        center.centerY,
        center.width,
        center.height
    );
    scene.physics.add.existing(zone, true);
    return zone;
};

export const buildObjectPhysicsGroups = (
    scene: Phaser.Scene,
    tilemap: Phaser.Tilemaps.Tilemap
): ObjectPhysicsGroups => {
    const solidGroup = scene.physics.add.staticGroup();
    const interactableGroup = scene.physics.add.staticGroup();

    resolveObjectRecords(tilemap).forEach(({ properties, center }) => {
        if (properties.solid) {
            solidGroup.add(createZoneAt(scene, center));
        }

        if (properties.interactable) {
            const zone = createZoneAt(scene, center);
            zone.setData(OBJECT_DATA_KEYS.PROPERTIES, properties);
            interactableGroup.add(zone);
        }
    });

    return { solidGroup, interactableGroup };
};

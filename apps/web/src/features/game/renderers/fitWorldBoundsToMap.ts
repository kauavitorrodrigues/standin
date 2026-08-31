import type Phaser from "phaser";
import { MAP_LAYER_ORIGIN } from "@/features/game/consts/map-geometry";

export const fitWorldBoundsToMap = (
    world: Phaser.Physics.Arcade.World,
    tilemap: Phaser.Tilemaps.Tilemap
): void => {
    world.setBounds(
        MAP_LAYER_ORIGIN.X,
        MAP_LAYER_ORIGIN.Y,
        tilemap.widthInPixels,
        tilemap.heightInPixels
    );
};

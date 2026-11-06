import Phaser from "phaser";
import { MAP_LAYER_ORIGIN } from "@/features/game/consts/map-geometry";
import { MAP_OUTER_AREA } from "@/features/game/consts/map-outer-area";

/**
 * What the view shows past the edge of the map: a flat color and a thin frame
 * on the edge of the map. The map is the whole area an avatar can walk, so the
 * frame is the only sign of where it ends. Nothing is drawn past it.
 */
export const renderMapOuterArea = (
    scene: Phaser.Scene,
    tilemap: Phaser.Tilemaps.Tilemap
): void => {
    const camera = scene.cameras.main;
    camera.setBackgroundColor(MAP_OUTER_AREA.COLOR);

    const frame = scene.add.graphics().setDepth(MAP_OUTER_AREA.FRAME_DEPTH);
    let drawnZoom = 0;

    // The width is in world px, so it follows the zoom to stay one screen px.
    const draw = (): void => {
        if (camera.zoom === drawnZoom) return;
        drawnZoom = camera.zoom;
        const width = MAP_OUTER_AREA.FRAME_WIDTH_PX / camera.zoom;
        frame
            .clear()
            .lineStyle(
                width,
                MAP_OUTER_AREA.FRAME_COLOR,
                MAP_OUTER_AREA.FRAME_ALPHA
            )
            // Just outside the map, so it never covers a tile.
            .strokeRect(
                MAP_LAYER_ORIGIN.X - width / 2,
                MAP_LAYER_ORIGIN.Y - width / 2,
                tilemap.widthInPixels + width,
                tilemap.heightInPixels + width
            );
    };

    draw();
    scene.events.on(Phaser.Scenes.Events.UPDATE, draw);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        scene.events.off(Phaser.Scenes.Events.UPDATE, draw);
    });
};

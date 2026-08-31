import type Phaser from "phaser";
import {
    getMapObjectMarkerColor,
    resolveObjectRecords,
    type ResolvedObjectRecord,
} from "@/features/game/utils/map";
import {
    MAP_OBJECT_MARKER_ALPHA,
    MAP_OBJECT_MARKER_DEPTH,
} from "@/features/game/consts/object-marker-styles";

const createObjectMarker = (
    scene: Phaser.Scene,
    { name, properties, center }: ResolvedObjectRecord
): Phaser.GameObjects.Rectangle | null => {
    if (!properties.interactable) return null;

    const marker = scene.add.rectangle(
        center.centerX,
        center.centerY,
        center.width,
        center.height,
        getMapObjectMarkerColor(properties.action)
    );
    marker.setAlpha(MAP_OBJECT_MARKER_ALPHA);
    marker.setDepth(MAP_OBJECT_MARKER_DEPTH);
    marker.setName(name);

    return marker;
};

export const renderObjectLayers = (
    scene: Phaser.Scene,
    tilemap: Phaser.Tilemaps.Tilemap
): Phaser.GameObjects.Rectangle[] =>
    resolveObjectRecords(tilemap)
        .map((record) => createObjectMarker(scene, record))
        .filter(
            (marker): marker is Phaser.GameObjects.Rectangle =>
                marker !== null
        );

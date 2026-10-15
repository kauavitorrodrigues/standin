import type Phaser from "phaser";
import { LAYOUT_ZONES_LAYER_NAME, type Zone } from "@standin/contracts";

type TiledProperty = { name: string; value: unknown };

const getProperty = (properties: unknown, name: string): unknown =>
    Array.isArray(properties)
        ? (properties as TiledProperty[]).find((entry) => entry.name === name)
              ?.value
        : undefined;

// The zones of the map, read from the `zones` object layer Phaser parsed.
// Objects without a `kind` are not zones.
export const readTilemapZones = (tilemap: Phaser.Tilemaps.Tilemap): Zone[] => {
    const objects = tilemap.getObjectLayer(LAYOUT_ZONES_LAYER_NAME)?.objects;
    if (!objects) return [];

    return objects.flatMap((object): Zone[] => {
        const kind = getProperty(object.properties, "kind");
        if (typeof kind !== "string") return [];

        const label = getProperty(object.properties, "label");
        const key = getProperty(object.properties, "key");
        return [
            {
                kind,
                x: object.x ?? 0,
                y: object.y ?? 0,
                width: object.width ?? 0,
                height: object.height ?? 0,
                polygon: object.polygon,
                label: typeof label === "string" ? label : undefined,
                key: typeof key === "string" ? key : undefined,
            },
        ];
    });
};

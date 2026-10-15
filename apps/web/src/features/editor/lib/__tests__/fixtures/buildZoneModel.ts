import {
    LAYOUT_ZONES_LAYER_NAME,
    TILE_SIZE,
    zoneToObject,
} from "@standin/contracts";
import type { EditorModel, MapLayout, Zone } from "@standin/contracts";
import { buildTileModel } from "@/features/editor/lib/__tests__/fixtures/buildTileModel";

type ZoneSpec = {
    id: number;
    kind: "spawn" | "area" | "private";
    x: number;
    y: number;
    w: number;
    h: number;
    label?: string;
    key?: string;
};

const toZone = ({ kind, x, y, w, h, label, key }: ZoneSpec): Zone => ({
    kind,
    x: x * TILE_SIZE,
    y: y * TILE_SIZE,
    width: w * TILE_SIZE,
    height: h * TILE_SIZE,
    label,
    key,
});

// A square map (tile layers empty) with a zones group holding these zones,
// positions and sizes in tiles.
export const buildZoneModel = (specs: ZoneSpec[], size = 10): EditorModel => {
    const model = buildTileModel({ size });
    const layout = model.layout as MapLayout;

    return {
        ...model,
        layout: {
            ...layout,
            nextobjectid: Math.max(0, ...specs.map(({ id }) => id)) + 1,
            layers: [
                ...layout.layers,
                {
                    id: 90,
                    type: "objectgroup",
                    name: LAYOUT_ZONES_LAYER_NAME,
                    x: 0,
                    y: 0,
                    visible: true,
                    opacity: 1,
                    objects: specs.map((spec) =>
                        zoneToObject(toZone(spec), spec.id)
                    ),
                },
            ],
        } as unknown as MapLayout,
    };
};

import { describe, expect, it } from "vitest";
import type { LibraryPalette } from "../../../../assets/types/library";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import { THIN_ID, buildLibrary } from "../../../layout/__tests__/thinWallKit";
import { applyEditorOp } from "../applyEditorOp";
import { buildBlankEditorModel } from "../buildBlankEditorModel";
import { buildStampOps } from "../buildStampOps";
import { captureStamp } from "../captureStamp";
import { tempIds } from "./stampTestKit";

const library = buildLibrary();
const palette = {
    tilesets: Object.values(library.tilesets).map(
        ({ id, tileCount, tileMeta }) => ({ id, tileCount, tileMeta })
    ),
    assets: [],
    categories: [],
    areas: [],
} as unknown as LibraryPalette;

const SIZE = 14;
const ROOM = { x: 2, y: 3, w: 6, h: 5 };

const buildRoomModel = () => {
    const blank = buildBlankEditorModel({
        width: SIZE,
        height: SIZE,
        library: palette,
    });
    const cells: [number, number][] = [];
    for (let x = ROOM.x; x < ROOM.x + ROOM.w; x++) {
        for (let y = ROOM.y; y < ROOM.y + ROOM.h; y++) {
            const onBorder =
                x === ROOM.x ||
                y === ROOM.y ||
                x === ROOM.x + ROOM.w - 1 ||
                y === ROOM.y + ROOM.h - 1;
            if (onBorder) cells.push([x, y]);
        }
    }
    const result = applyEditorOp(blank, {
        type: "paint",
        layer: "walls",
        tilesetId: THIN_ID,
        tileIndex: 0,
        cells,
    });
    if (!result.ok) throw new Error(JSON.stringify(result.errors));
    return result.model;
};

const readRect = (
    model: ReturnType<typeof buildRoomModel>,
    left: number,
    top: number
) => {
    const walls = findTileLayer(model.layout, "walls")!;
    return Array.from({ length: ROOM.h }, (_, dy) =>
        Array.from({ length: ROOM.w }, (_, dx) =>
            walls.data[(top + dy) * model.layout.width + left + dx] === 0
                ? 0
                : 1
        )
    );
};

describe("stamp of a room outlined with a thin wall style", () => {
    it("captures the outline and places it elsewhere with the same pieces", () => {
        const model = buildRoomModel();
        const captured = captureStamp(model, ROOM, { zoneLabel: "Sala" });
        if (!captured.ok) throw new Error(JSON.stringify(captured.errors));

        const target = buildBlankEditorModel({
            width: SIZE,
            height: SIZE,
            library: palette,
        });
        const placed = buildStampOps(target, captured.stamp, 7, 6, tempIds());
        if (!placed.ok) throw new Error(JSON.stringify(placed.errors));

        const from = findTileLayer(model.layout, "walls")!;
        const to = findTileLayer(placed.model.layout, "walls")!;
        for (let dy = 0; dy < ROOM.h; dy++) {
            for (let dx = 0; dx < ROOM.w; dx++) {
                const source =
                    from.data[(ROOM.y + dy) * SIZE + ROOM.x + dx] ?? 0;
                const copy = to.data[(6 + dy) * SIZE + 7 + dx] ?? 0;
                expect(copy).toBe(source);
            }
        }
        expect(readRect(placed.model, 7, 6)).toEqual(readRect(model, 2, 3));
    });

    it("leaves the cap of each facade out of the stamp, since the wall writes it again", () => {
        const model = buildRoomModel();
        const captured = captureStamp(model, ROOM, { zoneLabel: "Sala" });
        if (!captured.ok) throw new Error(JSON.stringify(captured.errors));

        const foreground = captured.stamp.layers.foreground;
        expect(foreground?.every((gid) => gid === 0) ?? true).toBe(true);
    });
});

import { describe, expect, it } from "vitest";
import {
    LAYOUT_ISSUE_CODES,
    TILE_CATEGORIES,
    WALL_PIECES,
    WALL_PIECE_EDGES,
    type WallPiece,
} from "@standin/contracts";
import { ROOM_WALLS_MESSAGES } from "@/features/editor/consts/room-walls";
import { describeWallIssue } from "@/features/editor/utils/describeWallIssue";
import {
    getRoomWallStyles,
    resolveRoomWallStyle,
    toWallStyleValue,
} from "@/features/editor/utils/getRoomWallStyles";

const ORDER: WallPiece[] = Object.values(WALL_PIECES);

const buildTileMeta = (style: string, skip: WallPiece[] = [], start = 0) =>
    Object.fromEntries(
        ORDER.flatMap((piece, offset) =>
            skip.includes(piece)
                ? []
                : [
                    [
                        String(start + offset),
                        {
                            category: TILE_CATEGORIES.WALL,
                            style,
                            edges: [...WALL_PIECE_EDGES[piece]],
                        },
                    ],
                ]
        )
    );

const buildLibrary = (tileMeta: ReturnType<typeof buildTileMeta>) => ({
    library: {
        tilesets: [{ id: "thin", tileMeta }],
    },
});

describe("getRoomWallStyles", () => {
    it("offers a complete style with the tile of its front wall", () => {
        const styles = getRoomWallStyles(
            buildLibrary(buildTileMeta("Azul")) as never
        );

        expect(styles).toEqual([
            {
                value: toWallStyleValue("thin", ORDER.indexOf("s")),
                label: "Azul",
                tilesetId: "thin",
                tileIndex: ORDER.indexOf("s"),
            },
        ]);
    });

    it("leaves an incomplete style out", () => {
        const styles = getRoomWallStyles(
            buildLibrary({
                ...buildTileMeta("Azul"),
                ...buildTileMeta("Cinza", [WALL_PIECES.NE], 20),
            }) as never
        );

        expect(styles.map(({ label }) => label)).toEqual(["Azul"]);
    });

    it("has no style in a library without walls", () => {
        expect(
            getRoomWallStyles({ library: { tilesets: [] } } as never)
        ).toEqual([]);
    });
});

describe("resolveRoomWallStyle", () => {
    const styles = [
        { value: "a|1", label: "A", tilesetId: "a", tileIndex: 1 },
        { value: "b|2", label: "B", tilesetId: "b", tileIndex: 2 },
    ];

    it("keeps the chosen style, or falls back to the first", () => {
        expect(resolveRoomWallStyle(styles, "b|2")?.label).toBe("B");
        expect(resolveRoomWallStyle(styles, "gone")?.label).toBe("A");
        expect(resolveRoomWallStyle([], undefined)).toBeNull();
    });
});

describe("describeWallIssue", () => {
    it("says why the walls were refused", () => {
        expect(
            describeWallIssue(LAYOUT_ISSUE_CODES.ROOM_TOO_SMALL_FOR_WALLS)
        ).toBe(ROOM_WALLS_MESSAGES.TOO_SMALL);
        expect(
            describeWallIssue(LAYOUT_ISSUE_CODES.WALL_SHAPE_UNSUPPORTED)
        ).toBe(ROOM_WALLS_MESSAGES.SHAPE_UNSUPPORTED);
        expect(
            describeWallIssue(LAYOUT_ISSUE_CODES.WALL_STYLE_INCOMPLETE)
        ).toBe(ROOM_WALLS_MESSAGES.STYLE_INCOMPLETE);
        expect(describeWallIssue(LAYOUT_ISSUE_CODES.OP_TOO_LARGE)).toBe(
            ROOM_WALLS_MESSAGES.FAILED
        );
    });
});

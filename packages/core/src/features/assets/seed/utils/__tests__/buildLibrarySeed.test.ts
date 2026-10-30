import { describe, expect, it } from "vitest";
import {
    LibrarySeedFilesMissingError,
    LibrarySeedFileSchema,
} from "@standin/contracts";
import { buildLibrarySeed } from "../buildLibrarySeed";
import { listSeedFilePaths } from "../listSeedFilePaths";

const parse = (library: object) => LibrarySeedFileSchema.parse(library);
const imageOf = (name: string) => Buffer.from(name);

const library = parse({
    tilesets: [{ key: "floor", name: "Floor", file: "floor.png" }],
    assets: [
        {
            key: "chair",
            name: "Chair",
            type: "CHAIR",
            footprint: { w: 1, h: 1 },
            file: "chair.png",
            variants: [{ key: "chair-2", file: "chair-2.png" }],
        },
    ],
});

describe("listSeedFilePaths", () => {
    it("lists each path once, including variants", () => {
        const repeated = parse({
            ...library,
            tilesets: [
                { key: "a", name: "A", file: "same.png" },
                { key: "b", name: "B", file: "same.png" },
            ],
        });

        expect(listSeedFilePaths(repeated)).toEqual([
            "same.png",
            "chair.png",
            "chair-2.png",
        ]);
    });
});

describe("buildLibrarySeed", () => {
    it("puts each image by the path written in the file", () => {
        const images = new Map(
            ["floor.png", "chair.png", "chair-2.png"].map((name) => [
                name,
                imageOf(name),
            ])
        );

        const seed = buildLibrarySeed(library, images);

        expect(seed.tilesets[0]!.image).toEqual(imageOf("floor.png"));
        expect(seed.assets[0]!.image).toEqual(imageOf("chair.png"));
        expect(seed.assets[0]!.variants![0]!.image).toEqual(
            imageOf("chair-2.png")
        );
    });

    it("lists every missing path together", () => {
        const images = new Map([["floor.png", imageOf("floor.png")]]);

        const build = () => buildLibrarySeed(library, images);

        expect(build).toThrow(LibrarySeedFilesMissingError);
        expect(build).toThrow(/chair\.png, chair-2\.png/);
    });

    it("joins areas, avatar bases and avatar parts with their variations", () => {
        const full = parse({
            areas: [
                {
                    key: "room",
                    name: "Room",
                    file: "areas/room.png",
                    stamp: {
                        version: 1,
                        width: 2,
                        height: 2,
                        palette: [{ tilesetKey: "floor", tileIndex: 0 }],
                        layers: { ground: [1, 1, 1, 1] },
                        objects: [],
                        zone: null,
                    },
                },
            ],
            avatarBases: [
                {
                    key: "base-a",
                    name: "A",
                    file: "bases/a.png",
                    preview: "bases/a-preview.png",
                },
                { key: "base-b", name: "B", file: "bases/b.png" },
            ],
            avatarParts: [
                {
                    key: "hair",
                    name: "Hair",
                    slot: "HAIR",
                    colorKey: "black",
                    colorHex: "#000000",
                    file: "parts/hair.png",
                    preview: "parts/hair-preview.png",
                    variations: [
                        {
                            colorKey: "red",
                            colorHex: "#FF0000",
                            file: "parts/hair-red.png",
                            preview: "parts/hair-red-preview.png",
                        },
                    ],
                },
            ],
        });
        const images = new Map(
            listSeedFilePaths(full).map((name) => [name, imageOf(name)])
        );

        const seed = buildLibrarySeed(full, images);

        expect(seed.areas![0]!.image).toEqual(imageOf("areas/room.png"));
        expect(seed.avatarBases![0]!.preview).toEqual(
            imageOf("bases/a-preview.png")
        );
        expect(seed.avatarBases![1]!.preview).toBeUndefined();
        const hair = seed.avatarParts![0]!;
        expect(hair.image).toEqual(imageOf("parts/hair.png"));
        expect(hair.preview).toEqual(imageOf("parts/hair-preview.png"));
        expect(hair.variations![0]!.image).toEqual(
            imageOf("parts/hair-red.png")
        );
        expect(hair.variations![0]!.preview).toEqual(
            imageOf("parts/hair-red-preview.png")
        );
        expect(listSeedFilePaths(full)).toHaveLength(8);
    });

    it("caps the list in the message and keeps all paths", () => {
        const many = parse({
            tilesets: Array.from({ length: 25 }, (_, index) => ({
                key: `t${index}`,
                name: "T",
                file: `t${index}.png`,
            })),
        });

        try {
            buildLibrarySeed(many, new Map());
            expect.unreachable();
        } catch (error) {
            const missing = error as LibrarySeedFilesMissingError;
            expect(missing.details.paths).toHaveLength(25);
            expect(missing.message).toContain("and 5 more");
            expect(missing.message).not.toContain("t24.png");
        }
    });
});

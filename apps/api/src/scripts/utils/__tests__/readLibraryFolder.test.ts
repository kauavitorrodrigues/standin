import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readLibraryFolder } from "../readLibraryFolder";

const PNG_1X1 = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==",
    "base64"
);
// Each file is a PNG plus its own name, so a mix-up of paths shows.
const imageOf = (name: string) => Buffer.concat([PNG_1X1, Buffer.from(name)]);

const stamp = {
    version: 1,
    width: 2,
    height: 2,
    palette: [{ tilesetKey: "floor", tileIndex: 0 }],
    layers: { ground: [1, 1, 1, 1] },
    objects: [],
    zone: null,
};

let folder: string;
const write = (name: string, content: string | Buffer) =>
    fs.writeFileSync(path.join(folder, name), content);
const writeLibrary = (library: object, images: string[]) => {
    for (const name of images) write(name, imageOf(name));
    write("library.json", JSON.stringify(library));
};

beforeEach(() => {
    folder = fs.mkdtempSync(path.join(os.tmpdir(), "read-library-"));
});
afterEach(() => fs.rmSync(folder, { recursive: true, force: true }));

describe("readLibraryFolder", () => {
    it("reads an old file with only tilesets and assets", async () => {
        writeLibrary(
            {
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
            },
            ["floor.png", "chair.png", "chair-2.png"]
        );

        const seed = await readLibraryFolder(folder);

        expect(seed.tilesets[0]!.image).toEqual(imageOf("floor.png"));
        expect(seed.assets[0]!.image).toEqual(imageOf("chair.png"));
        expect(seed.assets[0]!.variants![0]!.image).toEqual(
            imageOf("chair-2.png")
        );
        expect(seed.bundles).toEqual([]);
        expect(seed.areas).toEqual([]);
        expect(seed.avatarBases).toEqual([]);
        expect(seed.avatarParts).toEqual([]);
    });

    it("reads every new section and its images", async () => {
        writeLibrary(
            {
                bundles: [
                    {
                        asset: "table",
                        parts: [{ partAsset: "chair", offsetX: 0, offsetY: 1 }],
                    },
                ],
                areas: [
                    {
                        key: "lobby",
                        name: "Lobby",
                        file: "lobby.png",
                        stamp,
                    },
                ],
                avatarBases: [
                    {
                        key: "body",
                        name: "Body",
                        file: "body.png",
                        preview: "body-preview.png",
                    },
                    { key: "head", name: "Head", file: "head.png" },
                ],
                avatarParts: [
                    {
                        key: "hair",
                        name: "Hair",
                        slot: "HAIR",
                        colorKey: "black",
                        colorHex: "#1A1A1A",
                        file: "hair.png",
                        preview: "hair-preview.png",
                        variations: [
                            {
                                colorKey: "red",
                                colorHex: "#B03A2E",
                                file: "red.png",
                                preview: "red-preview.png",
                            },
                        ],
                    },
                ],
            },
            [
                "lobby.png",
                "body.png",
                "body-preview.png",
                "head.png",
                "hair.png",
                "hair-preview.png",
                "red.png",
                "red-preview.png",
            ]
        );

        const seed = await readLibraryFolder(folder);

        expect(seed.tilesets).toEqual([]);
        expect(seed.bundles![0]!.parts[0]!.partAsset).toBe("chair");
        expect(seed.areas![0]!.image).toEqual(imageOf("lobby.png"));
        const [body, head] = seed.avatarBases!;
        expect(body!.preview).toEqual(imageOf("body-preview.png"));
        expect(head!.preview).toBeUndefined();
        expect(head!.kind).toBeUndefined();
        const [hair] = seed.avatarParts!;
        expect(hair!.image).toEqual(imageOf("hair.png"));
        expect(hair!.preview).toEqual(imageOf("hair-preview.png"));
        expect(hair!.variations![0]!.image).toEqual(imageOf("red.png"));
        expect(hair!.variations![0]!.preview).toEqual(
            imageOf("red-preview.png")
        );
    });

    it("rejects a repeated key and a repeated bundle part", async () => {
        const area = { key: "lobby", name: "Lobby", file: "l.png", stamp };
        writeLibrary({ areas: [area, area] }, ["l.png"]);
        await expect(readLibraryFolder(folder)).rejects.toThrow(
            /lobby.+is written twice in areas/
        );

        const part = { partAsset: "chair", offsetX: 0, offsetY: 1 };
        writeLibrary(
            { bundles: [{ asset: "table", parts: [part, part] }] },
            []
        );
        await expect(readLibraryFolder(folder)).rejects.toThrow(
            /bundle .+table.+lists the part .+chair.+twice at the offset 0, 1/
        );
    });

    it("fails when a PNG of the file is missing", async () => {
        writeLibrary(
            { tilesets: [{ key: "floor", name: "Floor", file: "gone.png" }] },
            []
        );

        await expect(readLibraryFolder(folder)).rejects.toThrow(/ENOENT/);
    });
});

import { describe, expect, it } from "vitest";
import { LibrarySeedFileSchema } from "../library-seed.schema";

const stamp = {
    version: 1,
    width: 2,
    height: 2,
    palette: [{ tilesetKey: "floor", tileIndex: 0 }],
    layers: { ground: [1, 1, 1, 1] },
    objects: [
        {
            assetKey: "table",
            dx: 0,
            dy: 0,
            offsetX: 0,
            offsetY: 0,
            parentIndex: null,
        },
    ],
    zone: null,
};

const part = {
    key: "hair",
    name: "Hair",
    slot: "HAIR",
    file: "hair.png",
    preview: "hair-preview.png",
};

describe("LibrarySeedFileSchema", () => {
    it("keeps an old file valid and defaults the new sections", () => {
        const parsed = LibrarySeedFileSchema.parse({
            tilesets: [{ key: "floor", name: "Floor", file: "floor.png" }],
        });

        expect(parsed.assets).toEqual([]);
        expect(parsed.bundles).toEqual([]);
        expect(parsed.areas).toEqual([]);
        expect(parsed.avatarBases).toEqual([]);
        expect(parsed.avatarParts).toEqual([]);
    });

    it("accepts bundles and areas that name their targets by key", () => {
        const parsed = LibrarySeedFileSchema.parse({
            bundles: [
                {
                    asset: "table",
                    parts: [{ partAsset: "chair", offsetX: 0, offsetY: 1 }],
                },
            ],
            areas: [{ key: "lobby", name: "Lobby", file: "lobby.png", stamp }],
        });

        expect(parsed.bundles[0]!.parts[0]!.partAsset).toBe("chair");
        expect(parsed.areas[0]!.stamp.palette[0]!.tilesetKey).toBe("floor");
    });

    it("refuses a stamp that names a tileset by id", () => {
        const byId = {
            ...stamp,
            palette: [{ tilesetId: "abc", tileIndex: 0 }],
        };

        const result = LibrarySeedFileSchema.safeParse({
            areas: [
                { key: "lobby", name: "Lobby", file: "l.png", stamp: byId },
            ],
        });

        expect(result.success).toBe(false);
    });

    it("needs a preview for an avatar part but not for a base", () => {
        const { preview: _preview, ...noPreview } = part;

        expect(
            LibrarySeedFileSchema.safeParse({ avatarParts: [noPreview] })
                .success
        ).toBe(false);
        expect(
            LibrarySeedFileSchema.safeParse({
                avatarBases: [{ key: "body", name: "Body", file: "body.png" }],
            }).success
        ).toBe(true);
    });

    it("keeps the kind and the default of a base unset when left out", () => {
        const parsed = LibrarySeedFileSchema.parse({
            avatarBases: [{ key: "body", name: "Body", file: "body.png" }],
        });

        expect(parsed.avatarBases[0]!.kind).toBeUndefined();
        expect(parsed.avatarBases[0]!.isDefault).toBeUndefined();
    });

    it("needs a color on a part that has variations", () => {
        const variation = {
            colorKey: "red",
            colorHex: "#B03A2E",
            file: "red.png",
            preview: "red-preview.png",
        };

        expect(
            LibrarySeedFileSchema.safeParse({
                avatarParts: [{ ...part, variations: [variation] }],
            }).success
        ).toBe(false);
        expect(
            LibrarySeedFileSchema.safeParse({
                avatarParts: [
                    {
                        ...part,
                        colorKey: "black",
                        colorHex: "#1A1A1A",
                        variations: [variation],
                    },
                ],
            }).success
        ).toBe(true);
    });

    it("needs the color name and the color together", () => {
        expect(
            LibrarySeedFileSchema.safeParse({
                avatarParts: [{ ...part, colorKey: "black" }],
            }).success
        ).toBe(false);
    });

    it("refuses a bad avatar slot and a bad color", () => {
        expect(
            LibrarySeedFileSchema.safeParse({
                avatarParts: [{ ...part, slot: "WINGS" }],
            }).success
        ).toBe(false);
        expect(
            LibrarySeedFileSchema.safeParse({
                avatarParts: [
                    { ...part, colorKey: "black", colorHex: "#1A1A1" },
                ],
            }).success
        ).toBe(false);
    });

    describe("repeated keys", () => {
        const issuesOf = (file: unknown) => {
            const result = LibrarySeedFileSchema.safeParse(file);
            return result.success
                ? []
                : result.error.issues.map(({ path, message }) => ({
                      path,
                      message,
                  }));
        };
        const area = { key: "lobby", name: "Lobby", file: "l.png", stamp };
        const base = { key: "body", name: "Body", file: "body.png" };

        it("names the section and the key of each new section", () => {
            const bundle = { asset: "table", parts: [] };

            expect(issuesOf({ areas: [area, area] })).toEqual([
                {
                    path: ["areas", 1, "key"],
                    message: 'The key "lobby" is written twice in areas.',
                },
            ]);
            expect(issuesOf({ avatarBases: [base, base] })[0]!.path).toEqual([
                "avatarBases",
                1,
                "key",
            ]);
            expect(issuesOf({ avatarParts: [part, part] })[0]!.message).toBe(
                'The key "hair" is written twice in avatarParts.'
            );
            expect(issuesOf({ bundles: [bundle, bundle] })).toEqual([
                {
                    path: ["bundles", 1, "asset"],
                    message: 'The key "table" is written twice in bundles.',
                },
            ]);
        });

        it("refuses a color written twice inside a part", () => {
            const red = {
                colorKey: "red",
                colorHex: "#B03A2E",
                file: "red.png",
                preview: "red-preview.png",
            };

            expect(
                issuesOf({
                    avatarParts: [
                        {
                            ...part,
                            colorKey: "black",
                            colorHex: "#1A1A1A",
                            variations: [red, red],
                        },
                    ],
                })
            ).toEqual([
                {
                    path: ["avatarParts", 0, "variations", 1, "colorKey"],
                    message:
                        'The avatar part "hair" lists the color "red" twice.',
                },
            ]);
        });

        it("keeps repeated tileset and asset keys as they always were", () => {
            const tileset = { key: "floor", name: "Floor", file: "f.png" };
            const asset = {
                key: "chair",
                name: "Chair",
                type: "CHAIR",
                footprint: { w: 1, h: 1 },
                file: "c.png",
            };

            expect(
                issuesOf({
                    tilesets: [tileset, tileset],
                    assets: [asset, asset],
                })
            ).toEqual([]);
        });
    });

    describe("bundle parts", () => {
        const bundle = (parts: object[]) => ({
            bundles: [{ asset: "table", parts }],
        });
        const chair = { partAsset: "chair", offsetX: 0, offsetY: 1 };

        it("refuses the same part at the same offset twice", () => {
            const result = LibrarySeedFileSchema.safeParse(
                bundle([chair, { ...chair, partAsset: "lamp" }, chair])
            );

            expect(result.success).toBe(false);
            expect(result.error!.issues).toMatchObject([
                {
                    path: ["bundles", 0, "parts", 2],
                    message:
                        'The bundle "table" lists the part "chair" twice at the offset 0, 1.',
                },
            ]);
        });

        it("accepts the same part at other offsets", () => {
            expect(
                LibrarySeedFileSchema.safeParse(
                    bundle([chair, { ...chair, offsetY: 2 }])
                ).success
            ).toBe(true);
        });
    });
});

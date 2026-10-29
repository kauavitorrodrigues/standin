import { describe, expect, it } from "vitest";
import { createLibraryIndex } from "../library/createLibraryIndex";
import { asset, buildLibrary } from "./kit";

describe("createLibraryIndex", () => {
    const library = buildLibrary();
    const index = createLibraryIndex(library);

    it("resolves an asset key to its row", () => {
        const found = index.asset("desk");

        expect(found.ok && found.value.id).toBe("desk");
    });

    it("resolves a tileset by name and by id", () => {
        const byName = index.tileset("brick");
        const byId = index.tileset("ts-brick");

        expect(byName.ok && byName.value.id).toBe("ts-brick");
        expect(byId.ok && byId.value.id).toBe("ts-brick");
    });

    it("answers a structured issue for an unknown key", () => {
        const found = index.asset("nope");

        expect(found).toEqual({
            ok: false,
            issue: {
                code: "AUTHORING_UNKNOWN_KEY",
                path: "library.assets.nope",
                message: expect.stringContaining("nope"),
            },
        });
        expect(index.tileset("nope").ok).toBe(false);
    });

    it("reports a key that two assets share and refuses to pick one", () => {
        const twice = createLibraryIndex({
            ...library,
            assets: [...library.assets, asset({ id: "crate-2", key: "crate" })],
        });

        expect(twice.issues).toEqual([
            expect.objectContaining({
                code: "AUTHORING_DUPLICATE_KEY",
                path: "library.assets.crate",
            }),
        ]);
        const found = twice.asset("crate");
        expect(!found.ok && found.issue.code).toBe("AUTHORING_DUPLICATE_KEY");
    });

    it("reports a tileset name that two tilesets share", () => {
        const [first] = library.tilesets;
        const twice = createLibraryIndex({
            ...library,
            tilesets: [...library.tilesets, { ...first, id: "other" }],
        });

        expect(twice.issues).toHaveLength(1);
        expect(twice.tileset("floor").ok).toBe(false);
        // The id still names one tileset.
        expect(twice.tileset("other").ok).toBe(true);
    });

    it("has no issues for a clean library", () => {
        expect(index.issues).toEqual([]);
    });
});

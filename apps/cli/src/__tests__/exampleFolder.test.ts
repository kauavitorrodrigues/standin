import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compileSpec, validateOps } from "@standin/authoring";
import {
    ACTION_PARAMS_SCHEMAS,
    LibrarySeedFileSchema,
    SIZE_TIERS,
    TileMetaSchema,
    buildBlankEditorModel,
    getWallStyles,
    validateFamily,
    validateWallStyle,
} from "@standin/contracts";
import type { LibraryPalette } from "@standin/contracts";
import { createNodeFiles } from "../config/createNodeFiles";
import { readContentFolder } from "../commands/content/shared/readContentFolder";
import { runCli } from "../program/runCli";
import { buildLibraryPalette } from "../testing/buildLibraryPalette";
import { createFakeRuntime } from "../testing/createFakeRuntime";
import { readPngSize } from "../testing/readPngSize";
import type { ContentScan } from "../types";

// The content folder that the docs use as their worked example.
const FOLDER: string = path.resolve(
    __dirname,
    "../../../../examples/authoring"
);

const readPalette = (): LibraryPalette => {
    const text: string = fs.readFileSync(
        path.join(FOLDER, "library.json"),
        "utf8"
    );
    return buildLibraryPalette(
        LibrarySeedFileSchema.parse(JSON.parse(text)),
        (file) => readPngSize(fs.readFileSync(path.join(FOLDER, file)))
    );
};

describe("examples/authoring", () => {
    it("passes `content validate` on the real files", async () => {
        const fake = createFakeRuntime();
        const runtime = { ...fake.runtime, files: createNodeFiles() };

        const code: number = await runCli(
            ["content", "validate", FOLDER, "--json"],
            runtime
        );

        expect(JSON.parse(fake.written.out)).toMatchObject({
            ok: true,
            result: {
                valid: true,
                library: { counts: { tilesets: 2, assets: 5 } },
                templates: [{ name: "Small office", thumbnail: true }],
                warnings: [],
            },
        });
        expect(code).toBe(0);
    });

    it("has a template that compiles on a library made from library.json", async () => {
        const scan: ContentScan = await readContentFolder(
            createNodeFiles(),
            FOLDER
        );
        expect(scan.issues).toEqual([]);
        expect(scan.plan.templates).toHaveLength(1);

        const library: LibraryPalette = readPalette();
        for (const { spec } of scan.plan.templates) {
            const tier = SIZE_TIERS[spec.sizeTier];
            const base = buildBlankEditorModel({
                width: tier.maxWidth,
                height: tier.maxHeight,
                library,
            });

            const compiled = compileSpec(spec, { base, requireSpawn: false });

            expect(compiled.ok).toBe(true);
            if (!compiled.ok) continue;
            expect(compiled.ops.length).toBeGreaterThan(0);
            expect(validateOps(base, compiled.ops).ok).toBe(true);
        }
    });

    it("names the tilesets of the spec by name and the assets by key", async () => {
        const scan = await readContentFolder(createNodeFiles(), FOLDER);
        const library: LibraryPalette = readPalette();
        const [template] = scan.plan.templates;

        expect(template?.spec.style?.floor?.tileset).toBe(
            library.tilesets[0]?.name
        );
        expect(library.assets.map(({ key }) => key)).toContain(
            template?.spec.objects?.[0]?.asset
        );
    });

    // The rules of the server that need no database. The check that the
    // footprint fits the sprite lives in `packages/core` and is not exported
    // without it, so it is not run here.
    it("follows the pure rules of the library", () => {
        const library: LibraryPalette = readPalette();

        const doors = library.assets.filter(
            ({ key }) =>
                key === "example-door" || key.startsWith("example-door-")
        );
        expect(doors).toHaveLength(4);
        expect(validateFamily(doors)).toEqual([]);

        for (const asset of library.assets) {
            if (!asset.action) continue;
            const schema = ACTION_PARAMS_SCHEMAS[asset.action];
            expect(schema.safeParse(asset.actionParams).success).toBe(true);
        }

        for (const tileset of library.tilesets) {
            expect(TileMetaSchema.safeParse(tileset.tileMeta).success).toBe(
                true
            );
        }
        const styles = getWallStyles(library.tilesets[1]?.tileMeta ?? {});
        expect(styles.map(({ name }) => name)).toEqual(["Brick"]);
        expect(validateWallStyle(styles[0]!).isComplete).toBe(true);
    });
});

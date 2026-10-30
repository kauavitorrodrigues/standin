import { describe, expect, it, vi } from "vitest";
import { EXIT_CODES } from "../../../consts/exitCodes";
import {
    ACCENT_PATH,
    FOLDER,
    LIBRARY_JSON,
    LOUNGE_SPEC,
    NOT_PNG_BYTES,
    PNG_BYTES,
    TEMPLATE_SPEC,
    buildContentFiles,
} from "../../../testing/contentFixtures";
import { VALID_SPEC } from "../../../testing/mapFixtures";
import { runCliFake } from "../../../testing/runCliFake";
import type { FakeFiles, FakeLinks } from "../../../types";

const MB = 1024 * 1024;

const validate = (
    files: FakeFiles,
    extra: string[] = [],
    links: FakeLinks = {}
) =>
    runCliFake(["content", "validate", FOLDER, "--json", ...extra], {
        files,
        links,
    });

// Every path the command read the bytes or the text of.
const readPaths = (run: Awaited<ReturnType<typeof validate>>): string[] => [
    ...vi.mocked(run.fake.files.readBytes).mock.calls.map(([path]) => path),
    ...vi.mocked(run.fake.files.readText).mock.calls.map(([path]) => path),
];

const issuesOf = (out: string) => JSON.parse(out).error.issues;

// A PNG of the given size: its signature, then zeros.
const pngOfSize = (bytes: number): Uint8Array => {
    const data = new Uint8Array(bytes);
    data.set(PNG_BYTES);
    return data;
};

describe("content validate", () => {
    it("checks the folder on this machine and sends nothing", async () => {
        const run = await validate(buildContentFiles());

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.requests).toHaveLength(0);
        expect(JSON.parse(run.out)).toMatchObject({
            ok: true,
            command: "content validate",
            result: {
                valid: true,
                folder: FOLDER,
                library: {
                    files: 2,
                    counts: { tilesets: 1, assets: 1, areas: 0 },
                },
                warnings: [],
            },
        });
        expect(JSON.parse(run.out).result.templates).toEqual([
            {
                file: "templates/lounge.yaml",
                name: "lounge",
                sizeTier: "S",
                thumbnail: false,
            },
            {
                file: "templates/office.yaml",
                name: "Open office",
                sizeTier: "S",
                thumbnail: true,
            },
        ]);
    });

    it("needs no URL, token or login file", async () => {
        const run = await runCliFake(["content", "validate", FOLDER], {
            files: buildContentFiles(),
            env: {},
        });

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.out).toContain("the content folder is valid");
        expect(run.out).toContain("1 tilesets, 1 assets and 2 PNG files");
        expect(run.out).toContain('template "Open office"');
    });

    it("accepts a folder with only a library, or only templates", async () => {
        const library = await validate({
            [`${FOLDER}/library.json`]: LIBRARY_JSON,
            [`${FOLDER}/tilesets/floor.png`]: PNG_BYTES,
            [`${FOLDER}/${ACCENT_PATH}`]: PNG_BYTES,
        });
        const templates = await validate({
            [`${FOLDER}/templates/aa.yml`]: TEMPLATE_SPEC,
            [`${FOLDER}/templates/bb.json`]: JSON.stringify({
                kind: "template",
                sizeTier: "S",
                objects: [{ asset: "crate", x: 1, y: 1 }],
            }),
        });

        expect(library.code).toBe(EXIT_CODES.OK);
        expect(JSON.parse(library.out).result.templates).toEqual([]);
        expect(templates.code).toBe(EXIT_CODES.OK);
        expect(JSON.parse(templates.out).result.library).toBeUndefined();
        expect(JSON.parse(templates.out).result.templates).toHaveLength(2);
    });

    it("reports the maps folder as ignored, a warning and not an error", async () => {
        const files = buildContentFiles({
            [`${FOLDER}/maps/office.yaml`]: VALID_SPEC,
        });
        const json = await validate(files);
        const text = await runCliFake(["content", "validate", FOLDER], {
            files,
        });

        expect(json.code).toBe(EXIT_CODES.OK);
        expect(JSON.parse(json.out).result.warnings).toEqual([
            expect.stringContaining("maps/ folder is ignored"),
        ]);
        expect(text.out).toContain("! the maps/ folder is ignored");
    });

    it("exits 3 with a fix on an empty folder", async () => {
        const run = await validate({ [`${FOLDER}/`]: "" });

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_CONTENT_FOLDER_EMPTY");
        expect(error.fix).toContain("library.json");
    });

    it("exits 3 on a folder with only a maps folder", async () => {
        const run = await validate({ [`${FOLDER}/maps/a.yaml`]: VALID_SPEC });

        expect(JSON.parse(run.out).error.code).toBe("CLI_CONTENT_FOLDER_EMPTY");
    });

    it("exits 3 on a folder that does not exist", async () => {
        const run = await validate({});

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_CONTENT_FOLDER_UNREADABLE");
        expect(error.message).toContain("ENOENT");
    });

    it("lists the issues of a library.json that is not JSON", async () => {
        const run = await validate(
            buildContentFiles({ [`${FOLDER}/library.json`]: "{ nope" })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.code).toBe("CLI_CONTENT_INVALID");
        expect(issuesOf(run.out)[0]).toMatchObject({
            file: "library.json",
            message: expect.stringContaining("not valid JSON"),
        });
    });

    it("lists the issues of a library.json that breaks the schema", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/library.json`]: JSON.stringify({
                    tilesets: [{ key: "floor", file: "tilesets/floor.png" }],
                }),
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(issuesOf(run.out)).toEqual([
            expect.objectContaining({
                file: "library.json",
                path: "tilesets[0].name",
            }),
        ]);
    });

    it("lists every PNG that is missing, with the place that names it", async () => {
        const files = buildContentFiles();
        delete files[`${FOLDER}/tilesets/floor.png`];
        delete files[`${FOLDER}/${ACCENT_PATH}`];
        const run = await validate(files);

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(issuesOf(run.out)).toEqual([
            {
                file: "tilesets/floor.png",
                path: "tilesets[0].file",
                message: "the file does not exist",
            },
            {
                file: ACCENT_PATH,
                path: "assets[0].file",
                message: "the file does not exist",
            },
        ]);
    });

    it("prints one line for each issue in the text output", async () => {
        const files = buildContentFiles();
        delete files[`${FOLDER}/tilesets/floor.png`];
        const run = await runCliFake(["content", "validate", FOLDER], {
            files,
        });

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(run.err).toContain(
            "tilesets/floor.png tilesets[0].file: the file does not exist"
        );
    });

    it("refuses a file that is not a PNG", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/tilesets/floor.png`]: NOT_PNG_BYTES,
            })
        );

        expect(issuesOf(run.out)).toEqual([
            expect.objectContaining({
                file: "tilesets/floor.png",
                message: "it is not a PNG",
            }),
        ]);
    });

    it("refuses a PNG over 3 MB", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/tilesets/floor.png`]: pngOfSize(3 * MB + 1),
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(issuesOf(run.out)[0].message).toContain(
            "over the limit of 3.0 MB"
        );
    });

    it("refuses a path that leaves the folder", async () => {
        const library = JSON.stringify({
            tilesets: [{ key: "floor", name: "Floor", file: "../floor.png" }],
        });
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/library.json`]: library,
                "/floor.png": PNG_BYTES,
            })
        );

        expect(issuesOf(run.out)[0]).toMatchObject({
            file: "../floor.png",
            message: expect.stringContaining("stay inside the folder"),
        });
        expect(readPaths(run)).not.toContain("/floor.png");
        expect(
            vi.mocked(run.fake.files.fileSize).mock.calls
        ).not.toContainEqual(["/floor.png"]);
    });

    it.each([
        ['assets/a"b.png', "double quote"],
        ["assets/a\nb.png", "line break"],
        ["assets/a\rb.png", "line break"],
    ])("refuses the part name %j", async (file, word) => {
        const library = JSON.stringify({
            tilesets: [{ key: "floor", name: "Floor", file }],
        });
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/library.json`]: library,
                [`${FOLDER}/${file}`]: PNG_BYTES,
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(issuesOf(run.out)).toEqual([
            {
                file,
                path: "tilesets[0].file",
                message: expect.stringContaining(word),
            },
        ]);
        expect(readPaths(run)).not.toContain(`${FOLDER}/${file}`);
    });

    it("refuses a part name over 255 bytes without reading the file", async () => {
        const file = `${"d/".repeat(60)}${"é".repeat(70)}.png`;
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/library.json`]: JSON.stringify({
                    tilesets: [{ key: "floor", name: "Floor", file }],
                }),
                [`${FOLDER}/${file}`]: PNG_BYTES,
            })
        );

        expect(issuesOf(run.out)).toEqual([
            expect.objectContaining({
                file,
                message: expect.stringContaining("over the limit of 255"),
            }),
        ]);
        expect(readPaths(run)).not.toContain(`${FOLDER}/${file}`);
    });

    it("refuses a file named library, the part of library.json itself", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/library.json`]: JSON.stringify({
                    tilesets: [
                        { key: "floor", name: "Floor", file: "library" },
                    ],
                }),
                [`${FOLDER}/library`]: PNG_BYTES,
            })
        );

        expect(issuesOf(run.out)).toEqual([
            {
                file: "library",
                path: "tilesets[0].file",
                message: expect.stringContaining("part of library.json itself"),
            },
        ]);
        expect(readPaths(run)).not.toContain(`${FOLDER}/library`);
    });

    it("never reads a PNG whose size is already over 3 MB", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/tilesets/floor.png`]: pngOfSize(3 * MB + 1),
            })
        );

        expect(issuesOf(run.out)).toHaveLength(1);
        expect(readPaths(run)).not.toContain(`${FOLDER}/tilesets/floor.png`);
    });

    it("never reads a library.json over 4 MB", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/library.json`]: `${LIBRARY_JSON}${" ".repeat(4 * MB)}`,
            })
        );

        expect(issuesOf(run.out)[0].message).toContain(
            "over the limit of 4.0 MB"
        );
        expect(readPaths(run)).not.toContain(`${FOLDER}/library.json`);
    });

    it("refuses a library.json named in more than 300 files", async () => {
        const tilesets = Array.from({ length: 301 }, (_, index) => ({
            key: `t${index}`,
            name: `T${index}`,
            file: `png/${index}.png`,
        }));
        const files: FakeFiles = {
            [`${FOLDER}/library.json`]: JSON.stringify({ tilesets }),
        };
        for (const tileset of tilesets) {
            files[`${FOLDER}/${tileset.file}`] = PNG_BYTES;
        }
        const run = await validate(files);

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(issuesOf(run.out)).toEqual([
            {
                file: "library.json",
                message: "it names 301 files, over the limit of 300",
            },
        ]);
        expect(readPaths(run).filter((path) => path.endsWith(".png"))).toEqual(
            []
        );
    });

    it("refuses a library.json over 4 MB", async () => {
        const padded = `${LIBRARY_JSON}${" ".repeat(4 * MB)}`;
        const run = await validate(
            buildContentFiles({ [`${FOLDER}/library.json`]: padded })
        );

        expect(issuesOf(run.out)[0]).toMatchObject({
            file: "library.json",
            message: expect.stringContaining("over the limit of 4.0 MB"),
        });
    });

    it("refuses an upload over 64 MB in all", async () => {
        const big = pngOfSize(3 * MB);
        const tilesets = Array.from({ length: 25 }, (_, index) => ({
            key: `t${index}`,
            name: `T${index}`,
            file: `png/${index}.png`,
        }));
        const files: FakeFiles = {
            [`${FOLDER}/library.json`]: JSON.stringify({ tilesets }),
        };
        for (const tileset of tilesets) {
            files[`${FOLDER}/${tileset.file}`] = big;
        }
        const run = await validate(files);

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(issuesOf(run.out)).toEqual([
            expect.objectContaining({
                file: "library.json",
                message: expect.stringContaining("over the limit of 64.0 MB"),
            }),
        ]);
        // The reading stops where the total crosses the limit.
        expect(
            readPaths(run).filter((path) => path.endsWith(".png")).length
        ).toBeLessThan(25);
    });

    it("lists the issues of a template spec, by file and path", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/templates/office.yaml`]:
                    "kind: template\nsizeTier: XXL\n",
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(issuesOf(run.out)).toEqual([
            expect.objectContaining({
                file: "templates/office.yaml",
                path: "sizeTier",
            }),
        ]);
    });

    it("refuses a spec that is not of kind template", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/templates/office.yaml`]: VALID_SPEC,
            })
        );

        expect(issuesOf(run.out)).toEqual([
            {
                file: "templates/office.yaml",
                path: "kind",
                message: expect.stringContaining('of kind "map"'),
            },
        ]);
    });

    it("refuses a spec that is not YAML", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/templates/office.yaml`]: "kind: [template",
            })
        );

        expect(issuesOf(run.out)[0]).toMatchObject({
            file: "templates/office.yaml",
            code: "AUTHORING_SPEC_PARSE_ERROR",
        });
    });

    it("refuses two templates with the same name", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/templates/other.yaml`]: TEMPLATE_SPEC,
            })
        );

        expect(issuesOf(run.out)).toEqual([
            {
                file: "templates/other.yaml",
                path: "name",
                message: expect.stringContaining(
                    "already used by templates/office.yaml"
                ),
            },
        ]);
    });

    it("refuses a template name the server would refuse", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/templates/lounge.yaml`]:
                    "kind: template\nsizeTier: S\nname: x\n",
            })
        );

        expect(issuesOf(run.out)[0]).toMatchObject({
            file: "templates/lounge.yaml",
            path: "name",
            message: "the template name must have 2 to 100 characters",
        });
    });

    it("refuses a thumbnail that is not a PNG", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/templates/office.png`]: NOT_PNG_BYTES,
            })
        );

        expect(issuesOf(run.out)).toEqual([
            {
                file: "templates/office.png",
                message: "it is not a PNG",
            },
        ]);
    });

    it("lists the issues of the library and of the templates together", async () => {
        const files = buildContentFiles({
            [`${FOLDER}/templates/lounge.yaml`]: "kind: world\n",
        });
        delete files[`${FOLDER}/tilesets/floor.png`];
        const run = await validate(files);

        expect(
            issuesOf(run.out).map((issue: { file: string }) => issue.file)
        ).toEqual(["tilesets/floor.png", "templates/lounge.yaml"]);
    });

    it("uses the file stem for a spec with no name", async () => {
        const run = await validate(
            buildContentFiles({
                [`${FOLDER}/templates/lounge.yaml`]: LOUNGE_SPEC,
            })
        );

        expect(
            JSON.parse(run.out).result.templates.map(
                (template: { name: string }) => template.name
            )
        ).toContain("lounge");
    });

    it("has help with examples", async () => {
        const run = await runCliFake(["content", "validate", "--help"]);

        expect(run.out).toContain("pnpm -s standin content validate ./content");
        expect(run.out).toContain("needs no URL or token");
    });

    describe("links", () => {
        const outside: FakeFiles = {
            "/outside/secret.png": PNG_BYTES,
            "/outside/library.json": LIBRARY_JSON,
            "/outside/templates/office.yaml": TEMPLATE_SPEC,
            "/outside/spec.yaml": TEMPLATE_SPEC,
        };

        it("follows a link that stays inside the folder", async () => {
            const files = buildContentFiles({
                [`${FOLDER}/real/floor.png`]: PNG_BYTES,
            });
            delete files[`${FOLDER}/tilesets/floor.png`];
            const run = await validate(files, [], {
                [`${FOLDER}/tilesets/floor.png`]: `${FOLDER}/real/floor.png`,
            });

            expect(run.code).toBe(EXIT_CODES.OK);
        });

        it("refuses a PNG that is a link out of the folder, and never reads it", async () => {
            const files = buildContentFiles(outside);
            delete files[`${FOLDER}/tilesets/floor.png`];
            const run = await validate(files, [], {
                [`${FOLDER}/tilesets/floor.png`]: "/outside/secret.png",
            });

            expect(run.code).toBe(EXIT_CODES.VALIDATION);
            expect(issuesOf(run.out)).toEqual([
                {
                    file: "tilesets/floor.png",
                    path: "tilesets[0].file",
                    message: expect.stringContaining("resolves outside"),
                },
            ]);
            expect(readPaths(run)).not.toContain("/outside/secret.png");
        });

        it("refuses a link to a folder out of the folder that holds a PNG", async () => {
            const files = buildContentFiles({
                "/outside/dir/floor.png": PNG_BYTES,
            });
            delete files[`${FOLDER}/tilesets/floor.png`];
            const run = await validate(files, [], {
                [`${FOLDER}/tilesets`]: "/outside/dir",
            });

            expect(issuesOf(run.out)[0]).toMatchObject({
                file: "tilesets/floor.png",
                message: expect.stringContaining("resolves outside"),
            });
            expect(readPaths(run)).not.toContain("/outside/dir/floor.png");
        });

        it("refuses a library.json that is a link out of the folder", async () => {
            const files = buildContentFiles(outside);
            delete files[`${FOLDER}/library.json`];
            const run = await validate(files, [], {
                [`${FOLDER}/library.json`]: "/outside/library.json",
            });

            expect(issuesOf(run.out)).toEqual([
                {
                    file: "library.json",
                    message: expect.stringContaining("resolves outside"),
                },
            ]);
            expect(readPaths(run)).not.toContain("/outside/library.json");
        });

        it("reports a templates folder that is a link out, not an empty folder", async () => {
            const run = await validate(
                { ...outside, [`${FOLDER}/other.txt`]: "x" },
                [],
                { [`${FOLDER}/templates`]: "/outside/templates" }
            );

            expect(run.code).toBe(EXIT_CODES.VALIDATION);
            const { error } = JSON.parse(run.out);
            expect(error.code).toBe("CLI_CONTENT_INVALID");
            expect(error.issues).toEqual([
                {
                    file: "templates",
                    message: expect.stringContaining("resolves outside"),
                },
            ]);
            expect(readPaths(run)).not.toContain(
                "/outside/templates/office.yaml"
            );
        });

        it("follows a templates folder that is a link inside the folder", async () => {
            const run = await validate(
                {
                    [`${FOLDER}/library.json`]: LIBRARY_JSON,
                    [`${FOLDER}/tilesets/floor.png`]: PNG_BYTES,
                    [`${FOLDER}/${ACCENT_PATH}`]: PNG_BYTES,
                    [`${FOLDER}/shared/office.yaml`]: TEMPLATE_SPEC,
                },
                [],
                { [`${FOLDER}/templates`]: `${FOLDER}/shared` }
            );

            expect(run.code).toBe(EXIT_CODES.OK);
            expect(JSON.parse(run.out).result.templates).toHaveLength(1);
        });

        it("refuses a spec that is a link out of the folder", async () => {
            const files = buildContentFiles(outside);
            delete files[`${FOLDER}/templates/office.yaml`];
            const run = await validate(files, [], {
                [`${FOLDER}/templates/office.yaml`]: "/outside/spec.yaml",
            });

            expect(issuesOf(run.out)).toEqual([
                {
                    file: "templates/office.yaml",
                    message: expect.stringContaining("resolves outside"),
                },
            ]);
            expect(readPaths(run)).not.toContain("/outside/spec.yaml");
        });

        it("refuses a thumbnail that is a link out of the folder", async () => {
            const files = buildContentFiles(outside);
            delete files[`${FOLDER}/templates/office.png`];
            const run = await validate(files, [], {
                [`${FOLDER}/templates/office.png`]: "/outside/secret.png",
            });

            expect(issuesOf(run.out)).toEqual([
                {
                    file: "templates/office.png",
                    message: expect.stringContaining("resolves outside"),
                },
            ]);
            expect(readPaths(run)).not.toContain("/outside/secret.png");
        });

        it("reports a link that points at nothing", async () => {
            const files = buildContentFiles();
            delete files[`${FOLDER}/tilesets/floor.png`];
            const run = await validate(files, [], {
                [`${FOLDER}/tilesets/floor.png`]: "/nowhere/floor.png",
            });

            expect(issuesOf(run.out)[0]).toMatchObject({
                file: "tilesets/floor.png",
                message: "the file does not exist",
            });
        });

        it("refuses a content folder that is itself missing", async () => {
            const run = await validate({});

            expect(JSON.parse(run.out).error.code).toBe(
                "CLI_CONTENT_FOLDER_UNREADABLE"
            );
        });
    });
});

import { describe, expect, it } from "vitest";
import { EXIT_CODES } from "../../../consts/exitCodes";
import {
    ACCENT_PATH,
    FOLDER,
    NOT_PNG_BYTES,
    PNG_BYTES,
    SEED_ANSWER,
    TEMPLATE_ID,
    buildContentFiles,
    buildTemplate,
    buildTemplateRoutes,
} from "../../../testing/contentFixtures";
import { MAP_ID } from "../../../testing/mapFixtures";
import {
    FAKE_TOKEN,
    FAKE_URL,
    REMOTE_ENV,
    runCliFake,
} from "../../../testing/runCliFake";
import { UnexpectedFailure } from "../../../testing/UnexpectedFailure";
import type { FakeFiles, FakeHttpRoutes, HttpRequest } from "../../../types";

const apply = (
    extra: string[] = [],
    routes: FakeHttpRoutes = buildTemplateRoutes(),
    files: FakeFiles = buildContentFiles()
) =>
    runCliFake(["content", "apply", FOLDER, "--json", ...extra], {
        env: REMOTE_ENV,
        files,
        routes,
    });

const writes = (requests: HttpRequest[]): string[] =>
    requests
        .filter((request) => request.method !== "GET")
        .map((request) => {
            const { pathname, search } = new URL(request.url);
            return `${request.method} ${pathname}${search}`;
        });

const scopeError = (scope: string) => ({
    status: 403,
    body: {
        error: `This service token does not have the "${scope}" scope.`,
        code: "SERVICE_TOKEN_SCOPE_MISSING",
    },
});

// The folder has two templates, "Open office" and "lounge".
const existing = (...templates: ReturnType<typeof buildTemplate>[]) =>
    buildTemplateRoutes({
        "GET /templates": { status: 200, body: { templates } },
    });

const withThumbnail = (template: ReturnType<typeof buildTemplate>) => ({
    ...template,
    thumbnailUrl: "/thumbnail.png",
});

const OFFICE = buildTemplate({ id: "tpl-office", name: "Open office" });
const LOUNGE = buildTemplate({ id: "tpl-lounge", name: "lounge" });

describe("content apply", () => {
    it("seeds the library first, then creates the templates", async () => {
        const run = await apply();

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(writes(run.fake.requests)).toEqual([
            "POST /library/seed",
            "POST /templates",
            `POST /maps/${MAP_ID}/apply`,
            "POST /templates",
            `POST /maps/${MAP_ID}/apply`,
            `PUT /templates/${TEMPLATE_ID}/thumbnail`,
        ]);
        const { result } = JSON.parse(run.out);
        expect(result.dryRun).toBe(false);
        expect(result.library).toEqual({ dryRun: false, result: SEED_ANSWER });
        expect(result.templates).toEqual([
            expect.objectContaining({
                name: "lounge",
                file: "templates/lounge.yaml",
                action: "created",
                status: "DRAFT",
                thumbnailUploaded: false,
            }),
            expect.objectContaining({
                name: "Open office",
                action: "created",
                id: TEMPLATE_ID,
                thumbnailUploaded: true,
            }),
        ]);
        expect(result.templates[0].opCount).toBeGreaterThan(0);
    });

    it("sends library.json and each PNG as a part named by its path", async () => {
        const run = await apply();

        const seed = run.fake.requests.find((r) =>
            r.url.endsWith("/library/seed")
        );
        expect(seed?.body).toBeUndefined();
        expect(seed?.headers["content-type"]).toBeUndefined();
        expect(seed?.headers.authorization).toBe(`Bearer ${FAKE_TOKEN}`);
        expect(seed?.form?.get("library")).toBe(
            buildContentFiles()[`${FOLDER}/library.json`]
        );
        expect([...(seed?.form?.keys() ?? [])].sort()).toEqual(
            ["library", "tilesets/floor.png", ACCENT_PATH].sort()
        );
        const accent = seed?.form?.get(ACCENT_PATH) as File;
        expect(accent.type).toBe("image/png");
        expect(new Uint8Array(await accent.arrayBuffer())).toEqual(PNG_BYTES);
    });

    it("prints a line for each step for people", async () => {
        const run = await runCliFake(["content", "apply", FOLDER], {
            env: REMOTE_ENV,
            files: buildContentFiles(),
            routes: buildTemplateRoutes(),
        });

        expect(run.out).toContain("✓ library seeded");
        expect(run.out).toContain("tileset: 1 created, 0 updated, 0 unchanged");
        expect(run.out).toContain('✓ template "Open office" created');
        expect(run.out).toContain("thumbnail uploaded");
        expect(run.out).not.toContain("published");
    });

    it("never publishes without --publish", async () => {
        const run = await apply();

        expect(writes(run.fake.requests).join(" ")).not.toContain("publish");
    });

    it("publishes the templates it makes with --publish", async () => {
        const files = buildContentFiles({
            [`${FOLDER}/templates/lounge.png`]: PNG_BYTES,
        });
        const run = await apply(["--publish"], buildTemplateRoutes(), files);

        expect(run.code).toBe(EXIT_CODES.OK);
        const published = writes(run.fake.requests).filter((w) =>
            w.endsWith("/publish")
        );
        expect(published).toHaveLength(2);
        expect(JSON.parse(run.out).result.templates[0].status).toBe(
            "PUBLISHED"
        );
    });

    it("refuses --publish when a template has no thumbnail, before any request", async () => {
        const run = await apply(["--publish"]);

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.issues).toEqual([
            {
                file: "templates/lounge.yaml",
                message: expect.stringContaining("templates/lounge.png"),
            },
        ]);
        expect(run.fake.requests.map((r) => r.method)).toEqual(["GET"]);
    });

    it("needs no local thumbnail for a template that exists", async () => {
        const run = await apply(
            ["--publish"],
            buildTemplateRoutes({
                "GET /templates": {
                    status: 200,
                    body: {
                        templates: [
                            withThumbnail(OFFICE),
                            withThumbnail(LOUNGE),
                        ],
                    },
                },
                "POST /templates/tpl-office/publish": {
                    status: 200,
                    body: { template: { ...OFFICE, status: "PUBLISHED" } },
                },
                "POST /templates/tpl-lounge/publish": {
                    status: 200,
                    body: { template: { ...LOUNGE, status: "PUBLISHED" } },
                },
            })
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(
            JSON.parse(run.out).result.templates.map(
                (t: { action: string }) => t.action
            )
        ).toEqual(["published", "published"]);
    });

    it("refuses --publish for a draft with no thumbnail on the instance, before any write", async () => {
        const run = await apply(
            ["--publish"],
            existing(withThumbnail(OFFICE), LOUNGE)
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_TEMPLATE_NOT_PUBLISHABLE");
        expect(error.issues).toEqual([
            {
                file: "templates/lounge.yaml",
                message: expect.stringContaining("has no thumbnail"),
            },
        ]);
        expect(error.fix).toContain("delete it on the admin screen");
        expect(writes(run.fake.requests)).toEqual([]);
    });

    it("does not look at the thumbnail of a draft without --publish", async () => {
        const run = await apply([], existing(OFFICE, LOUNGE));

        expect(run.code).toBe(EXIT_CODES.OK);
    });

    it("does not need a thumbnail for a published or retired template with --publish", async () => {
        const run = await apply(
            ["--publish"],
            existing(
                { ...OFFICE, status: "PUBLISHED" },
                { ...LOUNGE, status: "RETIRED" }
            )
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(writes(run.fake.requests)).toEqual(["POST /library/seed"]);
    });

    it("is idempotent: a template that exists is reported and left alone", async () => {
        const run = await apply([], existing(OFFICE, LOUNGE));

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(writes(run.fake.requests)).toEqual(["POST /library/seed"]);
        expect(JSON.parse(run.out).result.templates).toEqual([
            expect.objectContaining({
                name: "lounge",
                action: "exists",
                id: "tpl-lounge",
            }),
            expect.objectContaining({
                name: "Open office",
                action: "exists",
                id: "tpl-office",
            }),
        ]);
    });

    it("says how to change a template that exists", async () => {
        const run = await runCliFake(["content", "apply", FOLDER], {
            env: REMOTE_ENV,
            files: buildContentFiles(),
            routes: existing(OFFICE, LOUNGE),
        });

        expect(run.out).toContain("already exists");
        expect(run.out).toContain("left as it is");
        expect(run.out).toContain("delete it on the admin screen");
    });

    it("creates only the template that is not there yet", async () => {
        const run = await apply([], existing(OFFICE));

        expect(writes(run.fake.requests)).toEqual([
            "POST /library/seed",
            "POST /templates",
            `POST /maps/${MAP_ID}/apply`,
        ]);
        const names = JSON.parse(run.out).result.templates.map(
            (t: { name: string; action: string }) => `${t.name}:${t.action}`
        );
        expect(names).toEqual(["lounge:created", "Open office:exists"]);
    });

    it("finishes an existing draft with --publish", async () => {
        const files = buildContentFiles({
            [`${FOLDER}/templates/lounge.png`]: PNG_BYTES,
        });
        const run = await apply(
            ["--publish"],
            buildTemplateRoutes({
                "GET /templates": {
                    status: 200,
                    body: {
                        templates: [
                            withThumbnail(OFFICE),
                            withThumbnail(LOUNGE),
                        ],
                    },
                },
                "POST /templates/tpl-office/publish": {
                    status: 200,
                    body: { template: { ...OFFICE, status: "PUBLISHED" } },
                },
                "POST /templates/tpl-lounge/publish": {
                    status: 200,
                    body: { template: { ...LOUNGE, status: "PUBLISHED" } },
                },
            }),
            files
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(writes(run.fake.requests)).toEqual([
            "POST /library/seed",
            "POST /templates/tpl-lounge/publish",
            "POST /templates/tpl-office/publish",
        ]);
        expect(JSON.parse(run.out).result.templates).toEqual([
            expect.objectContaining({
                action: "published",
                status: "PUBLISHED",
            }),
            expect.objectContaining({
                action: "published",
                status: "PUBLISHED",
            }),
        ]);
    });

    it("leaves a template that is already published as unchanged", async () => {
        const files = buildContentFiles({
            [`${FOLDER}/templates/lounge.png`]: PNG_BYTES,
        });
        const published = (template: ReturnType<typeof buildTemplate>) => ({
            ...template,
            status: "PUBLISHED" as const,
        });
        const run = await apply(
            ["--publish"],
            existing(published(OFFICE), published(LOUNGE)),
            files
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(writes(run.fake.requests)).toEqual(["POST /library/seed"]);
        expect(
            JSON.parse(run.out).result.templates.map(
                (t: { action: string }) => t.action
            )
        ).toEqual(["unchanged", "unchanged"]);
    });

    it("does not publish a retired template", async () => {
        const files = buildContentFiles({
            [`${FOLDER}/templates/lounge.png`]: PNG_BYTES,
        });
        const retired = (template: ReturnType<typeof buildTemplate>) => ({
            ...template,
            status: "RETIRED" as const,
        });
        const run = await apply(
            ["--publish"],
            existing(retired(OFFICE), retired(LOUNGE)),
            files
        );

        expect(writes(run.fake.requests)).toEqual(["POST /library/seed"]);
        expect(JSON.parse(run.out).result.templates[0].action).toBe("exists");
    });

    it("finds a live template before a retired one with the same name", async () => {
        const run = await apply(
            [],
            existing(
                { ...OFFICE, id: "old", status: "RETIRED" },
                { ...OFFICE, id: "live" },
                LOUNGE
            )
        );

        const office = JSON.parse(run.out).result.templates.find(
            (t: { name: string }) => t.name === "Open office"
        );
        expect(office).toMatchObject({ id: "live", action: "exists" });
    });

    it("applies a folder with only templates, with no library scope needed", async () => {
        const files: FakeFiles = {
            [`${FOLDER}/templates/office.yaml`]:
                buildContentFiles()[`${FOLDER}/templates/office.yaml`],
        };
        const run = await apply(
            [],
            buildTemplateRoutes({
                "POST /library/seed": scopeError("library:write"),
            }),
            files
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(writes(run.fake.requests)[0]).toBe("POST /templates");
        expect(JSON.parse(run.out).result.library).toBeUndefined();
    });

    it("applies a folder with only a library and never reads the templates", async () => {
        const files: FakeFiles = {
            [`${FOLDER}/library.json`]:
                buildContentFiles()[`${FOLDER}/library.json`],
            [`${FOLDER}/tilesets/floor.png`]: PNG_BYTES,
            [`${FOLDER}/${ACCENT_PATH}`]: PNG_BYTES,
        };
        const run = await apply([], buildTemplateRoutes(), files);

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.requests.map((r) => new URL(r.url).pathname)).toEqual([
            "/library/seed",
        ]);
    });

    it("reports the maps folder as ignored", async () => {
        const files = buildContentFiles({
            [`${FOLDER}/maps/x.yaml`]: "kind: map\n",
        });
        const json = await apply([], buildTemplateRoutes(), files);
        const text = await runCliFake(["content", "apply", FOLDER], {
            env: REMOTE_ENV,
            files,
            routes: buildTemplateRoutes(),
        });

        expect(json.code).toBe(EXIT_CODES.OK);
        expect(JSON.parse(json.out).result.warnings[0]).toContain(
            "maps/ folder is ignored"
        );
        expect(text.out).toContain("! the maps/ folder is ignored");
        expect(writes(json.fake.requests).join(" ")).not.toContain("maps/x");
    });
});

describe("content apply --dry-run", () => {
    it("asks the server to check the library and writes nothing", async () => {
        const run = await apply(["--dry-run"]);

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(writes(run.fake.requests)).toEqual([
            "POST /library/seed?dryRun=true",
        ]);
        const { result } = JSON.parse(run.out);
        expect(result.dryRun).toBe(true);
        expect(result.library).toMatchObject({
            dryRun: true,
            counts: { tilesets: 1 },
        });
        expect(
            result.templates.map((t: { action: string }) => t.action)
        ).toEqual(["would-create", "would-create"]);
    });

    it("says what the server did not check", async () => {
        const run = await runCliFake(
            ["content", "apply", FOLDER, "--dry-run"],
            {
                env: REMOTE_ENV,
                files: buildContentFiles(),
                routes: buildTemplateRoutes(),
            }
        );

        expect(run.out).toContain(
            "the server accepts library.json and its 2 PNG files"
        );
        expect(run.out).toContain("did not decode the images");
        expect(run.out).toContain('template "Open office" would be created');
        expect(run.out).toContain("dry run: nothing was written");
    });

    it("says what --publish would do to an existing draft", async () => {
        const files = buildContentFiles({
            [`${FOLDER}/templates/lounge.png`]: PNG_BYTES,
        });
        const run = await apply(
            ["--dry-run", "--publish"],
            existing(withThumbnail(OFFICE)),
            files
        );

        expect(writes(run.fake.requests)).toEqual([
            "POST /library/seed?dryRun=true",
        ]);
        expect(
            JSON.parse(run.out).result.templates.map(
                (t: { action: string }) => t.action
            )
        ).toEqual(["would-create", "would-publish"]);
    });

    it("exits 4 and names library:write when the token lacks it", async () => {
        const run = await apply(
            ["--dry-run"],
            buildTemplateRoutes({
                "POST /library/seed?dryRun=true": scopeError("library:write"),
            })
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        expect(JSON.parse(run.out).error.fix).toContain("library:write");
    });
});

describe("content apply errors", () => {
    it("checks the folder before it looks for the URL or the token", async () => {
        const files = buildContentFiles();
        delete files[`${FOLDER}/tilesets/floor.png`];
        const run = await runCliFake(["content", "apply", FOLDER, "--json"], {
            files,
        });

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.code).toBe("CLI_CONTENT_INVALID");
        expect(run.fake.requests).toHaveLength(0);
    });

    it("sends nothing when a thumbnail is not a PNG", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes(),
            buildContentFiles({
                [`${FOLDER}/templates/office.png`]: NOT_PNG_BYTES,
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(run.fake.requests).toHaveLength(0);
    });

    it("exits 3 with a fix on an empty folder", async () => {
        const run = await apply([], buildTemplateRoutes(), {
            [`${FOLDER}/`]: "",
        });

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.fix).toContain("library.json");
        expect(run.fake.requests).toHaveLength(0);
    });

    it("exits 2 with a fix when the URL or the token is missing", async () => {
        const noUrl = await runCliFake(["content", "apply", FOLDER, "--json"], {
            env: { STANDIN_TOKEN: FAKE_TOKEN },
            files: buildContentFiles(),
        });
        const noToken = await runCliFake(
            ["content", "apply", FOLDER, "--json"],
            {
                env: { STANDIN_URL: FAKE_URL },
                files: buildContentFiles(),
            }
        );

        expect(JSON.parse(noUrl.out).error.code).toBe("CLI_REMOTE_URL_MISSING");
        expect(JSON.parse(noToken.out).error.code).toBe(
            "CLI_REMOTE_TOKEN_MISSING"
        );
        expect(noUrl.code).toBe(EXIT_CODES.USAGE);
        expect(noToken.code).toBe(EXIT_CODES.USAGE);
        expect(noUrl.fake.requests).toHaveLength(0);
    });

    it("exits 4 and names library:write when the seed is refused", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                "POST /library/seed": scopeError("library:write"),
            })
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        const { error } = JSON.parse(run.out);
        expect(error.fix).toContain("library:write");
        expect(error.details.completed).toEqual([]);
        expect(error.details.pending).toEqual([
            { target: "library", name: "library" },
            { target: "template", name: "lounge" },
            { target: "template", name: "Open office" },
        ]);
        expect(writes(run.fake.requests)).toEqual(["POST /library/seed"]);
        expect(run.out + run.err).not.toContain(FAKE_TOKEN);
    });

    it("exits 4 and names templates:read when the templates cannot be listed", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                "GET /templates": scopeError("templates:read"),
            })
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        const { error } = JSON.parse(run.out);
        expect(error.fix).toContain("templates:read");
        expect(error.details.completed).toEqual([]);
        expect(writes(run.fake.requests)).toEqual([]);
    });

    it("exits 4 and names templates:write when a template cannot be created", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                "POST /templates": scopeError("templates:write"),
            })
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        expect(JSON.parse(run.out).error.fix).toContain("templates:write");
    });

    it("exits 4 and names maps:write when a spec cannot be applied", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                [`POST /maps/${MAP_ID}/apply`]: scopeError("maps:write"),
            })
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        expect(JSON.parse(run.out).error.fix).toContain("maps:write");
    });

    it("exits 4 on a plain 401", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                "POST /library/seed": {
                    status: 401,
                    body: { error: "Unauthorized" },
                },
            })
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        expect(JSON.parse(run.out).error.fix).toContain("login");
    });

    it("exits 5 when the instance cannot be reached", async () => {
        const failure = Object.assign(new UnexpectedFailure("fetch failed"), {
            cause: { code: "ECONNREFUSED" },
        });
        const run = await apply(
            [],
            buildTemplateRoutes({ "POST /library/seed": failure })
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_API_UNREACHABLE");
        expect(error.details.completed).toEqual([]);
    });

    it("exits 3 with the files the server says are missing", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                "POST /library/seed": {
                    status: 400,
                    body: {
                        error: "library.json points to files that were not uploaded: a.png.",
                        code: "LIBRARY_SEED_FILES_MISSING",
                        paths: ["tilesets/floor.png"],
                    },
                },
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("LIBRARY_SEED_FILES_MISSING");
        expect(error.issues).toEqual([
            {
                file: "tilesets/floor.png",
                message: "the file was not uploaded",
            },
        ]);
    });

    it("exits 3 with the problems the server finds in library.json", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                "POST /library/seed": {
                    status: 400,
                    body: {
                        error: "library.json is invalid.",
                        code: "LIBRARY_SEED_FILE_INVALID",
                        issues: ["tilesets.0.name: required"],
                    },
                },
            })
        );

        expect(JSON.parse(run.out).error.issues).toEqual([
            { message: "tilesets.0.name: required" },
        ]);
    });

    it("exits 3 when the upload is too large for the server", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                "POST /library/seed": {
                    status: 413,
                    body: {
                        error: "Too large.",
                        code: "LIBRARY_SEED_TOO_LARGE",
                    },
                },
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
    });

    it("exits 6 when the map of a template is locked and reports what was done", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                [`POST /maps/${MAP_ID}/apply`]: {
                    status: 423,
                    body: {
                        error: "The map is locked.",
                        code: "MAP_LOCKED",
                        by: { id: "u1", name: "Ana" },
                        since: "2026-10-30T10:00:00.000Z",
                    },
                },
            })
        );

        expect(run.code).toBe(EXIT_CODES.CONFLICT);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("MAP_LOCKED");
        expect(error.details.by).toEqual({ id: "u1", name: "Ana" });
        expect(error.details.completed).toEqual([
            { target: "library", name: "library", action: "seeded" },
            {
                target: "template",
                name: "lounge",
                action: "created",
                id: TEMPLATE_ID,
            },
        ]);
        expect(error.details.pending).toEqual([
            { target: "template", name: "lounge" },
            { target: "template", name: "Open office" },
        ]);
        expect(error.details.unfinished).toEqual({
            name: "lounge",
            id: TEMPLATE_ID,
        });
        expect(error.fix).toContain("delete it on the admin screen");
    });

    it("exits 6 on a stale layout while applying a template", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                [`POST /maps/${MAP_ID}/apply`]: {
                    status: 409,
                    body: {
                        error: "The map changed.",
                        code: "STALE_LAYOUT_VERSION",
                        version: 12,
                    },
                },
            })
        );

        expect(run.code).toBe(EXIT_CODES.CONFLICT);
        expect(JSON.parse(run.out).error.details.version).toBe(12);
    });

    it("stops at the first failure and says what was done and what was not", async () => {
        const created = (id: string) => ({
            status: 201,
            body: {
                template: buildTemplate({ id }),
                templateId: id,
                mapId: MAP_ID,
            },
        });
        const run = await runCliFake(["content", "apply", FOLDER, "--json"], {
            env: REMOTE_ENV,
            files: buildContentFiles(),
            routes: buildTemplateRoutes({
                // Two templates are made, with their own ids.
                "POST /templates": [created("tpl-1"), created("tpl-2")],
                // The thumbnail of the second one is refused.
                "PUT /templates/tpl-2/thumbnail": {
                    status: 400,
                    body: {
                        error: "The thumbnail is not a PNG.",
                        code: "UNSUPPORTED_FILE_TYPE",
                    },
                },
            }),
        });

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("UNSUPPORTED_FILE_TYPE");
        expect(
            error.details.completed.map(
                (s: { name: string; action: string; id?: string }) =>
                    `${s.name}:${s.action}:${s.id ?? ""}`
            )
        ).toEqual([
            "library:seeded:",
            "lounge:created:tpl-1",
            "lounge:spec applied:tpl-1",
            "Open office:created:tpl-2",
            "Open office:spec applied:tpl-2",
        ]);
        expect(error.details.pending).toEqual([
            { target: "template", name: "Open office" },
        ]);
        expect(error.details.unfinished).toEqual({
            name: "Open office",
            id: "tpl-2",
        });
        expect(writes(run.fake.requests)).toHaveLength(6);
    });

    it("prints the work done and the fix on stderr for people", async () => {
        const run = await runCliFake(["content", "apply", FOLDER], {
            env: REMOTE_ENV,
            files: buildContentFiles(),
            routes: buildTemplateRoutes({
                [`POST /maps/${MAP_ID}/apply`]: scopeError("maps:write"),
            }),
        });

        expect(run.code).toBe(EXIT_CODES.AUTH);
        expect(run.out).toBe("");
        expect(run.err).toContain("error [SERVICE_TOKEN_SCOPE_MISSING]");
        expect(run.err).toContain("completed:");
        expect(run.err).toContain("pending:");
        expect(run.err).toContain("fix:");
        expect(run.err).not.toContain(FAKE_TOKEN);
    });

    it("prints one JSON document on an error, and never the token", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                "POST /templates": scopeError("templates:write"),
            })
        );

        expect(run.out.trim().split("\n")).toHaveLength(1);
        expect(run.err).toBe("");
        expect(run.out).not.toContain(FAKE_TOKEN);
    });

    it("never prints the token on a success", async () => {
        const run = await apply();

        expect(run.out + run.err).not.toContain(FAKE_TOKEN);
        expect(
            run.fake.requests.every((r) => !r.url.includes(FAKE_TOKEN))
        ).toBe(true);
    });

    it("has help with examples and the rules of an existing template", async () => {
        const run = await runCliFake(["content", "apply", "--help"]);

        expect(run.out).toContain(
            "pnpm -s standin content apply ./content --dry-run"
        );
        expect(run.out).toContain("delete it on");
        expect(run.out).toContain("Not transactional");
    });
});

const timeout = () =>
    Object.assign(new UnexpectedFailure("timed out"), { name: "TimeoutError" });

describe("content apply when the connection fails", () => {
    it("says the seed may have happened when it times out", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({ "POST /library/seed": timeout() })
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_API_UNREACHABLE");
        expect(error.message).toContain("TIMEOUT");
        expect(error.details.uncertain).toEqual({
            target: "library",
            name: "library",
        });
        expect(error.details.completed).toEqual([]);
        expect(error.fix).toContain("may have happened");
        expect(error.fix).toContain("pnpm -s standin library list");
    });

    it("says the creation of a template may have happened when it times out", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({ "POST /templates": timeout() })
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        const { error } = JSON.parse(run.out);
        expect(error.details.uncertain).toEqual({
            target: "template",
            name: "lounge",
        });
        expect(error.details.completed).toEqual([
            { target: "library", name: "library", action: "seeded" },
        ]);
        expect(error.details.unfinished).toBeUndefined();
        expect(error.fix).toContain("pnpm -s standin template list");
    });

    it("reports a template that was made and lost its connection after", async () => {
        const reset = Object.assign(new UnexpectedFailure("reset"), {
            cause: { code: "ECONNRESET" },
        });
        const run = await apply(
            [],
            buildTemplateRoutes({
                [`PUT /templates/${TEMPLATE_ID}/thumbnail`]: reset,
            })
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        const { error } = JSON.parse(run.out);
        expect(error.message).toContain("ECONNRESET");
        expect(
            error.details.completed.map((s: { action: string }) => s.action)
        ).toEqual([
            "seeded",
            "created",
            "spec applied",
            "created",
            "spec applied",
        ]);
        expect(error.details.uncertain).toEqual({
            target: "template",
            name: "Open office",
        });
        expect(error.details.unfinished).toEqual({
            name: "Open office",
            id: TEMPLATE_ID,
        });
        expect(error.fix).toContain("was created but not finished");
        expect(error.fix).toContain("may have happened");
    });

    it("does not call a failed read uncertain", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({ "GET /templates": timeout() })
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        expect(JSON.parse(run.out).error.details.uncertain).toBeUndefined();
    });

    it("does not call a failed dry run uncertain", async () => {
        const run = await apply(
            ["--dry-run"],
            buildTemplateRoutes({ "POST /library/seed?dryRun=true": timeout() })
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        expect(JSON.parse(run.out).error.details.uncertain).toBeUndefined();
    });

    it("gives each call the time that fits it", async () => {
        const run = await apply();

        const by = (method: string, suffix: string) =>
            run.fake.requests.find(
                (r) => r.method === method && r.url.endsWith(suffix)
            )?.timeoutMs;
        expect(by("POST", "/library/seed")).toBe(300_000);
        expect(by("PUT", "/thumbnail")).toBe(120_000);
        expect(by("POST", "/templates")).toBe(60_000);
        expect(by("POST", "/apply")).toBe(60_000);
        expect(by("GET", "/templates")).toBeUndefined();
    });
});

describe("content apply with answers that are not the API", () => {
    it.each([
        ["templates that is not a list", { templates: "nope" }],
        ["templates with an entry that is not a template", { templates: [1] }],
        [
            "templates with an entry without a name",
            { templates: [{ id: "a" }] },
        ],
    ])("exits 5 on GET /templates with %s", async (_label, body) => {
        const run = await apply(
            [],
            buildTemplateRoutes({ "GET /templates": { status: 200, body } })
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_API_RESPONSE_INVALID");
        expect(error.details.completed).toEqual([]);
    });

    it("exits 5 on a seed answer that has no sections", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                "POST /library/seed": { status: 200, body: {} },
            })
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        expect(JSON.parse(run.out).error.code).toBe("CLI_API_RESPONSE_INVALID");
    });

    it("exits 5 on a dry run answer that has no counts", async () => {
        const run = await apply(
            ["--dry-run"],
            buildTemplateRoutes({
                "POST /library/seed?dryRun=true": { status: 200, body: {} },
            })
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
    });

    it("exits 5 on a created template that has no ids", async () => {
        const run = await apply(
            [],
            buildTemplateRoutes({
                "POST /templates": { status: 201, body: { template: {} } },
            })
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        expect(JSON.parse(run.out).error.details.completed).toEqual([
            { target: "library", name: "library", action: "seeded" },
        ]);
    });
});

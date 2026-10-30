import { describe, expect, it } from "vitest";
import { EXIT_CODES } from "../../../consts/exitCodes";
import {
    NOT_PNG_BYTES,
    PNG_BYTES,
    TEMPLATE_ID,
    buildTemplate,
    buildTemplateRoutes,
} from "../../../testing/contentFixtures";
import {
    LAYOUT_VERSION,
    MAP_ID,
    UNKNOWN_KEY_SPEC,
    VALID_SPEC,
} from "../../../testing/mapFixtures";
import {
    FAKE_TOKEN,
    FAKE_URL,
    REMOTE_ENV,
    runCliFake,
} from "../../../testing/runCliFake";
import { UnexpectedFailure } from "../../../testing/UnexpectedFailure";
import type { FakeFiles, FakeHttpRoutes, HttpRequest } from "../../../types";

const SPEC_PATH = "/work/office.yaml";
const THUMB_PATH = "/work/office.png";
const TEMPLATE_SPEC = VALID_SPEC.replace("kind: map", "kind: template");

const files = (extra: FakeFiles = {}): FakeFiles => ({
    [SPEC_PATH]: TEMPLATE_SPEC,
    [THUMB_PATH]: PNG_BYTES,
    ...extra,
});

const options = (
    routes: FakeHttpRoutes = buildTemplateRoutes(),
    extra = {}
) => ({
    env: REMOTE_ENV,
    files: files(),
    routes,
    ...extra,
});

const writes = (requests: HttpRequest[]): string[] =>
    requests
        .filter((request) => request.method !== "GET")
        .map((request) => `${request.method} ${new URL(request.url).pathname}`);

const scopeError = (scope: string) => ({
    status: 403,
    body: {
        error: `This service token does not have the "${scope}" scope.`,
        code: "SERVICE_TOKEN_SCOPE_MISSING",
    },
});

describe("template create", () => {
    it("creates a draft and does nothing else by default", async () => {
        const run = await runCliFake(
            ["template", "create", "Open office", "--size-tier", "s", "--json"],
            options()
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(writes(run.fake.requests)).toEqual(["POST /templates"]);
        const [request] = run.fake.requests;
        expect(JSON.parse(request.body ?? "{}")).toEqual({
            name: "Open office",
            sizeTier: "S",
        });
        expect(JSON.parse(run.out)).toMatchObject({
            ok: true,
            command: "template create",
            result: {
                dryRun: false,
                mapId: MAP_ID,
                published: false,
                thumbnailUploaded: false,
                template: { id: TEMPLATE_ID, status: "DRAFT" },
            },
        });
    });

    it("sends the description and says how to publish", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--size-tier",
                "S",
                "--description",
                "Two rooms",
            ],
            options()
        );

        expect(JSON.parse(run.fake.requests[0].body ?? "{}").description).toBe(
            "Two rooms"
        );
        expect(run.out).toContain(`created the template "Open office"`);
        expect(run.out).toContain(`template publish ${TEMPLATE_ID}`);
    });

    it("builds the spec, uploads the thumbnail and publishes, in that order", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--spec",
                SPEC_PATH,
                "--thumbnail",
                THUMB_PATH,
                "--publish",
                "--json",
            ],
            options()
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(writes(run.fake.requests)).toEqual([
            "POST /templates",
            `POST /maps/${MAP_ID}/apply`,
            `PUT /templates/${TEMPLATE_ID}/thumbnail`,
            `POST /templates/${TEMPLATE_ID}/publish`,
        ]);

        const apply = run.fake.requests.find((r) => r.url.endsWith("/apply"));
        const sent = JSON.parse(apply?.body ?? "{}");
        expect(sent.baseVersion).toBe(LAYOUT_VERSION);
        expect(sent.validateOnly).toBe(false);
        expect(sent.ops.length).toBeGreaterThan(0);

        const result = JSON.parse(run.out).result;
        expect(result).toMatchObject({
            thumbnailUploaded: true,
            published: true,
            template: { status: "PUBLISHED" },
        });
        expect(result.opCount).toBe(sent.ops.length);
    });

    it("sends the thumbnail as a multipart part, with no JSON header", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--size-tier",
                "S",
                "--thumbnail",
                THUMB_PATH,
            ],
            options()
        );

        const put = run.fake.requests.find((r) => r.method === "PUT");
        expect(put?.body).toBeUndefined();
        expect(put?.headers["content-type"]).toBeUndefined();
        expect(put?.headers.authorization).toBe(`Bearer ${FAKE_TOKEN}`);
        const part = put?.form?.get("thumbnail") as File;
        expect(part.type).toBe("image/png");
        expect(new Uint8Array(await part.arrayBuffer())).toEqual(PNG_BYTES);
    });

    it("takes the size tier from the spec", async () => {
        const run = await runCliFake(
            ["template", "create", "Open office", "--spec", SPEC_PATH],
            options()
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(JSON.parse(run.fake.requests[0].body ?? "{}").sizeTier).toBe(
            "S"
        );
    });

    it("refuses a size tier that differs from the spec", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--size-tier",
                "M",
                "--spec",
                SPEC_PATH,
                "--json",
            ],
            options()
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.code).toBe(
            "CLI_TEMPLATE_SIZE_TIER_MISMATCH"
        );
        expect(run.fake.requests).toHaveLength(0);
    });

    it("needs a size tier from the flag or the spec", async () => {
        const run = await runCliFake(
            ["template", "create", "Open office", "--json"],
            options()
        );

        expect(run.code).toBe(EXIT_CODES.USAGE);
        expect(JSON.parse(run.out).error.code).toBe("CLI_SIZE_TIER_MISSING");
        expect(run.fake.requests).toHaveLength(0);
    });

    it("refuses a size tier that does not exist", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--size-tier",
                "XXL",
                "--json",
            ],
            options()
        );

        expect(run.code).toBe(EXIT_CODES.USAGE);
        expect(JSON.parse(run.out).error.code).toBe("CLI_SIZE_TIER_INVALID");
    });

    it("refuses --publish without a thumbnail before any request", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--size-tier",
                "S",
                "--publish",
                "--json",
            ],
            options()
        );

        expect(run.code).toBe(EXIT_CODES.USAGE);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_PUBLISH_NEEDS_THUMBNAIL");
        expect(error.fix).toContain("--thumbnail");
        expect(run.fake.requests).toHaveLength(0);
    });

    it("refuses a thumbnail that is not a PNG before any request", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--size-tier",
                "S",
                "--thumbnail",
                "/work/photo.jpg",
                "--json",
            ],
            options(buildTemplateRoutes(), {
                files: files({ "/work/photo.jpg": NOT_PNG_BYTES }),
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_TEMPLATE_THUMBNAIL_INVALID");
        expect(error.message).toContain("not a PNG");
        expect(run.fake.requests).toHaveLength(0);
    });

    it("refuses a thumbnail that does not exist", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--size-tier",
                "S",
                "--thumbnail",
                "/work/missing.png",
                "--json",
            ],
            options()
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.message).toContain("does not exist");
        expect(run.fake.requests).toHaveLength(0);
    });

    it("refuses a spec that is not of kind template", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--spec",
                SPEC_PATH,
                "--json",
            ],
            options(buildTemplateRoutes(), {
                files: files({ [SPEC_PATH]: VALID_SPEC }),
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.code).toBe("CLI_TEMPLATE_SPEC_KIND");
        expect(run.fake.requests).toHaveLength(0);
    });

    it("exits 3 listing the issues of a spec that breaks the schema", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--spec",
                SPEC_PATH,
                "--json",
            ],
            options(buildTemplateRoutes(), {
                files: files({ [SPEC_PATH]: "kind: world\n" }),
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.code).toBe("CLI_SPEC_INVALID");
        expect(run.fake.requests).toHaveLength(0);
    });

    it("--dry-run checks the local input and sends nothing at all", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--spec",
                SPEC_PATH,
                "--thumbnail",
                THUMB_PATH,
                "--publish",
                "--dry-run",
                "--json",
            ],
            options()
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.requests).toHaveLength(0);
        expect(JSON.parse(run.out).result).toEqual({
            dryRun: true,
            valid: true,
            name: "Open office",
            sizeTier: "S",
            steps: [
                "create",
                "apply the spec",
                "upload the thumbnail",
                "publish",
            ],
        });
    });

    it("--dry-run needs no URL or token and says what it did not check", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--spec",
                SPEC_PATH,
                "--dry-run",
            ],
            { files: files() }
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.out).toContain("only parsed here");
        expect(run.out).toContain("nothing was written");
    });

    it("--dry-run still refuses a bad thumbnail", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "Open office",
                "--size-tier",
                "S",
                "--thumbnail",
                "/work/photo.jpg",
                "--dry-run",
            ],
            { files: files({ "/work/photo.jpg": NOT_PNG_BYTES }) }
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
    });

    it("exits 2 with a fix when the URL or the token is missing", async () => {
        const noUrl = await runCliFake(
            ["template", "create", "x1", "--size-tier", "S", "--json"],
            options(buildTemplateRoutes(), {
                env: { STANDIN_TOKEN: FAKE_TOKEN },
            })
        );
        const noToken = await runCliFake(
            ["template", "create", "x1", "--size-tier", "S", "--json"],
            options(buildTemplateRoutes(), { env: { STANDIN_URL: FAKE_URL } })
        );

        expect(noUrl.code).toBe(EXIT_CODES.USAGE);
        expect(JSON.parse(noUrl.out).error.code).toBe("CLI_REMOTE_URL_MISSING");
        expect(noToken.code).toBe(EXIT_CODES.USAGE);
        expect(JSON.parse(noToken.out).error.code).toBe(
            "CLI_REMOTE_TOKEN_MISSING"
        );
        expect(noUrl.fake.requests).toHaveLength(0);
        expect(noToken.fake.requests).toHaveLength(0);
    });

    it("exits 4 and names templates:write when the token lacks it", async () => {
        const run = await runCliFake(
            ["template", "create", "x1", "--size-tier", "S", "--json"],
            options(
                buildTemplateRoutes({
                    "POST /templates": scopeError("templates:write"),
                })
            )
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
        expect(error.fix).toContain("templates:write");
        expect(error.details.completed).toEqual([]);
        expect(run.out + run.err).not.toContain(FAKE_TOKEN);
    });

    it("exits 4 and names maps:write when the spec cannot be applied", async () => {
        const run = await runCliFake(
            ["template", "create", "x1", "--spec", SPEC_PATH, "--json"],
            options(
                buildTemplateRoutes({
                    [`POST /maps/${MAP_ID}/apply`]: scopeError("maps:write"),
                })
            )
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        const { error } = JSON.parse(run.out);
        expect(error.fix).toContain("maps:write");
        expect(error.details.completed).toEqual([
            expect.objectContaining({ action: "created", id: TEMPLATE_ID }),
        ]);
        expect(error.details.unfinished).toEqual({
            name: "x1",
            id: TEMPLATE_ID,
        });
        expect(error.fix).toContain("was created but not finished");
    });

    it("exits 4 on a plain 401", async () => {
        const run = await runCliFake(
            ["template", "create", "x1", "--size-tier", "S", "--json"],
            options(
                buildTemplateRoutes({
                    "POST /templates": {
                        status: 401,
                        body: { error: "Unauthorized" },
                    },
                })
            )
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        expect(JSON.parse(run.out).error.fix).toContain("login");
    });

    it("exits 5 when the instance cannot be reached", async () => {
        const failure = Object.assign(new UnexpectedFailure("fetch failed"), {
            cause: { code: "ECONNREFUSED" },
        });
        const run = await runCliFake(
            ["template", "create", "x1", "--size-tier", "S", "--json"],
            options(buildTemplateRoutes({ "POST /templates": failure }))
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        expect(JSON.parse(run.out).error.code).toBe("CLI_API_UNREACHABLE");
    });

    it("exits 6 on a conflict while applying the spec and reports the draft", async () => {
        const run = await runCliFake(
            [
                "template",
                "create",
                "x1",
                "--spec",
                SPEC_PATH,
                "--thumbnail",
                THUMB_PATH,
                "--json",
            ],
            options(
                buildTemplateRoutes({
                    [`POST /maps/${MAP_ID}/apply`]: {
                        status: 409,
                        body: {
                            error: "The map changed.",
                            code: "STALE_LAYOUT_VERSION",
                            version: 9,
                        },
                    },
                })
            )
        );

        expect(run.code).toBe(EXIT_CODES.CONFLICT);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("STALE_LAYOUT_VERSION");
        expect(error.details).toMatchObject({ version: 9 });
        expect(error.details.completed).toHaveLength(1);
        expect(writes(run.fake.requests)).not.toContain(
            `PUT /templates/${TEMPLATE_ID}/thumbnail`
        );
    });

    it("exits 6 when an editor holds the map", async () => {
        const run = await runCliFake(
            ["template", "create", "x1", "--spec", SPEC_PATH, "--json"],
            options(
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
            )
        );

        expect(run.code).toBe(EXIT_CODES.CONFLICT);
        expect(JSON.parse(run.out).error.details.by).toEqual({
            id: "u1",
            name: "Ana",
        });
    });

    it("exits 3 when the spec does not fit the library, after the draft exists", async () => {
        const run = await runCliFake(
            ["template", "create", "x1", "--spec", SPEC_PATH, "--json"],
            options(buildTemplateRoutes(), {
                files: files({
                    [SPEC_PATH]: UNKNOWN_KEY_SPEC.replace(
                        "kind: map",
                        "kind: template"
                    ),
                }),
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_SPEC_INVALID");
        expect(error.issues[0].code).toBe("AUTHORING_UNKNOWN_KEY");
        expect(error.details.unfinished.id).toBe(TEMPLATE_ID);
    });

    it("exits 3 with the issues the server lists", async () => {
        const run = await runCliFake(
            ["template", "create", "xx", "--size-tier", "S", "--json"],
            options(
                buildTemplateRoutes({
                    "POST /templates": {
                        status: 400,
                        body: {
                            error: "Invalid data.",
                            fieldErrors: { name: ["The name is too short."] },
                        },
                    },
                })
            )
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.issues).toHaveLength(1);
    });
});

describe("template create, names and lost connections", () => {
    it("refuses a name the server would refuse, before any request", async () => {
        const run = await runCliFake(
            ["template", "create", "x", "--size-tier", "S", "--json"],
            options()
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.code).toBe(
            "CLI_TEMPLATE_NAME_INVALID"
        );
        expect(run.fake.requests).toHaveLength(0);
    });

    it("says the creation may have happened when the call times out", async () => {
        const timeout = Object.assign(new UnexpectedFailure("timed out"), {
            name: "TimeoutError",
        });
        const run = await runCliFake(
            ["template", "create", "Open office", "--size-tier", "S", "--json"],
            options(buildTemplateRoutes({ "POST /templates": timeout }))
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        const { error } = JSON.parse(run.out);
        expect(error.details.uncertain).toEqual({
            target: "template",
            name: "Open office",
        });
        expect(error.fix).toContain("pnpm -s standin template list");
        expect(run.fake.requests[0].timeoutMs).toBe(60_000);
    });
});

describe("template get", () => {
    it("prints the template for people and for a script", async () => {
        const text = await runCliFake(
            ["template", "get", TEMPLATE_ID],
            options()
        );
        const json = await runCliFake(
            ["template", "get", TEMPLATE_ID, "--json"],
            options()
        );

        expect(text.code).toBe(EXIT_CODES.OK);
        expect(text.out).toContain(`Open office (${TEMPLATE_ID})`);
        expect(text.out).toContain("status: DRAFT");
        expect(text.out).toContain(`map: ${MAP_ID}`);
        expect(JSON.parse(json.out)).toMatchObject({
            command: "template get",
            result: { template: { id: TEMPLATE_ID, mapId: MAP_ID } },
        });
        expect(writes(text.fake.requests)).toEqual([]);
    });

    it("exits 3 for a template that does not exist", async () => {
        const run = await runCliFake(
            ["template", "get", "nope", "--json"],
            options(
                buildTemplateRoutes({
                    "GET /templates/nope": {
                        status: 404,
                        body: {
                            error: "Template not found.",
                            code: "MAP_TEMPLATE_NOT_FOUND",
                        },
                    },
                })
            )
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.code).toBe("MAP_TEMPLATE_NOT_FOUND");
    });

    it("exits 5 on an answer that is not a template", async () => {
        const run = await runCliFake(
            ["template", "get", TEMPLATE_ID, "--json"],
            options(
                buildTemplateRoutes({
                    [`GET /templates/${TEMPLATE_ID}`]: {
                        status: 200,
                        body: { template: "nope" },
                    },
                })
            )
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
    });

    it("exits 4 and names templates:read", async () => {
        const run = await runCliFake(
            ["template", "get", TEMPLATE_ID, "--json"],
            options(
                buildTemplateRoutes({
                    [`GET /templates/${TEMPLATE_ID}`]:
                        scopeError("templates:read"),
                })
            )
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        expect(JSON.parse(run.out).error.fix).toContain("templates:read");
    });

    it("exits 2 without a URL", async () => {
        const run = await runCliFake(
            ["template", "get", TEMPLATE_ID, "--json"],
            {
                env: { STANDIN_TOKEN: FAKE_TOKEN },
            }
        );

        expect(run.code).toBe(EXIT_CODES.USAGE);
    });
});

describe("template list", () => {
    const listRoutes = (templates = [buildTemplate()]) =>
        buildTemplateRoutes({
            "GET /templates": { status: 200, body: { templates } },
            "GET /templates?sizeTier=S": { status: 200, body: { templates } },
        });

    it("lists the templates", async () => {
        const run = await runCliFake(
            ["template", "list"],
            options(listRoutes())
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.out).toContain("templates (1)");
        expect(run.out).toContain(`${TEMPLATE_ID}  DRAFT  S  Open office`);
    });

    it("keeps one size tier", async () => {
        const run = await runCliFake(
            ["template", "list", "--size-tier", "s", "--json"],
            options(listRoutes())
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.requests[0].url).toBe(
            `${FAKE_URL}/templates?sizeTier=S`
        );
        expect(JSON.parse(run.out).result.templates).toHaveLength(1);
    });

    it("exits 4 and names templates:read", async () => {
        const run = await runCliFake(
            ["template", "list", "--json"],
            options(
                buildTemplateRoutes({
                    "GET /templates": scopeError("templates:read"),
                })
            )
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        expect(JSON.parse(run.out).error.fix).toContain("templates:read");
    });

    it("exits 5 when the instance cannot be reached", async () => {
        const run = await runCliFake(
            ["template", "list", "--json"],
            options(
                buildTemplateRoutes({
                    "GET /templates": Object.assign(
                        new UnexpectedFailure("x"),
                        {
                            cause: { code: "ENOTFOUND" },
                        }
                    ),
                })
            )
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
    });
});

describe("template publish", () => {
    it("publishes the template", async () => {
        const run = await runCliFake(
            ["template", "publish", TEMPLATE_ID, "--json"],
            options()
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(writes(run.fake.requests)).toEqual([
            `POST /templates/${TEMPLATE_ID}/publish`,
        ]);
        expect(JSON.parse(run.out).result).toMatchObject({
            dryRun: false,
            template: { status: "PUBLISHED" },
        });
    });

    it("--dry-run reads the template and writes nothing", async () => {
        const run = await runCliFake(
            ["template", "publish", TEMPLATE_ID, "--dry-run"],
            options()
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.requests.map((r) => r.method)).toEqual(["GET"]);
        expect(run.out).toContain("is a draft and can be published");
    });

    it("--dry-run says a template that is not a draft cannot be published", async () => {
        const run = await runCliFake(
            ["template", "publish", TEMPLATE_ID, "--dry-run"],
            options(
                buildTemplateRoutes({
                    [`GET /templates/${TEMPLATE_ID}`]: {
                        status: 200,
                        body: {
                            template: buildTemplate({ status: "PUBLISHED" }),
                        },
                    },
                })
            )
        );

        expect(run.out).toContain("is PUBLISHED, not a draft");
    });

    it("exits 6 when the server says it is not a draft", async () => {
        const run = await runCliFake(
            ["template", "publish", TEMPLATE_ID, "--json"],
            options(
                buildTemplateRoutes({
                    [`POST /templates/${TEMPLATE_ID}/publish`]: {
                        status: 409,
                        body: {
                            error: "Not a draft.",
                            code: "MAP_TEMPLATE_NOT_DRAFT",
                        },
                    },
                })
            )
        );

        expect(run.code).toBe(EXIT_CODES.CONFLICT);
    });

    it("exits 4 and names templates:write", async () => {
        const run = await runCliFake(
            ["template", "publish", TEMPLATE_ID, "--json"],
            options(
                buildTemplateRoutes({
                    [`POST /templates/${TEMPLATE_ID}/publish`]:
                        scopeError("templates:write"),
                })
            )
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        expect(JSON.parse(run.out).error.fix).toContain("templates:write");
    });
});

describe("template help", () => {
    it.each(["create", "get", "list", "publish"])(
        "%s has examples with pnpm -s",
        async (name) => {
            const run = await runCliFake(["template", name, "--help"]);

            expect(run.code).toBe(EXIT_CODES.OK);
            expect(run.out).toContain("pnpm -s standin template");
        }
    );
});

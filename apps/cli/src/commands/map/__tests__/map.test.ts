import { describe, expect, it } from "vitest";
import { UnexpectedFailure } from "../../../testing/UnexpectedFailure";
import { EXIT_CODES } from "../../../consts/exitCodes";
import {
    AREA_SPEC,
    LAYOUT_VERSION,
    MAP_ID,
    UNKNOWN_KEY_SPEC,
    VALID_SPEC,
    buildPalette,
    buildRender,
} from "../../../testing/mapFixtures";
import {
    FAKE_TOKEN,
    FAKE_URL,
    REMOTE_ENV,
    runCliFake,
} from "../../../testing/runCliFake";
import type { FakeHttpRoutes } from "../../../types";

const SPEC_PATH = "/specs/office.yaml";
const RENDER = `GET /maps/${MAP_ID}/render`;
const LIBRARY = `GET /maps/${MAP_ID}/library`;
const APPLY = `POST /maps/${MAP_ID}/apply`;

const published = {
    version: LAYOUT_VERSION + 1,
    idMap: {},
    limits: { objectsUsed: 1, objectsMax: 100 },
};

const readRoutes = (): FakeHttpRoutes => ({
    [RENDER]: { status: 200, body: buildRender() },
    [LIBRARY]: { status: 200, body: { library: buildPalette() } },
});

const options = (
    routes: FakeHttpRoutes = readRoutes(),
    spec: string = VALID_SPEC
) => ({
    env: REMOTE_ENV,
    files: { [SPEC_PATH]: spec },
    routes,
});

const validate = (extra: string[] = []) => [
    "map",
    "validate",
    SPEC_PATH,
    "--map",
    MAP_ID,
    ...extra,
];
const apply = (extra: string[] = []) => [
    "map",
    "apply",
    SPEC_PATH,
    "--map",
    MAP_ID,
    ...extra,
];

describe("map validate", () => {
    it("compiles the spec on the map and writes nothing", async () => {
        const run = await runCliFake(validate(["--json"]), options());

        expect(run.code).toBe(EXIT_CODES.OK);
        const document = JSON.parse(run.out);
        expect(document).toMatchObject({
            ok: true,
            command: "map validate",
            result: {
                valid: true,
                mapId: MAP_ID,
                kind: "map",
                layoutVersion: LAYOUT_VERSION,
            },
        });
        expect(document.result.opCount).toBeGreaterThan(0);
        expect(run.fake.requests.map((r) => r.method)).toEqual(["GET", "GET"]);
    });

    it("sends the token in the header only", async () => {
        const run = await runCliFake(validate(), options());

        expect(run.fake.requests[0].headers.authorization).toBe(
            `Bearer ${FAKE_TOKEN}`
        );
        expect(run.fake.requests[0].url).not.toContain(FAKE_TOKEN);
        expect(run.out + run.err).not.toContain(FAKE_TOKEN);
    });

    it("prints a short line for people", async () => {
        const run = await runCliFake(validate(), options());

        expect(run.out).toContain("the spec is valid");
        expect(run.out).toContain(MAP_ID);
    });

    it("exits 3 with the issues of a key the library does not have", async () => {
        const run = await runCliFake(
            validate(["--json"]),
            options(readRoutes(), UNKNOWN_KEY_SPEC)
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_SPEC_INVALID");
        expect(error.issues).toEqual([
            expect.objectContaining({
                code: "AUTHORING_UNKNOWN_KEY",
                path: "objects[0].asset",
                message: expect.any(String),
            }),
        ]);
    });

    it("lists the issues in the text output", async () => {
        const run = await runCliFake(
            validate(),
            options(readRoutes(), UNKNOWN_KEY_SPEC)
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(run.err).toContain("AUTHORING_UNKNOWN_KEY objects[0].asset");
    });

    it("exits 3 with the issues of a spec that breaks the schema, without the network", async () => {
        const run = await runCliFake(
            validate(["--json"]),
            options(readRoutes(), "kind: world\n")
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.issues[0].path).toBe("kind");
        expect(run.fake.requests).toHaveLength(0);
    });

    it("exits 3 on a spec that is not YAML", async () => {
        const run = await runCliFake(
            validate(["--json"]),
            options(readRoutes(), "kind: [map")
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.issues[0].code).toBe(
            "AUTHORING_SPEC_PARSE_ERROR"
        );
    });

    it("refuses an area spec", async () => {
        const run = await runCliFake(
            validate(["--json"]),
            options(readRoutes(), AREA_SPEC)
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.code).toBe(
            "CLI_SPEC_KIND_UNSUPPORTED"
        );
        expect(run.fake.requests).toHaveLength(0);
    });

    it("exits 3 when the file does not exist", async () => {
        const run = await runCliFake(validate(["--json"]), {
            env: REMOTE_ENV,
            routes: readRoutes(),
        });

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error).toMatchObject({
            code: "CLI_SPEC_UNREADABLE",
            path: SPEC_PATH,
        });
    });

    it("requires --map and never asks for it", async () => {
        const run = await runCliFake(["map", "validate", SPEC_PATH, "--json"], {
            ...options(),
            interactive: true,
            answer: "map-1",
        });

        expect(run.code).toBe(EXIT_CODES.USAGE);
        expect(JSON.parse(run.out).error.code).toBe("CLI_USAGE");
        expect(run.fake.io.ask).not.toHaveBeenCalled();
    });

    it("reads the instance from the login file", async () => {
        const run = await runCliFake(validate(), {
            ...options(),
            env: {},
            saved: { url: FAKE_URL, token: FAKE_TOKEN },
        });

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.requests[0].url).toBe(
            `${FAKE_URL}/maps/${MAP_ID}/render`
        );
    });

    it("exits 2 with a fix when the URL is missing", async () => {
        const run = await runCliFake(validate(["--json"]), {
            ...options(),
            env: { STANDIN_TOKEN: FAKE_TOKEN },
        });

        expect(run.code).toBe(EXIT_CODES.USAGE);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_REMOTE_URL_MISSING");
        expect(error.fix).toContain("STANDIN_URL");
        expect(run.fake.requests).toHaveLength(0);
    });

    it("exits 2 with a fix when the token is missing", async () => {
        const run = await runCliFake(validate(["--json"]), {
            ...options(),
            env: { STANDIN_URL: FAKE_URL },
        });

        expect(run.code).toBe(EXIT_CODES.USAGE);
        expect(JSON.parse(run.out).error.code).toBe("CLI_REMOTE_TOKEN_MISSING");
    });

    it("exits 4 and names the scope a token lacks", async () => {
        const run = await runCliFake(
            validate(["--json"]),
            options({
                [RENDER]: {
                    status: 403,
                    body: {
                        error: 'This service token does not have the "maps:read" scope.',
                        code: "SERVICE_TOKEN_SCOPE_MISSING",
                    },
                },
            })
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
        expect(error.fix).toContain("maps:read");
    });

    it("exits 4 and says to use another admin when the owner is invalid", async () => {
        const run = await runCliFake(
            validate(["--json"]),
            options({
                [RENDER]: {
                    status: 401,
                    body: {
                        error: "The admin who issued this token is no longer an active admin.",
                        code: "SERVICE_TOKEN_OWNER_INVALID",
                    },
                },
            })
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("SERVICE_TOKEN_OWNER_INVALID");
        expect(error.fix).toContain("another token with an active admin");
        expect(run.out + run.err).not.toContain(FAKE_TOKEN);
    });

    it("exits 4 on a plain 401 with a generic fix", async () => {
        const run = await runCliFake(
            validate(["--json"]),
            options({
                [RENDER]: { status: 401, body: { error: "Unauthorized" } },
            })
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        expect(JSON.parse(run.out).error.fix).toContain("login");
    });

    it("exits 5 when the instance cannot be reached", async () => {
        const failure = Object.assign(new UnexpectedFailure("fetch failed"), {
            cause: { code: "ECONNREFUSED" },
        });
        const run = await runCliFake(
            validate(["--json"]),
            options({ [RENDER]: failure })
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_API_UNREACHABLE");
        expect(error.message).toContain("ECONNREFUSED");
        expect(run.out + run.err).not.toContain(FAKE_TOKEN);
    });

    it("exits 1 on a server error", async () => {
        const run = await runCliFake(
            validate(["--json"]),
            options({ [RENDER]: { status: 500, body: undefined } })
        );

        expect(run.code).toBe(EXIT_CODES.INTERNAL);
    });

    it("exits 3 when the map does not exist", async () => {
        const run = await runCliFake(validate(["--json"]), options({}));

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.code).toBe("CLI_API_REQUEST_FAILED");
    });
});

describe("map apply", () => {
    const applyRoutes = (answer: object = published): FakeHttpRoutes => ({
        ...readRoutes(),
        [APPLY]: { status: 200, body: answer },
    });

    it("sends the ops with the version just read", async () => {
        const run = await runCliFake(apply(["--json"]), options(applyRoutes()));

        expect(run.code).toBe(EXIT_CODES.OK);
        const sent = run.fake.requests.find((r) => r.method === "POST");
        const body = JSON.parse(sent?.body ?? "{}");
        expect(body.baseVersion).toBe(LAYOUT_VERSION);
        expect(body.validateOnly).toBe(false);
        expect(body.ops.length).toBeGreaterThan(0);
        expect(sent?.headers["content-type"]).toBe("application/json");
        expect(JSON.parse(run.out)).toMatchObject({
            ok: true,
            command: "map apply",
            result: {
                dryRun: false,
                mapId: MAP_ID,
                version: LAYOUT_VERSION + 1,
                opCount: body.ops.length,
            },
        });
    });

    it("prints short lines for people", async () => {
        const run = await runCliFake(apply(), options(applyRoutes()));

        expect(run.out).toContain(`layout version ${LAYOUT_VERSION + 1}`);
        expect(run.out).toContain("objects: 1 of 100");
    });

    it("uses --base-version when given", async () => {
        const run = await runCliFake(
            apply(["--base-version", "3"]),
            options(applyRoutes())
        );

        const sent = run.fake.requests.find((r) => r.method === "POST");
        expect(JSON.parse(sent?.body ?? "{}").baseVersion).toBe(3);
    });

    it.each(["0", "abc", "1.5", "-2"])(
        "refuses --base-version %s",
        async (value) => {
            const run = await runCliFake(
                apply(["--base-version", value, "--json"]),
                options(applyRoutes())
            );

            expect(run.code).toBe(EXIT_CODES.USAGE);
            expect(JSON.parse(run.out).error.code).toBe(
                "CLI_BASE_VERSION_INVALID"
            );
            expect(run.fake.requests).toHaveLength(0);
        }
    );

    it("--dry-run sends validateOnly and reports nothing written", async () => {
        const run = await runCliFake(
            apply(["--dry-run", "--json"]),
            options(applyRoutes({ valid: true }))
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        const sent = run.fake.requests.find((r) => r.method === "POST");
        expect(JSON.parse(sent?.body ?? "{}").validateOnly).toBe(true);
        expect(JSON.parse(run.out).result).toMatchObject({
            dryRun: true,
            valid: true,
        });
    });

    it("does not send anything when the spec is invalid", async () => {
        const run = await runCliFake(
            apply(["--json"]),
            options(applyRoutes(), UNKNOWN_KEY_SPEC)
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(run.fake.requests.some((r) => r.method === "POST")).toBe(false);
    });

    it("exits 6 on a stale layout and carries the current version", async () => {
        const run = await runCliFake(
            apply(["--json"]),
            options({
                ...readRoutes(),
                [APPLY]: {
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
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("STALE_LAYOUT_VERSION");
        expect(error.details).toEqual({ version: 12 });
        expect(error.fix).toContain("--base-version");
    });

    it("exits 6 on a locked map and says who holds it", async () => {
        const run = await runCliFake(
            apply(),
            options({
                ...readRoutes(),
                [APPLY]: {
                    status: 423,
                    body: {
                        error: "Map is locked by another editor.",
                        code: "MAP_LOCKED",
                        by: { id: "u1", name: "Ana" },
                        since: "2026-10-30T10:00:00.000Z",
                    },
                },
            })
        );

        expect(run.code).toBe(EXIT_CODES.CONFLICT);
        expect(run.err).toContain("MAP_LOCKED");
        expect(run.err).toContain("Ana");
    });

    it("exits 3 with the issues of the server", async () => {
        const run = await runCliFake(
            apply(["--json"]),
            options({
                ...readRoutes(),
                [APPLY]: {
                    status: 422,
                    body: {
                        error: "The draft has an operation that cannot be applied.",
                        code: "PUBLISH_INVALID",
                        errors: [
                            {
                                opIndex: 2,
                                code: "OUT_OF_BOUNDS",
                                path: "ops[2]",
                                message: "outside the map",
                            },
                        ],
                    },
                },
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.issues).toEqual([
            {
                opIndex: 2,
                code: "OUT_OF_BOUNDS",
                path: "ops[2]",
                message: "outside the map",
            },
        ]);
    });

    it("exits 3 with the fields of a body that failed its schema", async () => {
        const run = await runCliFake(
            apply(["--json"]),
            options({
                ...readRoutes(),
                [APPLY]: {
                    status: 400,
                    body: {
                        formErrors: [],
                        fieldErrors: { baseVersion: ["must be a number"] },
                    },
                },
            })
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.issues).toEqual([
            { path: "baseVersion", message: "must be a number" },
        ]);
    });

    it("exits 4 when the token cannot write", async () => {
        const run = await runCliFake(
            apply(["--json"]),
            options({
                ...readRoutes(),
                [APPLY]: {
                    status: 403,
                    body: {
                        error: 'This service token does not have the "maps:write" scope.',
                        code: "SERVICE_TOKEN_SCOPE_MISSING",
                    },
                },
            })
        );

        expect(run.code).toBe(EXIT_CODES.AUTH);
        expect(JSON.parse(run.out).error.fix).toContain("maps:write");
    });

    it("exits 5 when the instance goes away during the apply", async () => {
        const run = await runCliFake(
            apply(),
            options({
                ...readRoutes(),
                [APPLY]: new UnexpectedFailure("socket hang up"),
            })
        );

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        expect(run.err).toContain("UNKNOWN");
    });

    it("prints one JSON document and never the token", async () => {
        const run = await runCliFake(apply(["--json"]), options(applyRoutes()));

        expect(run.out.trim().split("\n")).toHaveLength(1);
        expect(run.err).toBe("");
        expect(run.out).not.toContain(FAKE_TOKEN);
    });

    describe("map commands against something that is not the API", () => {
        it.each([
            ["validate", validate],
            ["apply", apply],
        ])("%s exits 5 on a 200 that is a web page", async (_name, argv) => {
            const run = await runCliFake(
                argv(["--json"]),
                options({
                    [RENDER]: { status: 200, body: undefined },
                    [LIBRARY]: { status: 200, body: "<html></html>" },
                })
            );

            expect(run.code).toBe(EXIT_CODES.NETWORK);
            const { error } = JSON.parse(run.out);
            expect(error.code).toBe("CLI_API_RESPONSE_INVALID");
            expect(error.fix).toContain("not at the web app");
        });

        it("exits 5 on a redirect and does not follow it", async () => {
            const run = await runCliFake(
                validate(["--json"]),
                options({
                    [RENDER]: {
                        status: 302,
                        body: undefined,
                        location: "https://web.test/login?next=/x",
                    },
                })
            );

            expect(run.code).toBe(EXIT_CODES.NETWORK);
            expect(JSON.parse(run.out).error.fix).toContain(
                "https://web.test/login"
            );
            expect(run.out).not.toContain("next=");
            expect(run.fake.requests).toHaveLength(1);
        });

        it("explains a 404 that has no code of the server", async () => {
            const run = await runCliFake(validate(["--json"]), options({}));

            expect(JSON.parse(run.out).error.fix).toContain(
                "--url points at the API"
            );
        });
    });
});

import { describe, expect, it } from "vitest";
import { UnexpectedFailure } from "../../../testing/UnexpectedFailure";
import { EXIT_CODES } from "../../../consts/exitCodes";
import {
    FAKE_TOKEN,
    REMOTE_ENV,
    runCliFake,
} from "../../../testing/runCliFake";
import type { FakeHttpRoutes } from "../../../types";

const family = (key: string, name: string) => ({
    familyId: key,
    key,
    name,
    type: "DECORATION",
    category: "ROOM_DECOR",
    variantCount: 2,
});

const routes = (): FakeHttpRoutes => ({
    "GET /library/overview": {
        status: 200,
        body: {
            groups: [
                {
                    category: "ROOM_DECOR",
                    label: "Decor",
                    icon: "x",
                    order: 1,
                    count: 3,
                },
            ],
            total: 3,
        },
    },
    "GET /library/tilesets": {
        status: 200,
        body: {
            tilesets: [
                {
                    id: "t1",
                    key: "floor",
                    name: "Floor",
                    tileCount: 4,
                    url: "/f.png",
                },
            ],
            total: 1,
            facets: {},
        },
    },
    "GET /library/assets?page=1&pageSize=100": {
        status: 200,
        body: {
            families: [family("crate", "Crate"), family("desk", "Desk")],
            page: 1,
            pageSize: 100,
            total: 3,
            totalPages: 2,
        },
    },
    "GET /library/assets?page=2&pageSize=100": {
        status: 200,
        body: {
            families: [family("plant", "Plant")],
            page: 2,
            pageSize: 100,
            total: 3,
            totalPages: 2,
        },
    },
    "GET /library/areas": {
        status: 200,
        body: {
            areas: [
                {
                    id: "a1",
                    name: "Lounge",
                    width: 8,
                    height: 6,
                    thumbnailUrl: "/a.png",
                },
            ],
            total: 1,
        },
    },
});

describe("library list", () => {
    it("lists tilesets, assets of every page and areas", async () => {
        const run = await runCliFake(["library", "list", "--json"], {
            env: REMOTE_ENV,
            routes: routes(),
        });

        expect(run.code).toBe(EXIT_CODES.OK);
        const { result } = JSON.parse(run.out);
        expect(result.tilesets).toEqual([
            { id: "t1", key: "floor", name: "Floor", tileCount: 4 },
        ]);
        expect(result.assets.map((a: { key: string }) => a.key)).toEqual([
            "crate",
            "desk",
            "plant",
        ]);
        expect(result.areas).toEqual([
            { id: "a1", name: "Lounge", width: 8, height: 6 },
        ]);
        expect(result.categories).toEqual([
            { category: "ROOM_DECOR", label: "Decor", count: 3 },
        ]);
        expect(run.fake.requests.every((r) => r.method === "GET")).toBe(true);
    });

    it("prints a line per entry for people", async () => {
        const run = await runCliFake(["library", "list"], {
            env: REMOTE_ENV,
            routes: routes(),
        });

        expect(run.out).toContain("tilesets (1)");
        expect(run.out).toContain("  crate  Crate  ROOM_DECOR");
        expect(run.out).toContain("assets (3)");
        expect(run.out).toContain("  Lounge  8x6  a1");
    });

    it("exits 4 and names the scope when the token cannot read the library", async () => {
        const run = await runCliFake(["library", "list", "--json"], {
            env: REMOTE_ENV,
            routes: {
                "GET /library/overview": {
                    status: 403,
                    body: {
                        error: 'This service token does not have the "library:read" scope.',
                        code: "SERVICE_TOKEN_SCOPE_MISSING",
                    },
                },
            },
        });

        expect(run.code).toBe(EXIT_CODES.AUTH);
        expect(JSON.parse(run.out).error.fix).toContain("library:read");
        expect(run.out + run.err).not.toContain(FAKE_TOKEN);
    });

    it("exits 2 without a URL, and does not prompt", async () => {
        const run = await runCliFake(["library", "list", "--json"], {
            interactive: true,
            answer: "https://x.test",
        });

        expect(run.code).toBe(EXIT_CODES.USAGE);
        expect(JSON.parse(run.out).error.code).toBe("CLI_REMOTE_URL_MISSING");
        expect(run.fake.io.ask).not.toHaveBeenCalled();
    });

    it("exits 5 when the instance is down", async () => {
        const run = await runCliFake(["library", "list"], {
            env: REMOTE_ENV,
            routes: {
                "GET /library/overview": new UnexpectedFailure(
                    "x",
                    "ENOTFOUND"
                ),
            },
        });

        expect(run.code).toBe(EXIT_CODES.NETWORK);
        expect(run.err).toContain("ENOTFOUND");
    });

    it("lets the flags win over the environment", async () => {
        const run = await runCliFake(
            [
                "library",
                "list",
                "--url",
                "https://flag.test/",
                "--token",
                "flag-token",
            ],
            { env: REMOTE_ENV, routes: routes() }
        );

        expect(run.fake.requests[0].url).toBe(
            "https://flag.test/library/overview"
        );
        expect(run.fake.requests[0].headers.authorization).toBe(
            "Bearer flag-token"
        );
    });

    describe("library list against something that is not the API", () => {
        it("exits 5 on a 200 that is not JSON", async () => {
            const run = await runCliFake(["library", "list", "--json"], {
                env: REMOTE_ENV,
                routes: {
                    "GET /library/overview": { status: 200, body: undefined },
                },
            });

            expect(run.code).toBe(EXIT_CODES.NETWORK);
            expect(JSON.parse(run.out).error.code).toBe(
                "CLI_API_RESPONSE_INVALID"
            );
        });

        it("stops at the cap of pages instead of asking for ever", async () => {
            const endless: FakeHttpRoutes = {
                ...routes(),
            };
            for (let page = 1; page <= 1000; page++) {
                endless[`GET /library/assets?page=${page}&pageSize=100`] = {
                    status: 200,
                    body: {
                        families: [],
                        page,
                        pageSize: 100,
                        total: 999999,
                        totalPages: 5000,
                    },
                };
            }
            const run = await runCliFake(["library", "list", "--json"], {
                env: REMOTE_ENV,
                routes: endless,
            });

            expect(run.code).toBe(EXIT_CODES.NETWORK);
            expect(JSON.parse(run.out).error.code).toBe(
                "CLI_LIBRARY_PAGES_EXCEEDED"
            );
            const asked = run.fake.requests.filter((r) =>
                r.url.includes("/library/assets")
            );
            expect(asked).toHaveLength(1000);
        });

        it("asks for the page size the contract allows", async () => {
            const run = await runCliFake(["library", "list"], {
                env: REMOTE_ENV,
                routes: routes(),
            });

            expect(run.fake.requests[2].url).toContain("pageSize=100");
        });
    });
});

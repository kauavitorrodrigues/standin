import type { CreatedServiceToken, ServiceToken } from "@standin/contracts";
import { ServiceTokenNotFoundError } from "@standin/contracts";
import { describe, expect, it, vi } from "vitest";
import { EXIT_CODES } from "../../../consts/exitCodes";
import { runCliFake } from "../../../testing/runCliFake";
import type { CliServices } from "../../../types";

const SECRET = "sit_clear-secret-value";
const TOKEN_ID = "6f1c2b0e-3a41-4c52-9d7e-0a1b2c3d4e5f";
const TOKEN_ID_2 = "7a2d3c1f-4b52-4d63-8e8f-1b2c3d4e5f60";
const TOKEN_ID_3 = "8b3e4d2a-5c63-4e74-9f90-2c3d4e5f6071";
const FUTURE = "2999-01-01T00:00:00Z";

const serviceToken = (overrides: Partial<ServiceToken> = {}): ServiceToken => ({
    id: TOKEN_ID,
    name: "agent",
    tokenPrefix: "sit_abcd",
    scopes: ["maps:read"],
    createdById: "admin-1",
    lastUsedAt: null,
    expiresAt: null,
    revokedAt: null,
    createdAt: new Date("2026-10-30T10:00:00Z"),
    updatedAt: new Date("2026-10-30T10:00:00Z"),
    ...overrides,
});

const created = (): CreatedServiceToken => ({
    token: SECRET,
    serviceToken: serviceToken(),
});

const admins = (...emails: string[]) =>
    vi.fn(async () =>
        emails.map((email, index) => ({ id: `admin-${index + 1}`, email }))
    );

const services = (
    overrides: Partial<CliServices> = {}
): Partial<CliServices> => ({
    listActiveAdmins: admins("boss@example.com"),
    createServiceToken: vi.fn(async () => created()),
    ...overrides,
});

const create = (extra: string[] = []) => [
    "token",
    "create",
    "--name",
    "agent",
    "--scope",
    "maps:read",
    "maps:write",
    ...extra,
];

describe("token create", () => {
    it("creates the token for the only admin and shows it once", async () => {
        const run = await runCliFake(create(["--json"]), {
            services: services(),
        });

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.services.createServiceToken).toHaveBeenCalledWith(
            "admin-1",
            { name: "agent", scopes: ["maps:read", "maps:write"] }
        );
        const { result } = JSON.parse(run.out);
        expect(result.token).toBe(SECRET);
        expect(result.owner).toBe("boss@example.com");
        expect(result.serviceToken.prefix).toBe("sit_abcd");
        expect(run.out.split(SECRET)).toHaveLength(2);
        expect(run.err).toBe("");
    });

    it("prints the token on exactly one line for people", async () => {
        const run = await runCliFake(create(), { services: services() });

        expect(
            run.out.split("\n").filter((l) => l.includes(SECRET))
        ).toHaveLength(1);
        expect(run.err).not.toContain(SECRET);
    });

    it("accepts a repeated --scope and an expiry", async () => {
        const run = await runCliFake(
            [
                "token",
                "create",
                "--name",
                "ci",
                "--scope",
                "library:read",
                "--scope",
                "maps:read",
                "--expires-at",
                FUTURE,
            ],
            { services: services() }
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.services.createServiceToken).toHaveBeenCalledWith(
            "admin-1",
            {
                name: "ci",
                scopes: ["library:read", "maps:read"],
                expiresAt: new Date(FUTURE),
            }
        );
    });

    it("exits 3 with the issues of an unknown scope", async () => {
        const run = await runCliFake(
            [
                "token",
                "create",
                "--name",
                "x",
                "--scope",
                "admin:all",
                "--json",
            ],
            { services: services() }
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("CLI_TOKEN_INPUT_INVALID");
        expect(error.issues[0].path).toBe("scopes.0");
        expect(run.fake.services.createServiceToken).not.toHaveBeenCalled();
    });

    it("exits 3 for an expiry in the past", async () => {
        const run = await runCliFake(
            create(["--expires-at", "2001-01-01T00:00:00Z", "--json"]),
            { services: services() }
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        expect(JSON.parse(run.out).error.issues[0].path).toBe("expiresAt");
    });

    it("exits 2 without --name or --scope", async () => {
        const run = await runCliFake(["token", "create", "--json"], {
            services: services(),
        });

        expect(run.code).toBe(EXIT_CODES.USAGE);
    });

    describe("the owner", () => {
        it("uses --admin", async () => {
            const run = await runCliFake(
                create(["--admin", " Ana@Example.com "]),
                {
                    services: services({
                        listActiveAdmins: admins(
                            "boss@example.com",
                            "ana@example.com"
                        ),
                    }),
                }
            );

            expect(run.code).toBe(EXIT_CODES.OK);
            expect(run.fake.services.createServiceToken).toHaveBeenCalledWith(
                "admin-2",
                expect.anything()
            );
        });

        it("uses ADMIN_EMAIL when the flag is missing, and the flag wins", async () => {
            const both = services({
                listActiveAdmins: admins("boss@example.com", "ana@example.com"),
            });
            const fromEnv = await runCliFake(create(), {
                env: { ADMIN_EMAIL: "ana@example.com" },
                services: both,
            });
            expect(fromEnv.code).toBe(EXIT_CODES.OK);
            expect(
                fromEnv.fake.services.createServiceToken
            ).toHaveBeenCalledWith("admin-2", expect.anything());

            const flagWins = await runCliFake(
                create(["--admin", "boss@example.com"]),
                { env: { ADMIN_EMAIL: "ana@example.com" }, services: both }
            );
            expect(
                flagWins.fake.services.createServiceToken
            ).toHaveBeenCalledWith("admin-1", expect.anything());
        });

        it("is a usage error with the list when there are several admins and none was chosen", async () => {
            const run = await runCliFake(create(["--json"]), {
                services: services({
                    listActiveAdmins: admins(
                        "boss@example.com",
                        "ana@example.com"
                    ),
                }),
            });

            expect(run.code).toBe(EXIT_CODES.USAGE);
            const { error } = JSON.parse(run.out);
            expect(error.code).toBe("CLI_TOKEN_ADMIN_AMBIGUOUS");
            expect(error.fix).toContain("boss@example.com");
            expect(error.fix).toContain("ana@example.com");
            expect(run.fake.services.createServiceToken).not.toHaveBeenCalled();
        });

        it("is a usage error when the email is not an active admin", async () => {
            const run = await runCliFake(
                create(["--admin", "nobody@example.com", "--json"]),
                {
                    services: services(),
                }
            );

            expect(run.code).toBe(EXIT_CODES.USAGE);
            const { error } = JSON.parse(run.out);
            expect(error.code).toBe("CLI_TOKEN_ADMIN_NOT_FOUND");
            expect(error.fix).toContain("boss@example.com");
            expect(run.fake.services.createServiceToken).not.toHaveBeenCalled();
        });

        it("is a conflict with a fix when the instance has no admin", async () => {
            const run = await runCliFake(create(["--json"]), {
                services: services({ listActiveAdmins: admins() }),
            });

            expect(run.code).toBe(EXIT_CODES.CONFLICT);
            expect(JSON.parse(run.out).error.fix).toContain("bootstrap");
        });
    });

    describe("--dry-run", () => {
        it("prints the plan and touches neither the database nor the token service", async () => {
            const run = await runCliFake(
                create(["--dry-run", "--admin", "boss@example.com", "--json"]),
                { services: services() }
            );

            expect(run.code).toBe(EXIT_CODES.OK);
            expect(run.fake.services.listActiveAdmins).not.toHaveBeenCalled();
            expect(run.fake.services.createServiceToken).not.toHaveBeenCalled();
            expect(JSON.parse(run.out).result).toEqual({
                dryRun: true,
                databaseChecked: false,
                input: {
                    name: "agent",
                    scopes: ["maps:read", "maps:write"],
                    expiresAt: null,
                    admin: "boss@example.com",
                },
            });
        });

        it("still rejects an invalid input", async () => {
            const run = await runCliFake(
                [
                    "token",
                    "create",
                    "--name",
                    "x",
                    "--scope",
                    "nope",
                    "--dry-run",
                ],
                { services: services() }
            );

            expect(run.code).toBe(EXIT_CODES.VALIDATION);
        });
    });
});

describe("token list", () => {
    it("lists prefix, name, scopes and status, never a token", async () => {
        const tokens = [
            serviceToken(),
            serviceToken({
                id: TOKEN_ID_2,
                name: "old",
                tokenPrefix: "sit_wxyz",
                revokedAt: new Date("2026-10-31T00:00:00Z"),
            }),
            serviceToken({
                id: TOKEN_ID_3,
                name: "lapsed",
                tokenPrefix: "sit_lapse",
                expiresAt: new Date("2001-01-01T00:00:00Z"),
            }),
        ];
        const run = await runCliFake(["token", "list"], {
            services: { listServiceTokens: vi.fn(async () => tokens) },
        });

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.out).toContain(
            `sit_abcd  agent  [maps:read]  active  ${TOKEN_ID}`
        );
        expect(run.out).toContain(
            `sit_wxyz  old  [maps:read]  revoked  ${TOKEN_ID_2}`
        );
        expect(run.out).toContain(
            `sit_lapse  lapsed  [maps:read]  expired  ${TOKEN_ID_3}`
        );
    });

    it("gives the rows in JSON", async () => {
        const run = await runCliFake(["token", "list", "--json"], {
            services: {
                listServiceTokens: vi.fn(async () => [serviceToken()]),
            },
        });

        const { result } = JSON.parse(run.out);
        expect(result.tokens).toHaveLength(1);
        expect(result.tokens[0]).toMatchObject({
            id: TOKEN_ID,
            prefix: "sit_abcd",
            status: "active",
        });
        expect(run.out).not.toContain("tokenHash");
    });

    it("says when there are none", async () => {
        const run = await runCliFake(["token", "list"], {
            services: { listServiceTokens: vi.fn(async () => []) },
        });

        expect(run.out).toContain("no service tokens");
    });
});

describe("token revoke", () => {
    const revoked = serviceToken({
        revokedAt: new Date("2026-10-31T00:00:00Z"),
    });
    const revokeServices = (): Partial<CliServices> => ({
        revokeServiceToken: vi.fn(async () => revoked),
    });

    it("revokes without a terminal and without --yes", async () => {
        const run = await runCliFake(["token", "revoke", TOKEN_ID, "--json"], {
            services: revokeServices(),
        });

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.services.revokeServiceToken).toHaveBeenCalledWith(
            TOKEN_ID
        );
        expect(JSON.parse(run.out).result).toMatchObject({
            dryRun: false,
            id: TOKEN_ID,
        });
    });

    it("needs --yes at a terminal", async () => {
        const run = await runCliFake(["token", "revoke", TOKEN_ID], {
            interactive: true,
            services: revokeServices(),
        });

        expect(run.code).toBe(EXIT_CODES.USAGE);
        expect(run.err).toContain("CLI_CONFIRMATION_REQUIRED");
        expect(run.err).toContain("--yes");
        expect(run.fake.services.revokeServiceToken).not.toHaveBeenCalled();
        expect(run.fake.io.ask).not.toHaveBeenCalled();
    });

    it("revokes at a terminal with --yes", async () => {
        const run = await runCliFake(["token", "revoke", TOKEN_ID, "--yes"], {
            interactive: true,
            services: revokeServices(),
        });

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.out).toContain("token revoked: agent (sit_abcd)");
    });

    it("does not stop --json at a terminal, the output must stay one document", async () => {
        const run = await runCliFake(["token", "revoke", TOKEN_ID, "--json"], {
            interactive: true,
            services: revokeServices(),
        });

        expect(run.code).toBe(EXIT_CODES.OK);
    });

    it("--dry-run changes and reads nothing", async () => {
        const run = await runCliFake(
            ["token", "revoke", TOKEN_ID, "--dry-run", "--json"],
            { interactive: true, services: revokeServices() }
        );

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.services.revokeServiceToken).not.toHaveBeenCalled();
        expect(JSON.parse(run.out).result).toEqual({
            dryRun: true,
            id: TOKEN_ID,
        });
    });

    it.each(["nope", "tok-1", "123", "6f1c2b0e-3a41-4c52-9d7e"])(
        "refuses the malformed id %s before any dry run or database call",
        async (id) => {
            for (const extra of [[], ["--dry-run"]]) {
                const run = await runCliFake(
                    ["token", "revoke", id, "--json", ...extra],
                    { services: revokeServices() }
                );

                expect(run.code).toBe(EXIT_CODES.VALIDATION);
                const { error } = JSON.parse(run.out);
                expect(error.code).toBe("CLI_TOKEN_ID_INVALID");
                expect(error.fix).toContain("token list");
                expect(
                    run.fake.services.revokeServiceToken
                ).not.toHaveBeenCalled();
            }
        }
    );

    it("exits 3 with a fix for a token that does not exist", async () => {
        const run = await runCliFake(
            ["token", "revoke", TOKEN_ID_3, "--json"],
            {
                services: {
                    revokeServiceToken: vi.fn(async () => {
                        throw new ServiceTokenNotFoundError();
                    }),
                },
            }
        );

        expect(run.code).toBe(EXIT_CODES.VALIDATION);
        const { error } = JSON.parse(run.out);
        expect(error.code).toBe("SERVICE_TOKEN_NOT_FOUND");
        expect(error.fix).toContain("token list");
    });
});

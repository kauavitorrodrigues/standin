import { BootstrapInputInvalidError } from "@standin/contracts";
import { describe, expect, it, vi } from "vitest";
import { MissingOptionError } from "../../../errors/MissingOptionError";
import { createFakeRuntime } from "../../../testing/createFakeRuntime";
import { runBootstrap } from "../runBootstrap";

const created = {
    steps: [
        { target: "admin", status: "created", label: "admin created: a@b.co" },
        {
            target: "organization",
            status: "created",
            label: "organization created: Standin",
        },
    ],
    adminId: "a1",
    organizationId: "o1",
    generatedPassword: "Generated-1",
};

const run = (
    args: Parameters<typeof runBootstrap>[0]["args"],
    options: Parameters<typeof createFakeRuntime>[0] = {}
) => {
    const fake = createFakeRuntime({
        services: { bootstrapInstance: vi.fn(async () => created) as never },
        ...options,
    });
    return {
        fake,
        promise: runBootstrap({ args, ...fake.runtime }),
    };
};

describe("runBootstrap", () => {
    it("bootstraps and prints the generated password once, in the result", async () => {
        const { fake, promise } = run({ email: "a@b.co" });
        const output = await promise;

        expect(fake.services.bootstrapInstance).toHaveBeenCalledWith({
            email: "a@b.co",
            password: undefined,
            name: undefined,
            organizationName: undefined,
        });
        expect(output.lines.join("\n")).toContain("✓ admin created: a@b.co");
        expect(
            output.lines.filter((line) => line.includes("Generated-1"))
        ).toHaveLength(1);
        expect(output.result).toEqual(created);
    });

    it("lets the flags win over the environment", async () => {
        const { fake, promise } = run(
            { email: "flag@b.co", organization: "FlagOrg" },
            {
                env: {
                    ADMIN_EMAIL: "env@b.co",
                    ADMIN_PASSWORD: "env-password",
                    ADMIN_NAME: "EnvName",
                    ORGANIZATION_NAME: "EnvOrg",
                },
            }
        );
        await promise;

        expect(fake.services.bootstrapInstance).toHaveBeenCalledWith({
            email: "flag@b.co",
            password: "env-password",
            name: "EnvName",
            organizationName: "FlagOrg",
        });
    });

    it("reads the email from the environment", async () => {
        const { fake, promise } = run({}, { env: { ADMIN_EMAIL: "e@b.co" } });
        await promise;
        expect(fake.services.bootstrapInstance).toHaveBeenCalledWith(
            expect.objectContaining({ email: "e@b.co" })
        );
    });

    it("is a usage error without email and without a terminal", async () => {
        const { fake, promise } = run({});
        await expect(promise).rejects.toBeInstanceOf(MissingOptionError);
        expect(fake.io.ask).not.toHaveBeenCalled();
        expect(fake.services.bootstrapInstance).not.toHaveBeenCalled();
    });

    it("asks for the email on a terminal", async () => {
        const { fake, promise } = run(
            {},
            { interactive: true, answer: "asked@b.co" }
        );
        await promise;
        expect(fake.services.bootstrapInstance).toHaveBeenCalledWith(
            expect.objectContaining({ email: "asked@b.co" })
        );
    });

    it("does not ask with --json even on a terminal", async () => {
        const { fake, promise } = run(
            { json: true },
            { interactive: true, answer: "asked@b.co" }
        );
        await expect(promise).rejects.toBeInstanceOf(MissingOptionError);
        expect(fake.io.ask).not.toHaveBeenCalled();
    });

    it("accepts --yes", async () => {
        const { promise } = run({ email: "a@b.co", yes: true });
        await expect(promise).resolves.toBeDefined();
    });

    it("lets the service reject an invalid input", async () => {
        const fake = createFakeRuntime({
            services: {
                bootstrapInstance: vi.fn(async () => {
                    throw new BootstrapInputInvalidError("email: bad");
                }),
            },
        });
        await expect(
            runBootstrap({ args: { email: "nope" }, ...fake.runtime })
        ).rejects.toBeInstanceOf(BootstrapInputInvalidError);
    });

    describe("--dry-run", () => {
        it("validates and writes nothing", async () => {
            const { fake, promise } = run({
                email: " Boss@Example.com ",
                dryRun: true,
            });
            const output = await promise;

            expect(fake.services.bootstrapInstance).not.toHaveBeenCalled();
            expect(output.result).toEqual({
                dryRun: true,
                databaseChecked: false,
                input: {
                    email: "boss@example.com",
                    name: "Admin",
                    organizationName: "Standin",
                    passwordProvided: false,
                },
            });
            expect(output.lines.join("\n")).toContain(
                "the database was not read"
            );
        });

        it("rejects an invalid input without calling the service", async () => {
            const { fake, promise } = run({ email: "nope", dryRun: true });
            await expect(promise).rejects.toBeInstanceOf(
                BootstrapInputInvalidError
            );
            expect(fake.services.bootstrapInstance).not.toHaveBeenCalled();
        });

        it("never echoes the password", async () => {
            const { promise } = run({
                email: "a@b.co",
                password: "Very-Secret-Pass-1",
                dryRun: true,
            });
            const output = await promise;
            expect(JSON.stringify(output)).not.toContain("Very-Secret-Pass-1");
        });
    });
});

import { UnexpectedFailure } from "../../../testing/UnexpectedFailure";
import {
    LibrarySeedAdminNotFoundError,
    LibrarySeedFileSchema,
} from "@standin/contracts";
import type { LibrarySeed } from "@standin/core";
import { describe, expect, it, vi } from "vitest";
import { LibraryFolderInvalidError } from "../../../errors/LibraryFolderInvalidError";
import { createFakeRuntime } from "../../../testing/createFakeRuntime";
import { runSeedLibrary } from "../runSeedLibrary";

const image = Buffer.from("png");
const seed = {
    tilesets: [{ key: "floor", name: "Floor", image }],
    assets: [{ key: "chair", name: "Chair", image }],
    bundles: [{ asset: "table", parts: [] }],
} as unknown as LibrarySeed;

const seeded = {
    tilesets: [{ id: "1", key: "floor", action: "create" }],
    assets: [{ id: "2", key: "chair", action: "unchanged" }],
    bundles: [],
    areas: [],
    avatarBases: [],
    avatarParts: [],
};

const setup = (overrides: Parameters<typeof createFakeRuntime>[0] = {}) =>
    createFakeRuntime({
        env: { INIT_CWD: "/work" },
        services: {
            loadLibrary: vi.fn(async () => seed),
            seedLibrary: vi.fn(async () => seeded as never),
        },
        ...overrides,
    });

describe("runSeedLibrary", () => {
    it("seeds the default library when there is no folder", async () => {
        const fake = setup();
        const output = await runSeedLibrary({ args: {}, ...fake.runtime });

        expect(fake.services.loadLibrary).toHaveBeenCalledWith(undefined);
        expect(fake.services.seedLibrary).toHaveBeenCalledWith(seed);
        expect(output.lines).toEqual([
            "✓ tileset floor: create",
            "✓ asset chair: unchanged",
        ]);
        expect(output.result).toEqual(seeded);
    });

    it("reads a relative folder from where the command was typed", async () => {
        const fake = setup();
        await runSeedLibrary({ args: { folder: "lib" }, ...fake.runtime });
        expect(fake.services.loadLibrary).toHaveBeenCalledWith("/work/lib");
    });

    it("turns a folder that cannot be read into an input error", async () => {
        const fake = setup({
            services: {
                loadLibrary: vi.fn(async () => {
                    throw new UnexpectedFailure(
                        "ENOENT: no such file",
                        "ENOENT"
                    );
                }),
                seedLibrary: vi.fn(),
            },
        });
        await expect(
            runSeedLibrary({ args: { folder: "lib" }, ...fake.runtime })
        ).rejects.toBeInstanceOf(LibraryFolderInvalidError);
        expect(fake.services.seedLibrary).not.toHaveBeenCalled();
    });

    it("turns broken JSON and a schema violation into an input error", async () => {
        const failures = [
            () => JSON.parse("{"),
            () => LibrarySeedFileSchema.parse({ tilesets: "no" }),
        ];
        for (const fail of failures) {
            const fake = setup({
                services: {
                    loadLibrary: vi.fn(async () => fail()),
                    seedLibrary: vi.fn(),
                },
            });
            await expect(
                runSeedLibrary({ args: { folder: "lib" }, ...fake.runtime })
            ).rejects.toBeInstanceOf(LibraryFolderInvalidError);
        }
    });

    it("lets a domain error from loading the library through", async () => {
        const fake = setup({
            services: {
                loadLibrary: vi.fn(async () => {
                    throw new LibrarySeedAdminNotFoundError();
                }),
                seedLibrary: vi.fn(),
            },
        });
        await expect(
            runSeedLibrary({ args: { folder: "lib" }, ...fake.runtime })
        ).rejects.toBeInstanceOf(LibrarySeedAdminNotFoundError);
    });

    it("lets an error that is not about the folder through", async () => {
        const fake = setup({
            services: {
                loadLibrary: vi.fn(async () => {
                    throw new UnexpectedFailure("cannot load the core");
                }),
                seedLibrary: vi.fn(),
            },
        });
        await expect(
            runSeedLibrary({ args: { folder: "lib" }, ...fake.runtime })
        ).rejects.toBeInstanceOf(UnexpectedFailure);
    });

    it("lets the missing admin error through", async () => {
        const fake = setup({
            services: {
                loadLibrary: vi.fn(async () => seed),
                seedLibrary: vi.fn(async () => {
                    throw new LibrarySeedAdminNotFoundError();
                }),
            },
        });
        await expect(
            runSeedLibrary({ args: {}, ...fake.runtime })
        ).rejects.toBeInstanceOf(LibrarySeedAdminNotFoundError);
    });

    it("accepts --yes", async () => {
        const fake = setup();
        await expect(
            runSeedLibrary({ args: { yes: true }, ...fake.runtime })
        ).resolves.toBeDefined();
    });

    it("lists the keys on --dry-run and does not seed", async () => {
        const fake = setup();
        const output = await runSeedLibrary({
            args: { folder: "lib", dryRun: true },
            ...fake.runtime,
        });

        expect(fake.services.seedLibrary).not.toHaveBeenCalled();
        expect(output.result).toEqual({
            dryRun: true,
            databaseChecked: false,
            keys: {
                tilesets: ["floor"],
                assets: ["chair"],
                bundles: ["table"],
                areas: [],
                avatarBases: [],
                avatarParts: [],
            },
        });
        expect(output.lines).toContain("✓ tileset floor: valid");
        expect(output.lines).toContain("✓ bundle table: valid");
    });

    it("still rejects an invalid folder on --dry-run", async () => {
        const fake = setup({
            services: {
                loadLibrary: vi.fn(async () => {
                    throw new UnexpectedFailure("bad", "ENOENT");
                }),
                seedLibrary: vi.fn(),
            },
        });
        await expect(
            runSeedLibrary({
                args: { folder: "lib", dryRun: true },
                ...fake.runtime,
            })
        ).rejects.toBeInstanceOf(LibraryFolderInvalidError);
    });
});

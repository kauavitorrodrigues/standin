import { LibrarySeedAdminNotFoundError } from "@standin/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LibrarySeed } from "../types";

const mocks = vi.hoisted(() => ({
    findActiveAdmin: vi.fn(),
    seedLibrary: vi.fn(),
}));

vi.mock("../../../bootstrap/repository", () => ({
    BootstrapRepository: { findActiveAdmin: mocks.findActiveAdmin },
}));
vi.mock("../seedLibrary", () => ({ seedLibrary: mocks.seedLibrary }));

import { seedLibraryAsAdmin } from "../seedLibraryAsAdmin";

const seed: LibrarySeed = {
    tilesets: [],
    assets: [],
    bundles: [],
    areas: [],
    avatarBases: [],
    avatarParts: [],
};

beforeEach(() => {
    vi.resetAllMocks();
});

describe("seedLibraryAsAdmin", () => {
    it("seeds the library under the active admin", async () => {
        const result = { tilesets: [] };
        mocks.findActiveAdmin.mockResolvedValue({
            id: "admin-1",
            email: "a@b.co",
        });
        mocks.seedLibrary.mockResolvedValue(result);

        await expect(seedLibraryAsAdmin(seed)).resolves.toBe(result);
        expect(mocks.seedLibrary).toHaveBeenCalledWith(seed, {
            createdBy: "admin-1",
        });
    });

    it("throws when there is no active admin and seeds nothing", async () => {
        mocks.findActiveAdmin.mockResolvedValue(null);

        await expect(seedLibraryAsAdmin(seed)).rejects.toBeInstanceOf(
            LibrarySeedAdminNotFoundError
        );
        expect(mocks.seedLibrary).not.toHaveBeenCalled();
    });
});

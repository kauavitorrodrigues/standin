import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    LibrarySeedFileInvalidError,
    LibrarySeedFilesMissingError,
} from "@standin/contracts";

const mocks = vi.hoisted(() => ({ seedLibrary: vi.fn() }));
vi.mock("../seedLibrary", () => ({ seedLibrary: mocks.seedLibrary }));

import { seedLibraryFromFiles } from "../seedLibraryFromFiles";

const library = JSON.stringify({
    tilesets: [{ key: "floor", name: "Floor", file: "floor.png" }],
});
const images = new Map([["floor.png", Buffer.from("png")]]);

describe("seedLibraryFromFiles", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.seedLibrary.mockResolvedValue({ tilesets: [] });
    });

    it("seeds as the given user", async () => {
        const result = await seedLibraryFromFiles(
            { libraryText: library, images },
            { createdBy: "admin-1" }
        );

        expect(result).toEqual({ tilesets: [] });
        expect(mocks.seedLibrary).toHaveBeenCalledWith(
            expect.objectContaining({
                tilesets: [expect.objectContaining({ key: "floor" })],
            }),
            { createdBy: "admin-1" }
        );
    });

    it("counts the entries on a dry run and writes nothing", async () => {
        const result = await seedLibraryFromFiles(
            { libraryText: library, images },
            { createdBy: "admin-1", dryRun: true }
        );

        expect(result).toEqual({
            dryRun: true,
            counts: {
                tilesets: 1,
                assets: 0,
                bundles: 0,
                areas: 0,
                avatarBases: 0,
                avatarParts: 0,
            },
        });
        expect(mocks.seedLibrary).not.toHaveBeenCalled();
    });

    it("refuses a missing PNG, also on a dry run", async () => {
        await expect(
            seedLibraryFromFiles(
                { libraryText: library, images: new Map() },
                { createdBy: "admin-1", dryRun: true }
            )
        ).rejects.toBeInstanceOf(LibrarySeedFilesMissingError);
    });

    it.each(["not json", JSON.stringify({ tilesets: "x" })])(
        "refuses a library.json that is invalid (%s)",
        async (libraryText) => {
            await expect(
                seedLibraryFromFiles(
                    { libraryText, images },
                    { createdBy: "admin-1" }
                )
            ).rejects.toBeInstanceOf(LibrarySeedFileInvalidError);
            expect(mocks.seedLibrary).not.toHaveBeenCalled();
        }
    );
});

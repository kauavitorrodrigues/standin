import {
    AvatarPreviewInvalidError,
    AvatarSheetInvalidSizeError,
    AreaValidationError,
    LibrarySeedEntryError,
    ThumbnailSizeMismatchIssue,
} from "@standin/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    isSameFileById: vi.fn(),
    replaceFront: vi.fn(),
    replacePartPreview: vi.fn(),
    validateAvatarSheet: vi.fn(),
    validateAvatarPreview: vi.fn(),
}));

vi.mock("../../compare/isSameFileById", () => ({
    isSameFileById: mocks.isSameFileById,
}));
vi.mock("../../../../avatar/parts/replaceFront", () => ({
    replaceFront: mocks.replaceFront,
}));
vi.mock("../../../../avatar/previews/replacePartPreview", () => ({
    replacePartPreview: mocks.replacePartPreview,
}));
vi.mock("../../../../avatar/utils/validateAvatarSheet", () => ({
    validateAvatarSheet: mocks.validateAvatarSheet,
}));
vi.mock("../../../../avatar/utils/validateAvatarPreview", () => ({
    validateAvatarPreview: mocks.validateAvatarPreview,
}));

import { assertImagesValid } from "../assertImagesValid";
import { syncImages } from "../syncImages";
import { withSeedEntry } from "../withSeedEntry";
import type { SeedAvatarPartRow } from "../../types";

const sheet = Buffer.from("sheet");
const preview = Buffer.from("preview");
const row = {
    id: "p-1",
    fileId: "f-1",
    previewFileId: "f-2",
} as SeedAvatarPartRow;

beforeEach(() => vi.resetAllMocks());

describe("withSeedEntry", () => {
    it("passes a success through", async () => {
        expect(await withSeedEntry("areas", async () => 7)).toBe(7);
    });

    it("wraps a refusal with the entry, keeping code and status", async () => {
        const refusal = new AvatarSheetInvalidSizeError();

        const error = await withSeedEntry('avatarParts "hair"', async () => {
            throw refusal;
        }).catch((caught) => caught);

        expect(error).toBeInstanceOf(LibrarySeedEntryError);
        expect(error.entry).toBe('avatarParts "hair"');
        expect(error.code).toBe(refusal.code);
        expect(error.status).toBe(refusal.status);
        expect(error.message).toContain('avatarParts "hair"');
        expect(error.issues).toEqual([]);
    });

    it("carries the issues of a validation error", async () => {
        const error = await withSeedEntry('areas "lobby"', async () => {
            throw new AreaValidationError([new ThumbnailSizeMismatchIssue()]);
        }).catch((caught) => caught);

        expect(error.issues.map(({ code }: { code: string }) => code)).toEqual([
            "THUMBNAIL_SIZE_MISMATCH",
        ]);
        expect(error).toBeInstanceOf(LibrarySeedEntryError);
    });

    it("lets an error that is not a refusal through untouched", async () => {
        const failure = new TypeError("boom");

        await expect(
            withSeedEntry("areas", async () => {
                throw failure;
            })
        ).rejects.toBe(failure);
    });
});

describe("assertImagesValid", () => {
    it("checks only the images it is given", () => {
        assertImagesValid({ sheet });
        expect(mocks.validateAvatarSheet).toHaveBeenCalledWith(sheet);
        expect(mocks.validateAvatarPreview).not.toHaveBeenCalled();

        assertImagesValid({ preview });
        expect(mocks.validateAvatarPreview).toHaveBeenCalledWith(preview);

        mocks.validateAvatarSheet.mockClear();
        assertImagesValid({});
        expect(mocks.validateAvatarSheet).not.toHaveBeenCalled();
    });

    it("throws what the validators throw", () => {
        mocks.validateAvatarPreview.mockImplementation(() => {
            throw new AvatarPreviewInvalidError();
        });

        expect(() => assertImagesValid({ preview })).toThrow(
            AvatarPreviewInvalidError
        );
    });
});

describe("syncImages", () => {
    it("replaces nothing and reports false when both images match", async () => {
        mocks.isSameFileById.mockResolvedValue(true);

        expect(await syncImages(row, { image: sheet, preview })).toBe(false);
        expect(mocks.replaceFront).not.toHaveBeenCalled();
        expect(mocks.replacePartPreview).not.toHaveBeenCalled();
    });

    it("replaces only the image that changed", async () => {
        mocks.isSameFileById.mockResolvedValueOnce(false);
        mocks.isSameFileById.mockResolvedValueOnce(true);

        expect(await syncImages(row, { image: sheet, preview })).toBe(true);
        expect(mocks.replaceFront).toHaveBeenCalledWith("p-1", {
            buffer: sheet,
        });
        expect(mocks.replacePartPreview).not.toHaveBeenCalled();
        expect(mocks.isSameFileById).toHaveBeenNthCalledWith(1, "f-1", sheet);
        expect(mocks.isSameFileById).toHaveBeenNthCalledWith(2, "f-2", preview);
    });

    it("replaces nothing when the other image is refused", async () => {
        mocks.isSameFileById.mockResolvedValue(false);
        mocks.validateAvatarPreview.mockImplementation(() => {
            throw new AvatarPreviewInvalidError();
        });

        await expect(
            syncImages(row, { image: sheet, preview })
        ).rejects.toBeInstanceOf(AvatarPreviewInvalidError);
        expect(mocks.replaceFront).not.toHaveBeenCalled();
        expect(mocks.replacePartPreview).not.toHaveBeenCalled();
    });
});

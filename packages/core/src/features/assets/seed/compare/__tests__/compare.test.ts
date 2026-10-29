import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    findStoredFileName: vi.fn(),
    isSameStoredFile: vi.fn(),
}));

vi.mock("../../repository", () => ({
    SeedRepository: { findStoredFileName: mocks.findStoredFileName },
}));
vi.mock("../../../library/utils/isSameStoredFile", () => ({
    isSameStoredFile: mocks.isSameStoredFile,
}));

import { isPreviewCurrent } from "../isPreviewCurrent";
import { isSameFileById } from "../isSameFileById";

const bytes = Buffer.from("png");

beforeEach(() => vi.clearAllMocks());

describe("isSameFileById", () => {
    it("compares the bytes with the stored file of the id", async () => {
        mocks.findStoredFileName.mockResolvedValue("abc.png");
        mocks.isSameStoredFile.mockResolvedValueOnce(true);
        mocks.isSameStoredFile.mockResolvedValueOnce(false);

        expect(await isSameFileById("f-1", bytes)).toBe(true);
        expect(await isSameFileById("f-1", bytes)).toBe(false);
        expect(mocks.findStoredFileName).toHaveBeenCalledWith("f-1");
        expect(mocks.isSameStoredFile).toHaveBeenCalledWith("abc.png", bytes);
    });

    it("is false, without reading a file, when the id has no stored name", async () => {
        mocks.findStoredFileName.mockResolvedValue(null);

        expect(await isSameFileById("f-2", bytes)).toBe(false);
        expect(mocks.isSameStoredFile).not.toHaveBeenCalled();
    });
});

describe("isPreviewCurrent", () => {
    it("is true without looking at anything when the entry has no preview", async () => {
        expect(await isPreviewCurrent("f-1", undefined)).toBe(true);
        expect(await isPreviewCurrent(null, undefined)).toBe(true);
        expect(mocks.findStoredFileName).not.toHaveBeenCalled();
    });

    it("is false when the entry has a preview and the base has none", async () => {
        expect(await isPreviewCurrent(null, bytes)).toBe(false);
        expect(mocks.findStoredFileName).not.toHaveBeenCalled();
    });

    it("compares the preview with the stored one", async () => {
        mocks.findStoredFileName.mockResolvedValue("p.png");
        mocks.isSameStoredFile.mockResolvedValue(true);

        expect(await isPreviewCurrent("f-3", bytes)).toBe(true);
        expect(mocks.findStoredFileName).toHaveBeenCalledWith("f-3");
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    findByIdMock,
    uploadMock,
    softDeleteMock,
    purgeMock,
    deleteFileMock,
    lockedMock,
    setMock,
    transactionMock,
} = vi.hoisted(() => ({
    findByIdMock: vi.fn(),
    uploadMock: vi.fn(),
    softDeleteMock: vi.fn(),
    purgeMock: vi.fn(),
    deleteFileMock: vi.fn(),
    lockedMock: vi.fn(),
    setMock: vi.fn(),
    transactionMock: vi.fn(),
}));

const tx = {
    select: () => ({
        from: () => ({ where: () => ({ for: lockedMock }) }),
    }),
    update: () => ({
        set: (values: unknown) => {
            setMock(values);
            return { where: vi.fn() };
        },
    }),
};

vi.mock("@standin/database", () => ({
    spacesTable: {
        id: "id",
        organizationId: "organization_id",
        deletedAt: "deleted_at",
        thumbnailFileId: "thumbnail_file_id",
    },
    and: vi.fn(),
    eq: vi.fn(),
    isNull: vi.fn(),
    db: { transaction: transactionMock },
}));
vi.mock("../../files", () => ({
    FileService: {
        upload: uploadMock,
        softDeleteManyByIds: softDeleteMock,
        purge: purgeMock,
        delete: deleteFileMock,
    },
}));
vi.mock("../findById", () => ({ findSpaceById: findByIdMock }));

import {
    SpaceNotFoundError,
    UnsupportedFileTypeError,
} from "@standin/contracts";
import { setSpaceThumbnail } from "../setThumbnail";

// The 8 byte signature and an IHDR chunk, which is all a PNG is checked by.
const pngBytes = () => {
    const bytes = Buffer.alloc(33);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes);
    bytes.write("IHDR", 12, "ascii");
    bytes.writeUInt32BE(160, 16);
    bytes.writeUInt32BE(90, 20);
    return bytes;
};

const file = {
    buffer: pngBytes(),
    originalname: "photo.png",
    mimetype: "image/png",
    size: 33,
};

beforeEach(() => {
    vi.resetAllMocks();
    transactionMock.mockImplementation(async (run) => run(tx));
    uploadMock.mockResolvedValue({ id: "new-file" });
    deleteFileMock.mockResolvedValue(undefined);
    softDeleteMock.mockResolvedValue([]);
    findByIdMock.mockResolvedValue({ id: "s1" });
});

describe("setSpaceThumbnail", () => {
    it("uploads into the folder of the space", async () => {
        lockedMock.mockResolvedValue([{ thumbnailFileId: null }]);

        await setSpaceThumbnail("org-1", "s1", file);

        expect(uploadMock).toHaveBeenCalledWith(expect.anything(), {
            folder: "spaces/s1",
        });
    });

    it("stores it under a fixed name and type, never the ones the client sent", async () => {
        lockedMock.mockResolvedValue([{ thumbnailFileId: null }]);

        await setSpaceThumbnail("org-1", "s1", {
            ...file,
            originalname: "evil.html",
            mimetype: "text/html",
        });

        const [uploaded] = uploadMock.mock.calls[0];
        expect(uploaded.originalname).toBe("thumbnail.png");
        expect(uploaded.mimetype).toBe("image/png");
        expect(uploaded.buffer).toBe(file.buffer);
    });

    it("refuses bytes that are not a PNG, whatever the client declared", async () => {
        await expect(
            setSpaceThumbnail("org-1", "s1", {
                ...file,
                buffer: Buffer.from("<script>alert(1)</script>".padEnd(40)),
            })
        ).rejects.toBeInstanceOf(UnsupportedFileTypeError);
        expect(uploadMock).not.toHaveBeenCalled();
        expect(findByIdMock).not.toHaveBeenCalled();
    });

    it("points the space at the new file and soft deletes the old row in the transaction", async () => {
        lockedMock.mockResolvedValue([{ thumbnailFileId: "old-file" }]);

        await setSpaceThumbnail("org-1", "s1", file);

        expect(setMock).toHaveBeenCalledWith({ thumbnailFileId: "new-file" });
        expect(softDeleteMock).toHaveBeenCalledWith(["old-file"], tx);
    });

    it("removes the old object from storage only after the commit", async () => {
        lockedMock.mockResolvedValue([{ thumbnailFileId: "old-file" }]);
        softDeleteMock.mockResolvedValue(["spaces/s1/old.png"]);
        const order: string[] = [];
        transactionMock.mockImplementation(async (run) => {
            const result = await run(tx);
            order.push("commit");
            return result;
        });
        purgeMock.mockImplementation(async () => order.push("purge"));

        await setSpaceThumbnail("org-1", "s1", file);

        expect(purgeMock).toHaveBeenCalledWith(["spaces/s1/old.png"]);
        expect(order).toEqual(["commit", "purge"]);
    });

    it("has nothing to remove on the first photo", async () => {
        lockedMock.mockResolvedValue([{ thumbnailFileId: null }]);

        await setSpaceThumbnail("org-1", "s1", file);

        expect(softDeleteMock).toHaveBeenCalledWith([], tx);
        expect(purgeMock).toHaveBeenCalledWith([]);
    });

    it("returns the space read again, with the new url", async () => {
        lockedMock.mockResolvedValue([{ thumbnailFileId: null }]);
        findByIdMock.mockResolvedValue({
            id: "s1",
            thumbnailUrl: "https://cdn/a",
        });

        await expect(setSpaceThumbnail("org-1", "s1", file)).resolves.toEqual({
            id: "s1",
            thumbnailUrl: "https://cdn/a",
        });
    });

    it("does not upload anything for a space that does not exist", async () => {
        findByIdMock.mockRejectedValue(new SpaceNotFoundError());

        await expect(
            setSpaceThumbnail("org-1", "s1", file)
        ).rejects.toBeInstanceOf(SpaceNotFoundError);
        expect(uploadMock).not.toHaveBeenCalled();
    });

    it("removes the upload, outside the transaction, when the space is deleted in the meantime", async () => {
        lockedMock.mockResolvedValue([]);

        await expect(
            setSpaceThumbnail("org-1", "s1", file)
        ).rejects.toBeInstanceOf(SpaceNotFoundError);
        expect(deleteFileMock).toHaveBeenCalledWith("new-file");
        expect(setMock).not.toHaveBeenCalled();
        expect(purgeMock).not.toHaveBeenCalled();
    });

    it("removes the upload and keeps the old photo when the transaction fails", async () => {
        const failure = new Error("commit failed");
        transactionMock.mockRejectedValue(failure);

        await expect(setSpaceThumbnail("org-1", "s1", file)).rejects.toBe(
            failure
        );
        expect(deleteFileMock).toHaveBeenCalledWith("new-file");
        expect(purgeMock).not.toHaveBeenCalled();
    });

    it("still throws the original error when removing the upload fails too", async () => {
        const failure = new Error("commit failed");
        transactionMock.mockRejectedValue(failure);
        deleteFileMock.mockRejectedValue(new Error("storage down"));
        vi.spyOn(console, "error").mockImplementation(() => {});

        await expect(setSpaceThumbnail("org-1", "s1", file)).rejects.toBe(
            failure
        );
    });
});

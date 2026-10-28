import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    rowMock,
    lockedMock,
    setMock,
    transactionMock,
    uploadMock,
    softDeleteMock,
    purgeMock,
    deleteFileMock,
    findTemplateMock,
    aspectMock,
} = vi.hoisted(() => ({
    rowMock: vi.fn(),
    lockedMock: vi.fn(),
    setMock: vi.fn(),
    transactionMock: vi.fn(),
    uploadMock: vi.fn(),
    softDeleteMock: vi.fn(),
    purgeMock: vi.fn(),
    deleteFileMock: vi.fn(),
    findTemplateMock: vi.fn(),
    aspectMock: vi.fn(),
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
    mapTemplatesTable: {
        id: "id",
        mapId: "map_id",
        deletedAt: "deleted_at",
        thumbnailFileId: "thumbnail_file_id",
    },
    mapsTable: { id: "id" },
    filesTable: {},
    and: vi.fn(),
    eq: vi.fn(),
    isNull: vi.fn(),
    db: {
        select: () => ({
            from: () => ({ innerJoin: () => ({ where: rowMock }) }),
        }),
        transaction: transactionMock,
    },
}));
vi.mock("../../../files", () => ({
    FileService: {
        upload: uploadMock,
        softDeleteManyByIds: softDeleteMock,
        purge: purgeMock,
        delete: deleteFileMock,
    },
}));
vi.mock("../findById", () => ({ findTemplateById: findTemplateMock }));
vi.mock("../utils/checkThumbnailAspect", () => ({
    checkThumbnailAspect: aspectMock,
}));

import {
    MapTemplateNotFoundError,
    UnsupportedFileTypeError,
} from "@standin/contracts";
import { setTemplateThumbnail } from "../setThumbnail";

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
    rowMock.mockResolvedValue([
        { thumbnailFileId: null, width: 10, height: 8 },
    ]);
    lockedMock.mockResolvedValue([{ thumbnailFileId: null }]);
    uploadMock.mockResolvedValue({ id: "new-file" });
    deleteFileMock.mockResolvedValue(undefined);
    softDeleteMock.mockResolvedValue([]);
    findTemplateMock.mockResolvedValue({ id: "t1" });
    aspectMock.mockReturnValue([]);
});

describe("setTemplateThumbnail", () => {
    it("points the template at the new file and soft deletes the old row in the transaction", async () => {
        lockedMock.mockResolvedValue([{ thumbnailFileId: "old-file" }]);

        await setTemplateThumbnail("t1", file);

        expect(setMock).toHaveBeenCalledWith({ thumbnailFileId: "new-file" });
        expect(softDeleteMock).toHaveBeenCalledWith(["old-file"], tx);
    });

    it("removes the old object from storage only after the commit", async () => {
        lockedMock.mockResolvedValue([{ thumbnailFileId: "old-file" }]);
        softDeleteMock.mockResolvedValue(["templates/t1/old.png"]);
        const order: string[] = [];
        transactionMock.mockImplementation(async (run) => {
            const result = await run(tx);
            order.push("commit");
            return result;
        });
        purgeMock.mockImplementation(async () => order.push("purge"));

        await setTemplateThumbnail("t1", file);

        expect(purgeMock).toHaveBeenCalledWith(["templates/t1/old.png"]);
        expect(order).toEqual(["commit", "purge"]);
    });

    it("has nothing to remove on the first photo", async () => {
        await setTemplateThumbnail("t1", file);

        expect(softDeleteMock).toHaveBeenCalledWith([], tx);
        expect(purgeMock).toHaveBeenCalledWith([]);
    });

    it("answers the template and the proportion warnings", async () => {
        aspectMock.mockReturnValue([{ code: "ASPECT" }]);

        await expect(setTemplateThumbnail("t1", file)).resolves.toEqual({
            template: { id: "t1" },
            warnings: [{ code: "ASPECT" }],
        });
    });

    it("uploads nothing for a template that does not exist", async () => {
        rowMock.mockResolvedValue([]);

        await expect(setTemplateThumbnail("t1", file)).rejects.toBeInstanceOf(
            MapTemplateNotFoundError
        );
        expect(uploadMock).not.toHaveBeenCalled();
    });

    it("removes the upload, outside the transaction, when the template is deleted in the meantime", async () => {
        lockedMock.mockResolvedValue([]);

        await expect(setTemplateThumbnail("t1", file)).rejects.toBeInstanceOf(
            MapTemplateNotFoundError
        );
        expect(deleteFileMock).toHaveBeenCalledWith("new-file");
        expect(setMock).not.toHaveBeenCalled();
        expect(purgeMock).not.toHaveBeenCalled();
    });

    it("removes the upload and keeps the old photo when the transaction fails", async () => {
        const failure = new Error("commit failed");
        transactionMock.mockRejectedValue(failure);

        await expect(setTemplateThumbnail("t1", file)).rejects.toBe(failure);
        expect(deleteFileMock).toHaveBeenCalledWith("new-file");
        expect(purgeMock).not.toHaveBeenCalled();
    });

    it("uploads into the folder of the template", async () => {
        await setTemplateThumbnail("t1", file);

        expect(uploadMock).toHaveBeenCalledWith(expect.anything(), {
            folder: "templates/t1",
        });
    });

    it("stores it under a fixed name and type, never the ones the client sent", async () => {
        await setTemplateThumbnail("t1", {
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
            setTemplateThumbnail("t1", {
                ...file,
                buffer: Buffer.from("<script>alert(1)</script>".padEnd(40)),
            })
        ).rejects.toBeInstanceOf(UnsupportedFileTypeError);
        expect(uploadMock).not.toHaveBeenCalled();
        expect(rowMock).not.toHaveBeenCalled();
    });
});

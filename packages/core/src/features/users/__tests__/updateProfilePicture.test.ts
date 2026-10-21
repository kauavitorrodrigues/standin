import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
    const tx = { select: vi.fn(), insert: vi.fn(), delete: vi.fn() };
    return {
        tx,
        uploadMock: vi.fn(),
        deleteFileMock: vi.fn(),
        softDeleteMock: vi.fn(),
        purgeMock: vi.fn(),
        readUserMock: vi.fn(),
        publishMock: vi.fn(),
        existing: { current: undefined as { fileId: string } | undefined },
        insertValues: vi.fn(),
        deleteWhere: vi.fn(),
        transactionFails: { current: false },
        order: [] as string[],
    };
});

vi.mock("../utils/readUser", () => ({ readUser: mocks.readUserMock }));
vi.mock("../utils/profilePictureEvents", () => ({
    publishUserProfilePictureChanged: mocks.publishMock,
}));
vi.mock("../../files", () => ({
    FileService: {
        upload: mocks.uploadMock,
        delete: mocks.deleteFileMock,
        softDeleteManyByIds: mocks.softDeleteMock,
        purge: mocks.purgeMock,
    },
}));
vi.mock("@standin/database", () => ({
    userProfilePicturesTable: { userId: "user_id", fileId: "file_id" },
    usersTable: { id: "id" },
    eq: vi.fn(),
    db: {
        transaction: async (run: (tx: unknown) => Promise<unknown>) => {
            if (mocks.transactionFails.current) throw new Error("db down");
            return run(mocks.tx);
        },
    },
}));

import { updateProfilePicture } from "../updateProfilePicture";

const file = {
    buffer: Buffer.from("png"),
    originalname: "profile-picture.png",
    mimetype: "image/png",
    size: 3,
};
const set = { action: "set", file } as const;
const remove = { action: "remove" } as const;
const user = { id: "u1", profilePictureUrl: "/files/new" };

describe("updateProfilePicture", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.order.length = 0;
        mocks.transactionFails.current = false;
        mocks.existing.current = undefined;
        mocks.uploadMock.mockResolvedValue({ id: "new" });
        mocks.deleteFileMock.mockResolvedValue({});
        mocks.readUserMock.mockImplementation(async () => {
            mocks.order.push("read");
            return user;
        });
        mocks.softDeleteMock.mockImplementation(async (ids: string[]) => {
            mocks.order.push("soft delete");
            return ids.map((id) => `key-${id}`);
        });
        mocks.purgeMock.mockImplementation(async () => {
            mocks.order.push("purge");
        });
        mocks.tx.select.mockImplementation(() => ({
            from: () => ({
                where: () => ({
                    for: async () =>
                        mocks.existing.current ? [mocks.existing.current] : [],
                }),
            }),
        }));
        mocks.tx.insert.mockImplementation(() => ({
            values: (values: unknown) => {
                mocks.insertValues(values);
                return { onConflictDoUpdate: async () => undefined };
            },
        }));
        mocks.tx.delete.mockImplementation(() => ({
            where: async () => {
                mocks.deleteWhere();
            },
        }));
    });

    describe("set", () => {
        it("uploads the processed file as it came and returns the updated user", async () => {
            const result = await updateProfilePicture("u1", set);

            expect(mocks.uploadMock).toHaveBeenCalledWith(file, {
                folder: "users/u1/profile-picture",
            });
            expect(mocks.insertValues).toHaveBeenCalledWith({
                userId: "u1",
                fileId: "new",
            });
            expect(result).toBe(user);
            expect(mocks.publishMock).toHaveBeenCalledWith({
                userId: "u1",
                profilePictureUrl: "/files/new",
            });
        });

        it("soft deletes the old file in the transaction and purges it after the commit", async () => {
            mocks.existing.current = { fileId: "old" };

            await updateProfilePicture("u1", set);

            expect(mocks.softDeleteMock).toHaveBeenCalledWith(
                ["old"],
                mocks.tx
            );
            expect(mocks.purgeMock).toHaveBeenCalledWith(["key-old"]);
            expect(mocks.order).toEqual(["soft delete", "purge", "read"]);
        });

        it("locks the user row before it reads the current picture", async () => {
            const calls: string[] = [];
            mocks.tx.select.mockImplementation(() => {
                calls.push("select");
                return {
                    from: () => ({ where: () => ({ for: async () => [] }) }),
                };
            });

            await updateProfilePicture("u1", set);

            expect(calls).toEqual(["select", "select"]);
        });

        it("removes the new file and purges nothing when the transaction fails", async () => {
            mocks.transactionFails.current = true;

            await expect(updateProfilePicture("u1", set)).rejects.toThrow(
                "db down"
            );

            expect(mocks.deleteFileMock).toHaveBeenCalledWith("new");
            expect(mocks.purgeMock).not.toHaveBeenCalled();
            expect(mocks.publishMock).not.toHaveBeenCalled();
        });

        it("fails and writes nothing when the upload fails", async () => {
            mocks.uploadMock.mockRejectedValue(new Error("storage down"));

            await expect(updateProfilePicture("u1", set)).rejects.toThrow(
                "storage down"
            );

            expect(mocks.tx.insert).not.toHaveBeenCalled();
            expect(mocks.softDeleteMock).not.toHaveBeenCalled();
        });
    });

    describe("remove", () => {
        it("removes the row, soft deletes the file, purges after the commit and tells the listeners", async () => {
            mocks.existing.current = { fileId: "old" };
            mocks.readUserMock.mockResolvedValue({
                id: "u1",
                profilePictureUrl: null,
            });

            const result = await updateProfilePicture("u1", remove);

            expect(mocks.uploadMock).not.toHaveBeenCalled();
            expect(mocks.deleteWhere).toHaveBeenCalled();
            expect(mocks.softDeleteMock).toHaveBeenCalledWith(
                ["old"],
                mocks.tx
            );
            expect(mocks.purgeMock).toHaveBeenCalledWith(["key-old"]);
            expect(mocks.publishMock).toHaveBeenCalledWith({
                userId: "u1",
                profilePictureUrl: null,
            });
            expect(result.profilePictureUrl).toBeNull();
        });

        it("is not an error when there is no picture, and tells nobody", async () => {
            await updateProfilePicture("u1", remove);

            expect(mocks.softDeleteMock).not.toHaveBeenCalled();
            expect(mocks.purgeMock).not.toHaveBeenCalled();
            expect(mocks.publishMock).not.toHaveBeenCalled();
        });
    });
});

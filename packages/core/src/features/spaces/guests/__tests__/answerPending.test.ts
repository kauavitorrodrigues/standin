import { beforeEach, describe, expect, it, vi } from "vitest";

const { returningMock, selectWhereMock } = vi.hoisted(() => ({
    returningMock: vi.fn(),
    selectWhereMock: vi.fn(),
}));

vi.mock("@standin/database", () => ({
    spaceGuestsTable: {},
    spacesTable: {},
    usersTable: {},
    userProfilePicturesTable: {},
    and: vi.fn(),
    eq: vi.fn(),
    gt: vi.fn(),
    inArray: vi.fn(),
    isNull: vi.fn(),
    db: {
        update: () => ({
            set: () => ({ where: () => ({ returning: returningMock }) }),
        }),
        select: () => ({
            from: () => ({
                where: () => Promise.resolve([]),
                innerJoin: () => ({ where: selectWhereMock }),
            }),
        }),
    },
}));

import {
    GuestAccessDisabledError,
    SpaceGuestNotFoundError,
    SpaceGuestNotPendingError,
    SpaceGuestRequestExpiredError,
} from "@standin/contracts";
import { answerPending } from "../utils/answerPending";

const answer = { status: "DENIED", statusReason: "HOST_DENIED" } as const;

describe("answerPending", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns the row the update changed", async () => {
        returningMock.mockResolvedValue([{ id: "g1", userId: "u1" }]);

        expect(await answerPending("s1", "g1", "host", answer)).toEqual({
            id: "g1",
            userId: "u1",
        });
        expect(selectWhereMock).not.toHaveBeenCalled();
    });

    it("says the guest does not exist", async () => {
        returningMock.mockResolvedValue([]);
        selectWhereMock.mockResolvedValue([]);

        await expect(answerPending("s1", "g1", "host", answer)).rejects.toThrow(
            SpaceGuestNotFoundError
        );
    });

    it("says a pending request past its window has expired", async () => {
        returningMock.mockResolvedValue([]);
        selectWhereMock.mockResolvedValue([{ id: "g1", status: "PENDING" }]);

        await expect(answerPending("s1", "g1", "host", answer)).rejects.toThrow(
            SpaceGuestRequestExpiredError
        );
    });

    it.each(["ADMITTED", "DENIED"])(
        "says a %s request was answered already",
        async (status) => {
            returningMock.mockResolvedValue([]);
            selectWhereMock.mockResolvedValue([{ id: "g1", status }]);

            await expect(
                answerPending("s1", "g1", "host", answer)
            ).rejects.toThrow(SpaceGuestNotPendingError);
        }
    );
});

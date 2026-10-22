import { beforeEach, describe, expect, it, vi } from "vitest";

const { dueMock, updatedMock, publishMock, listChangedMock } = vi.hoisted(
    () => ({
        dueMock: vi.fn(),
        updatedMock: vi.fn(),
        publishMock: vi.fn(),
        listChangedMock: vi.fn(),
    })
);

vi.mock("../utils/guestEvents", () => ({
    publishSpaceGuestEvent: publishMock,
    publishGuestListChanged: listChangedMock,
}));
vi.mock("@standin/database", () => ({
    spaceGuestsTable: {},
    usersTable: {},
    userProfilePicturesTable: {},
    and: vi.fn(),
    inArray: vi.fn(),
    isNull: vi.fn(),
    lte: vi.fn(),
    db: {
        select: () => ({ from: () => ({ where: dueMock }) }),
        update: () => ({
            set: () => ({ where: () => ({ returning: updatedMock }) }),
        }),
    },
}));

import { expireDueSpaceGuests } from "../expireDue";

const now = new Date("2026-10-22T12:00:00Z");
const row = (id: string, userId: string, status: string) => ({
    id,
    spaceId: "s1",
    userId,
    status,
    statusReason: "TIMEOUT",
    respondedBy: null,
    respondedAt: now,
    expiresAt: new Date("2026-10-22T11:00:00Z"),
    requestedAt: new Date("2026-10-21T11:00:00Z"),
});

describe("expireDueSpaceGuests", () => {
    beforeEach(() => vi.clearAllMocks());

    it("does nothing when nothing is due", async () => {
        dueMock.mockResolvedValue([]);

        expect(await expireDueSpaceGuests(now)).toEqual([]);
        expect(updatedMock).not.toHaveBeenCalled();
        expect(publishMock).not.toHaveBeenCalled();
    });

    it("tells every guest, and cuts the sockets of the admitted ones only", async () => {
        dueMock.mockResolvedValue([
            { id: "g1", status: "PENDING" },
            { id: "g2", status: "ADMITTED" },
        ]);
        updatedMock.mockResolvedValue([
            row("g1", "u1", "DENIED"),
            row("g2", "u2", "DENIED"),
        ]);

        const expired = await expireDueSpaceGuests(now);

        expect(expired).toEqual([
            { spaceId: "s1", userId: "u1", wasAdmitted: false },
            { spaceId: "s1", userId: "u2", wasAdmitted: true },
        ]);
        const types = publishMock.mock.calls.map(([event]) => [
            event.type,
            event.userId,
        ]);
        expect(types).toEqual([
            ["status", "u1"],
            ["status", "u2"],
            ["removed", "u2"],
        ]);
    });

    it("tells the hosts of each space once", async () => {
        dueMock.mockResolvedValue([
            { id: "g1", status: "PENDING" },
            { id: "g2", status: "PENDING" },
        ]);
        updatedMock.mockResolvedValue([
            row("g1", "u1", "DENIED"),
            row("g2", "u2", "DENIED"),
        ]);

        await expireDueSpaceGuests(now);

        expect(listChangedMock).toHaveBeenCalledTimes(1);
        expect(listChangedMock).toHaveBeenCalledWith("s1");
    });

    it("skips a row a host answered between the read and the update", async () => {
        dueMock.mockResolvedValue([{ id: "g1", status: "PENDING" }]);
        updatedMock.mockResolvedValue([]);

        expect(await expireDueSpaceGuests(now)).toEqual([]);
        expect(publishMock).not.toHaveBeenCalled();
    });
});

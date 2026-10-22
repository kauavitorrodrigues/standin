import { beforeEach, describe, expect, it, vi } from "vitest";

const { answerMock, loadMock, publishMock, listChangedMock } = vi.hoisted(
    () => ({
        answerMock: vi.fn(),
        loadMock: vi.fn(),
        publishMock: vi.fn(),
        listChangedMock: vi.fn(),
    })
);

vi.mock("../utils/answerPending", () => ({ answerPending: answerMock }));
vi.mock("../utils/loadGuest", () => ({ loadGuest: loadMock }));
vi.mock("../utils/guestEvents", () => ({
    publishSpaceGuestEvent: publishMock,
    publishGuestListChanged: listChangedMock,
}));

import { admitSpaceGuest } from "../admit";
import { denySpaceGuest } from "../deny";

const row = {
    id: "g1",
    spaceId: "s1",
    userId: "guest-user",
    status: "ADMITTED",
    statusReason: "HOST_ADMITTED",
    respondedBy: "host",
    respondedAt: new Date("2026-10-22T12:00:00Z"),
    expiresAt: new Date("2026-10-23T12:00:00Z"),
    requestedAt: new Date("2026-10-22T11:00:00Z"),
};

describe("admitSpaceGuest", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        answerMock.mockResolvedValue(row);
        loadMock.mockResolvedValue({ id: "g1", status: "ADMITTED" });
    });

    it("admits for 24 hours from now, by the host", async () => {
        await admitSpaceGuest("s1", "g1", "host");

        const [, , hostId, answer, now] = answerMock.mock.calls[0];
        expect(hostId).toBe("host");
        expect(answer.status).toBe("ADMITTED");
        expect(answer.statusReason).toBe("HOST_ADMITTED");
        expect(answer.expiresAt.getTime() - now.getTime()).toBe(
            24 * 60 * 60 * 1000
        );
    });

    it("tells the guest alone, with no sensitive field", async () => {
        await admitSpaceGuest("s1", "g1", "host");

        expect(publishMock).toHaveBeenCalledTimes(1);
        const event = publishMock.mock.calls[0][0];
        expect(event).toMatchObject({
            type: "status",
            userId: "guest-user",
            state: { status: "ADMITTED", statusReason: "HOST_ADMITTED" },
        });
        expect(event.state).not.toHaveProperty("userId");
    });

    it("tells the hosts the list changed, so no card is left stale", async () => {
        await admitSpaceGuest("s1", "g1", "host");

        expect(listChangedMock).toHaveBeenCalledWith("s1");
    });

    it("tells nobody when the answer is refused", async () => {
        answerMock.mockRejectedValue(new Error("not pending"));

        await expect(admitSpaceGuest("s1", "g1", "host")).rejects.toThrow();
        expect(publishMock).not.toHaveBeenCalled();
        expect(listChangedMock).not.toHaveBeenCalled();
    });
});

describe("denySpaceGuest", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        answerMock.mockResolvedValue({
            ...row,
            status: "DENIED",
            statusReason: "HOST_DENIED",
        });
        loadMock.mockResolvedValue({ id: "g1", status: "DENIED" });
    });

    it("denies without opening a window", async () => {
        await denySpaceGuest("s1", "g1", "host");

        const answer = answerMock.mock.calls[0][3];
        expect(answer).toEqual({
            status: "DENIED",
            statusReason: "HOST_DENIED",
        });
    });

    it("tells the hosts the list changed", async () => {
        await denySpaceGuest("s1", "g1", "host");

        expect(listChangedMock).toHaveBeenCalledWith("s1");
    });

    it("tells the guest it was denied", async () => {
        await denySpaceGuest("s1", "g1", "host");

        expect(publishMock).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "status",
                userId: "guest-user",
                state: expect.objectContaining({ status: "DENIED" }),
            })
        );
    });
});

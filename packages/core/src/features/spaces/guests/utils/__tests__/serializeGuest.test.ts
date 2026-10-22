import { describe, expect, it } from "vitest";
import { serializeGuest, serializeGuestState } from "../serializeGuest";

const now = new Date("2026-10-22T12:00:00Z");
const row = {
    id: "g1",
    spaceId: "s1",
    userId: "u1",
    name: "Ana",
    profilePictureFileId: null as string | null,
    status: "ADMITTED" as const,
    statusReason: "HOST_ADMITTED" as const,
    respondedBy: "host",
    respondedAt: new Date("2026-10-22T11:00:00Z"),
    expiresAt: new Date("2026-10-23T11:00:00Z"),
    requestedAt: new Date("2026-10-22T10:00:00Z"),
};

describe("serializeGuest", () => {
    it("writes the dates as ISO strings and keeps a live state", () => {
        expect(serializeGuest(row, now)).toEqual({
            id: "g1",
            spaceId: "s1",
            userId: "u1",
            name: "Ana",
            profilePictureUrl: null,
            status: "ADMITTED",
            statusReason: "HOST_ADMITTED",
            respondedBy: "host",
            respondedAt: "2026-10-22T11:00:00.000Z",
            expiresAt: "2026-10-23T11:00:00.000Z",
            requestedAt: "2026-10-22T10:00:00.000Z",
        });
    });

    it("gives the url of the photo of the person", () => {
        const withPhoto = { ...row, profilePictureFileId: "file-9" };

        expect(serializeGuest(withPhoto, now).profilePictureUrl).toBe(
            "/files/file-9"
        );
    });

    it("gives no url for a person with no photo", () => {
        expect(serializeGuest(row, now).profilePictureUrl).toBeNull();
    });

    it("reads a lapsed admission as denied by timeout", () => {
        const later = new Date("2026-10-24T00:00:00Z");

        expect(serializeGuest(row, later)).toMatchObject({
            status: "DENIED",
            statusReason: "TIMEOUT",
        });
    });

    it("keeps a null response date", () => {
        const pending = {
            ...row,
            status: "PENDING" as const,
            statusReason: "AWAITING_RESPONSE" as const,
            respondedBy: null,
            respondedAt: null,
        };

        expect(serializeGuest(pending, now).respondedAt).toBeNull();
    });
});

describe("serializeGuestState", () => {
    it("shows the guest only their own request", () => {
        const state = serializeGuestState(row, now);

        expect(state).toEqual({
            id: "g1",
            spaceId: "s1",
            status: "ADMITTED",
            statusReason: "HOST_ADMITTED",
            respondedAt: "2026-10-22T11:00:00.000Z",
            expiresAt: "2026-10-23T11:00:00.000Z",
        });
        expect(state).not.toHaveProperty("userId");
        expect(state).not.toHaveProperty("respondedBy");
    });
});

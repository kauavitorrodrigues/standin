import { describe, expect, it } from "vitest";
import { resolveAnnounceDisabledReason } from "../resolveAnnounceDisabledReason";
import { shouldAutoStopAnnouncing } from "../shouldAutoStopAnnouncing";
import { shouldAutoStopVideoSharing } from "../shouldAutoStopVideoSharing";
import { listAnnouncerNames } from "../listAnnouncerNames";
import { resolveAnnouncingVerb } from "../resolveAnnouncingVerb";

describe("resolveAnnounceDisabledReason", () => {
    it("blocks announcing while the microphone is muted", () => {
        expect(resolveAnnounceDisabledReason(false)).toBe("mic-muted");
    });

    it("allows announcing while the microphone is on", () => {
        expect(resolveAnnounceDisabledReason(true)).toBeNull();
    });
});

describe("shouldAutoStopAnnouncing", () => {
    it("stops when the microphone is muted during an announcement", () => {
        expect(
            shouldAutoStopAnnouncing({
                isMicEnabled: false,
                isAnnouncing: true,
                isRequestPending: false,
            })
        ).toBe(true);
    });

    it("does not stop while the microphone is on", () => {
        expect(
            shouldAutoStopAnnouncing({
                isMicEnabled: true,
                isAnnouncing: true,
                isRequestPending: false,
            })
        ).toBe(false);
    });

    it("has nothing to stop when not announcing", () => {
        expect(
            shouldAutoStopAnnouncing({
                isMicEnabled: false,
                isAnnouncing: false,
                isRequestPending: false,
            })
        ).toBe(false);
    });

    it("waits for a request in flight", () => {
        expect(
            shouldAutoStopAnnouncing({
                isMicEnabled: false,
                isAnnouncing: true,
                isRequestPending: true,
            })
        ).toBe(false);
    });
});

describe("listAnnouncerNames", () => {
    const announcers = [
        { socketId: "s2", userId: "bia", announcingSince: 2 },
        { socketId: "s1", userId: "ana", announcingSince: 1 },
        { socketId: "s3", userId: "zed", announcingSince: 3 },
    ];
    const names = new Map([
        ["ana", "Ana"],
        ["bia", "Bia"],
    ]);

    it("lists the names in the order received with the fallback", () => {
        expect(listAnnouncerNames(announcers, names, "Alguém")).toEqual([
            "Bia",
            "Ana",
            "Alguém",
        ]);
    });

    it("returns nothing for an empty list", () => {
        expect(listAnnouncerNames([], names, "Alguém")).toEqual([]);
    });
});

describe("resolveAnnouncingVerb", () => {
    it("uses the singular for one person", () => {
        expect(resolveAnnouncingVerb(1)).toBe("está anunciando");
    });

    it("uses the plural for several", () => {
        expect(resolveAnnouncingVerb(2)).toBe("estão anunciando");
        expect(resolveAnnouncingVerb(5)).toBe("estão anunciando");
    });
});

describe("shouldAutoStopVideoSharing", () => {
    it("stops when the camera goes off while sharing", () => {
        expect(
            shouldAutoStopVideoSharing({
                isCameraEnabled: false,
                isSharingVideo: true,
                isRequestPending: false,
            })
        ).toBe(true);
    });

    it("does not stop while the camera is on", () => {
        expect(
            shouldAutoStopVideoSharing({
                isCameraEnabled: true,
                isSharingVideo: true,
                isRequestPending: false,
            })
        ).toBe(false);
    });

    it("does nothing when nothing is shared or a request is in flight", () => {
        expect(
            shouldAutoStopVideoSharing({
                isCameraEnabled: false,
                isSharingVideo: false,
                isRequestPending: false,
            })
        ).toBe(false);
        expect(
            shouldAutoStopVideoSharing({
                isCameraEnabled: false,
                isSharingVideo: true,
                isRequestPending: true,
            })
        ).toBe(false);
    });
});

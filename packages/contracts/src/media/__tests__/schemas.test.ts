import { describe, expect, it } from "vitest";
import {
    MediaCloseProducerSchema,
    MediaConnectTransportSchema,
    MediaConsumerReadySchema,
    MediaCreateTransportSchema,
    MediaProduceSchema,
    MediaRestartIceSchema,
    MediaSetFocusSchema,
    MediaSetLowQualitySchema,
    MediaSetMutedSchema,
    MediaSetHiddenVideoSchema,
    MEDIA_PAUSE_REASONS,
    MAX_MEDIA_HIDDEN_VIDEOS,
    MediaEvents,
    MediaSetPinsSchema,
    MediaSetPrivacySchema,
} from "..";

describe("media signalling schemas", () => {
    it("needs a transport id to restart ICE", () => {
        expect(
            MediaRestartIceSchema.safeParse({ transportId: "t1" }).success
        ).toBe(true);
        expect(MediaRestartIceSchema.safeParse({}).success).toBe(false);
        expect(MediaRestartIceSchema.safeParse({ transportId: "" }).success).toBe(
            false
        );
    });

    it("accepts a send and a recv transport and nothing else", () => {
        expect(
            MediaCreateTransportSchema.safeParse({ direction: "send" }).success
        ).toBe(true);
        expect(
            MediaCreateTransportSchema.safeParse({
                direction: "recv",
                rtpCapabilities: { codecs: [] },
            }).success
        ).toBe(true);
        // A receive transport without the capabilities of the device is refused.
        expect(
            MediaCreateTransportSchema.safeParse({ direction: "recv" }).success
        ).toBe(false);
        expect(
            MediaCreateTransportSchema.safeParse({ direction: "both" }).success
        ).toBe(false);
        expect(MediaCreateTransportSchema.safeParse({}).success).toBe(false);
    });

    it("needs a transport id and an object of DTLS parameters to connect", () => {
        const ok = {
            transportId: "t1",
            dtlsParameters: { role: "client", fingerprints: [] },
        };
        expect(MediaConnectTransportSchema.safeParse(ok).success).toBe(true);
        expect(
            MediaConnectTransportSchema.safeParse({ ...ok, transportId: "" })
                .success
        ).toBe(false);
        expect(
            MediaConnectTransportSchema.safeParse({
                ...ok,
                dtlsParameters: "x",
            }).success
        ).toBe(false);
    });

    it("accepts the four sources and rejects an unknown one", () => {
        const base = { transportId: "t1", rtpParameters: { codecs: [] } };
        ["mic", "camera", "screen", "screen-audio"].forEach((source) => {
            expect(
                MediaProduceSchema.safeParse({ ...base, source }).success
            ).toBe(true);
        });
        expect(
            MediaProduceSchema.safeParse({ ...base, source: "tv" }).success
        ).toBe(false);
        expect(
            MediaProduceSchema.safeParse({
                ...base,
                source: "mic",
                rtpParameters: [],
            }).success
        ).toBe(false);
    });

    it("needs ids to close a producer and to confirm a consumer", () => {
        expect(
            MediaCloseProducerSchema.safeParse({ producerId: "p" }).success
        ).toBe(true);
        expect(
            MediaCloseProducerSchema.safeParse({ producerId: "" }).success
        ).toBe(false);
        expect(
            MediaConsumerReadySchema.safeParse({ consumerId: "c" }).success
        ).toBe(true);
        expect(MediaConsumerReadySchema.safeParse({}).success).toBe(false);
    });

    it("allows clearing the focus with an empty list", () => {
        expect(MediaSetFocusSchema.safeParse({ views: [] }).success).toBe(
            true
        );
        expect(
            MediaSetFocusSchema.safeParse({
                views: [{ userId: "u1", layer: "mid" }],
            }).success
        ).toBe(true);
        expect(
            MediaSetFocusSchema.safeParse({
                views: [{ userId: "", layer: "mid" }],
            }).success
        ).toBe(false);
        expect(
            MediaSetFocusSchema.safeParse({
                views: [{ userId: "u1", layer: "ultra" }],
            }).success
        ).toBe(false);
    });

    it("accepts at most eight views", () => {
        const view = (index: number) => ({
            userId: `u${index}`,
            layer: "high" as const,
        });

        expect(
            MediaSetFocusSchema.safeParse({
                views: Array.from({ length: 8 }, (_, i) => view(i)),
            }).success
        ).toBe(true);
        expect(
            MediaSetFocusSchema.safeParse({
                views: Array.from({ length: 9 }, (_, i) => view(i)),
            }).success
        ).toBe(false);
    });

    it("accepts at most two pinned people", () => {
        expect(MediaSetPinsSchema.safeParse({ userIds: [] }).success).toBe(
            true
        );
        expect(
            MediaSetPinsSchema.safeParse({ userIds: ["u1", "u2"] }).success
        ).toBe(true);
        expect(
            MediaSetPinsSchema.safeParse({ userIds: ["u1", "u2", "u3"] })
                .success
        ).toBe(false);
        expect(MediaSetPinsSchema.safeParse({ userIds: [""] }).success).toBe(
            false
        );
        expect(MediaSetPinsSchema.safeParse({}).success).toBe(false);
    });

    it("needs booleans for low quality and muted", () => {
        expect(
            MediaSetLowQualitySchema.safeParse({ enabled: true }).success
        ).toBe(true);
        expect(
            MediaSetLowQualitySchema.safeParse({ enabled: "yes" }).success
        ).toBe(false);
        expect(MediaSetMutedSchema.safeParse({ muted: false }).success).toBe(
            true
        );
        expect(MediaSetMutedSchema.safeParse({}).success).toBe(false);
    });

    it("needs both privacy flags as booleans", () => {
        expect(
            MediaSetPrivacySchema.safeParse({ headphones: true, focus: false })
                .success
        ).toBe(true);
        expect(
            MediaSetPrivacySchema.safeParse({ headphones: true }).success
        ).toBe(false);
        expect(
            MediaSetPrivacySchema.safeParse({ headphones: "yes", focus: false })
                .success
        ).toBe(false);
    });
});

describe("hiding the video of people", () => {
    it("takes a list of user ids, empty to show everybody again", () => {
        expect(MediaSetHiddenVideoSchema.safeParse({ userIds: [] }).success).toBe(
            true
        );
        expect(
            MediaSetHiddenVideoSchema.safeParse({ userIds: ["u1", "u2"] }).success
        ).toBe(true);
    });

    it("refuses an empty id, a missing list and a list that is too long", () => {
        expect(
            MediaSetHiddenVideoSchema.safeParse({ userIds: [""] }).success
        ).toBe(false);
        expect(MediaSetHiddenVideoSchema.safeParse({}).success).toBe(false);
        const tooMany = Array.from(
            { length: MAX_MEDIA_HIDDEN_VIDEOS + 1 },
            (_, index) => `u${index}`
        );
        expect(
            MediaSetHiddenVideoSchema.safeParse({ userIds: tooMany }).success
        ).toBe(false);
    });
});

describe("pause reasons and their events", () => {
    it("names the four reasons a video is held back", () => {
        expect(Object.values(MEDIA_PAUSE_REASONS).sort()).toEqual([
            "client-limit",
            "server-limit",
            "space-rule",
            "user-hidden",
        ]);
    });

    it("has an event for a stream held back, one for it flowing again and one for the hiding", () => {
        expect(MediaEvents.CONSUMER_PAUSED).toBe("media:consumer-paused");
        expect(MediaEvents.CONSUMER_RESUMED).toBe("media:consumer-resumed");
        expect(MediaEvents.SET_HIDDEN_VIDEO).toBe("media:set-hidden-video");
        expect(MediaEvents.HIDDEN_VIDEO_CHANGED).toBe(
            "media:hidden-video-changed"
        );
    });
});

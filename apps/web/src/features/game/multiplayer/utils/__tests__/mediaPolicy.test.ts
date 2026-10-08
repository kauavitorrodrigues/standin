import { describe, expect, it } from "vitest";
import { MAX_AUDIBLE_RADIUS } from "../../consts/audio";
import {
    CAMERA_ENCODING_BASE,
    CAMERA_ENCODING_FLOOR_BITRATE,
    MAX_VIDEO_PEERS,
    SCREEN_ENCODING_FLOOR_BITRATE,
    SCREEN_TOTAL_BITRATE_BUDGET,
    VIDEO_ENTER_RADIUS,
    VIDEO_EXIT_RADIUS,
} from "../../consts/video";
import {
    getPeerMediaPolicies,
    getReceivingVideoPeers,
    getVideoEncoding,
    selectVideoPeers,
} from "../mediaPolicy";

const distances = (entries: Record<string, number>) =>
    new Map(Object.entries(entries));

describe("selectVideoPeers", () => {
    it("selects a peer inside the enter radius", () => {
        const result = selectVideoPeers(
            distances({ a: VIDEO_ENTER_RADIUS }),
            new Set()
        );
        expect(result.has("a")).toBe(true);
    });

    it("does not select a new peer between the enter and exit radius", () => {
        const midway = (VIDEO_ENTER_RADIUS + VIDEO_EXIT_RADIUS) / 2;
        const result = selectVideoPeers(distances({ a: midway }), new Set());
        expect(result.has("a")).toBe(false);
    });

    it("keeps a peer that already receives video until the exit radius", () => {
        const midway = (VIDEO_ENTER_RADIUS + VIDEO_EXIT_RADIUS) / 2;
        const result = selectVideoPeers(
            distances({ a: midway }),
            new Set(["a"])
        );
        expect(result.has("a")).toBe(true);
    });

    it("drops a receiving peer once beyond the exit radius", () => {
        const result = selectVideoPeers(
            distances({ a: VIDEO_EXIT_RADIUS + 1 }),
            new Set(["a"])
        );
        expect(result.has("a")).toBe(false);
    });

    it("does not flip while hovering at the boundary", () => {
        let receiving = new Set<string>();
        const trace: boolean[] = [];

        [
            VIDEO_ENTER_RADIUS - 1,
            VIDEO_ENTER_RADIUS + 5,
            VIDEO_ENTER_RADIUS - 2,
            VIDEO_ENTER_RADIUS + 10,
        ].forEach((distance) => {
            receiving = selectVideoPeers(distances({ a: distance }), receiving);
            trace.push(receiving.has("a"));
        });

        expect(trace).toEqual([true, true, true, true]);
    });

    it("keeps only the closest MAX_VIDEO_PEERS", () => {
        const entries: Record<string, number> = {};
        for (let index = 0; index < MAX_VIDEO_PEERS + 2; index++) {
            entries[`peer-${index}`] = index + 1;
        }

        const result = selectVideoPeers(distances(entries), new Set());

        expect(result.size).toBe(MAX_VIDEO_PEERS);
        expect(result.has("peer-0")).toBe(true);
        expect(result.has(`peer-${MAX_VIDEO_PEERS}`)).toBe(false);
    });

    it("returns nothing when there are no peers", () => {
        expect(selectVideoPeers(new Map(), new Set()).size).toBe(0);
    });
});

describe("getPeerMediaPolicies", () => {
    it("is audible strictly inside the audible radius", () => {
        const policies = getPeerMediaPolicies(
            distances({
                near: MAX_AUDIBLE_RADIUS - 1,
                edge: MAX_AUDIBLE_RADIUS,
                far: MAX_AUDIBLE_RADIUS + 200,
            }),
            new Set()
        );

        expect(policies.get("near")?.audio).toBe(true);
        expect(policies.get("edge")?.audio).toBe(false);
        expect(policies.get("far")).toEqual({ audio: false, video: false });
    });

    it("a peer out of range gets no media at all", () => {
        const policies = getPeerMediaPolicies(
            distances({ far: 9999 }),
            new Set(["far"])
        );
        expect(policies.get("far")).toEqual({ audio: false, video: false });
    });

    it("getReceivingVideoPeers lists exactly the peers with video", () => {
        const policies = getPeerMediaPolicies(
            distances({ near: 10, far: 9999 }),
            new Set()
        );
        expect([...getReceivingVideoPeers(policies)]).toEqual(["near"]);
    });
});

describe("getVideoEncoding", () => {
    it("never drops below the floor", () => {
        expect(getVideoEncoding("camera", 1000).maxBitrate).toBe(
            CAMERA_ENCODING_FLOOR_BITRATE
        );
        expect(getVideoEncoding("screen", 1000).maxBitrate).toBe(
            SCREEN_ENCODING_FLOOR_BITRATE
        );
    });

    it("bitrate does not increase as receivers are added", () => {
        for (const kind of ["camera", "screen"] as const) {
            let previous = Infinity;
            for (let receivers = 1; receivers <= 8; receivers++) {
                const { maxBitrate } = getVideoEncoding(kind, receivers);
                expect(maxBitrate).toBeLessThanOrEqual(previous);
                previous = maxBitrate;
            }
        }
    });

    it("never sends more than the screen budget in total", () => {
        for (let receivers = 1; receivers <= MAX_VIDEO_PEERS; receivers++) {
            const { maxBitrate } = getVideoEncoding("screen", receivers);

            expect(maxBitrate * receivers).toBeLessThanOrEqual(
                SCREEN_TOTAL_BITRATE_BUDGET
            );
        }
    });

    it("treats zero receivers like one", () => {
        expect(getVideoEncoding("camera", 0)).toEqual(
            getVideoEncoding("camera", 1)
        );
        expect(getVideoEncoding("camera", 1).maxBitrate).toBe(
            CAMERA_ENCODING_BASE.maxBitrate
        );
    });

    it("scales the camera resolution down only for many receivers", () => {
        expect(getVideoEncoding("camera", 2).scaleResolutionDownBy).toBe(1);
        expect(getVideoEncoding("camera", 3).scaleResolutionDownBy).toBe(1.5);
        expect(getVideoEncoding("screen", 4).scaleResolutionDownBy).toBe(1);
    });
});

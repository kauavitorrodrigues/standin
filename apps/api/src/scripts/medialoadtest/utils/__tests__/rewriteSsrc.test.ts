import { describe, expect, it } from "vitest";
import { rewriteSsrc } from "../rewriteSsrc";
import { buildAudioFeedArgs, buildVideoFeedArgs } from "../buildFfmpegArgs";
import { SINGLE_LAYER_FEEDS, THREE_LAYER_FEEDS } from "../../consts";

describe("rewriteSsrc", () => {
    const packet = Buffer.alloc(20, 1);

    it("puts the new SSRC in the header and leaves the rest alone", () => {
        const copy = rewriteSsrc(packet, 0x01020304)!;
        expect(copy.readUInt32BE(8)).toBe(0x01020304);
        expect(copy.subarray(0, 8)).toEqual(packet.subarray(0, 8));
        expect(copy.subarray(12)).toEqual(packet.subarray(12));
    });

    it("never changes the original packet", () => {
        rewriteSsrc(packet, 99);
        expect(packet.readUInt32BE(8)).toBe(0x01010101);
    });

    it("refuses a packet too short to be RTP", () => {
        expect(rewriteSsrc(Buffer.alloc(4), 1)).toBeNull();
    });
});

describe("ffmpeg feed arguments", () => {
    it("send RTP to the loopback with the payload types the producers declare", () => {
        const audio = buildAudioFeedArgs().join(" ");
        const video = buildVideoFeedArgs(SINGLE_LAYER_FEEDS[0]).join(" ");
        expect(audio).toContain("-payload_type 111");
        expect(video).toContain("-payload_type 96");
        expect(audio).toContain("rtp://127.0.0.1:");
        expect(video).toContain("rtp://127.0.0.1:");
    });
});

describe("video layer feeds", () => {
    it("give each layer its own port and a larger size than the one before", () => {
        const ports = THREE_LAYER_FEEDS.map((feed) => feed.port);
        const widths = THREE_LAYER_FEEDS.map((feed) =>
            Number(feed.size.split("x")[0])
        );

        expect(new Set(ports).size).toBe(3);
        expect(widths).toEqual([...widths].sort((a, b) => a - b));
    });

    it("send each layer to the port of its feed", () => {
        THREE_LAYER_FEEDS.forEach((feed) => {
            expect(buildVideoFeedArgs(feed).join(" ")).toContain(
                `rtp://127.0.0.1:${feed.port}`
            );
        });
    });
});

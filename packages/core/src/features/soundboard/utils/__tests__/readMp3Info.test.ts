import { describe, expect, it } from "vitest";
import { readMp3Info } from "../readMp3Info";
import { buildFrame, buildId3v2, buildMp3, FRAME_MS } from "./mp3Fixtures";

describe("readMp3Info", () => {
    it("sums the length of every frame", () => {
        const info = readMp3Info(buildMp3(100));

        expect(info?.durationMs).toBe(Math.round(100 * FRAME_MS));
    });

    it("skips an ID3v2 tag at the start", () => {
        const info = readMp3Info(buildMp3(10, buildId3v2(300)));

        expect(info?.durationMs).toBe(Math.round(10 * FRAME_MS));
    });

    it("stops at trailing bytes such as an ID3v1 tag", () => {
        const tag = Buffer.concat([Buffer.from("TAG"), Buffer.alloc(125)]);
        const info = readMp3Info(Buffer.concat([buildMp3(10), tag]));

        expect(info?.durationMs).toBe(Math.round(10 * FRAME_MS));
    });

    it("does not count an Xing frame, which holds no sound", () => {
        const xing = buildFrame();
        xing.write("Xing", 36, "latin1");
        const info = readMp3Info(Buffer.concat([xing, buildMp3(10)]));

        expect(info?.durationMs).toBe(Math.round(10 * FRAME_MS));
    });

    it("reads MPEG 2 files, which have 576 samples per frame", () => {
        // MPEG 2 Layer III, 64 kbps, 22.05 kHz: 72 * 64000 / 22050 = 208 bytes.
        const frame = Buffer.alloc(208);
        Buffer.from([0xff, 0xf3, 0x80, 0x00]).copy(frame);
        const info = readMp3Info(Buffer.concat([frame, frame, frame, frame]));

        expect(info?.durationMs).toBe(Math.round(((4 * 576) / 22050) * 1000));
    });

    it("rejects bytes that are not an mp3", () => {
        expect(readMp3Info(Buffer.from("RIFF....WAVEfmt "))).toBeNull();
        expect(readMp3Info(Buffer.alloc(2000))).toBeNull();
        expect(readMp3Info(Buffer.alloc(0))).toBeNull();
    });

    it("rejects layer II audio declared as mpeg", () => {
        const layer2 = Buffer.alloc(417);
        Buffer.from([0xff, 0xfd, 0x90, 0x00]).copy(layer2);

        expect(readMp3Info(layer2)).toBeNull();
    });

    it("rejects a header with a reserved bitrate or sample rate", () => {
        const badBitrate = Buffer.alloc(417);
        Buffer.from([0xff, 0xfb, 0xf0, 0x00]).copy(badBitrate);
        const badRate = Buffer.alloc(417);
        Buffer.from([0xff, 0xfb, 0x9c, 0x00]).copy(badRate);

        expect(readMp3Info(badBitrate)).toBeNull();
        expect(readMp3Info(badRate)).toBeNull();
    });

    it("rejects a file whose sample rate changes along the way", () => {
        const other = Buffer.alloc(384);
        // 48 kHz: 144 * 128000 / 48000 = 384 bytes.
        Buffer.from([0xff, 0xfb, 0x94, 0x00]).copy(other);

        expect(readMp3Info(Buffer.concat([buildMp3(3), other]))).toBeNull();
    });

    it("rejects a file with more audio after the last valid frame", () => {
        const tail = Buffer.alloc(5000, 0x41);

        expect(readMp3Info(Buffer.concat([buildMp3(5), tail]))).toBeNull();
    });

    it("ignores a last frame that is cut short", () => {
        const cut = buildMp3(5).subarray(0, 5 * 417 - 100);

        expect(readMp3Info(cut)?.durationMs).toBe(Math.round(4 * FRAME_MS));
    });
});

import { describe, expect, it } from "vitest";
import { buildSenderReport } from "../buildSenderReport";

describe("buildSenderReport", () => {
    const report = buildSenderReport({
        ssrc: 0x01020304,
        nowMs: 1_000_500,
        rtpTimestamp: 90_000,
        packetCount: 7,
        octetCount: 7000,
    });

    it("is a version 2 sender report of six words", () => {
        expect(report[0]).toBe(0x80);
        expect(report[1]).toBe(200);
        expect(report.readUInt16BE(2)).toBe(6);
        expect(report.length).toBe(28);
    });

    it("carries the SSRC, the RTP time and the counters", () => {
        expect(report.readUInt32BE(4)).toBe(0x01020304);
        expect(report.readUInt32BE(16)).toBe(90_000);
        expect(report.readUInt32BE(20)).toBe(7);
        expect(report.readUInt32BE(24)).toBe(7000);
    });

    it("writes the wall clock as NTP seconds and a half second fraction", () => {
        // 1000.5 s after 1970 is 2208988800 + 1000 s after 1900.
        expect(report.readUInt32BE(8)).toBe(2_208_988_800 + 1000);
        expect(report.readUInt32BE(12)).toBe(2 ** 31);
    });
});

import { describe, expect, it } from "vitest";
import { median } from "../median";
import { measureClient } from "../measureClient";
import { reduceStatsReport } from "../reduceStatsReport";
import { formatBrowserResults } from "../formatBrowserResults";
import { summarizeRun, summarizeRuns } from "../summarizeRun";
import type { ClientMetrics, ClientSnapshot, StreamStat } from "../../types";

const stream = (over: Partial<StreamStat>): StreamStat => ({
    direction: "in",
    kind: "video",
    timestampMs: 0,
    bytes: 0,
    packetsReceived: 0,
    packetsLost: 0,
    framesDecoded: 0,
    framesDropped: 0,
    jitterSec: 0,
    ...over,
});

const snapshot = (over: Partial<ClientSnapshot>): ClientSnapshot => ({
    streams: {},
    taskSec: 0,
    metricsClockSec: 0,
    heapMb: 0,
    ...over,
});

const metrics = (over: Partial<ClientMetrics>): ClientMetrics => ({
    receiveKbps: 0,
    sendKbps: 0,
    lossPercent: 0,
    jitterMs: 0,
    videoFps: 0,
    videoStreams: 0,
    droppedFrames: 0,
    streamChanges: 0,
    cpuBusyPercent: 0,
    heapMb: 0,
    ...over,
});

describe("median", () => {
    it("is 0 for no values", () => expect(median([])).toBe(0));
    it("takes the middle of an odd list", () =>
        expect(median([9, 1, 5])).toBe(5));
    it("averages the middle of an even list", () =>
        expect(median([4, 1, 3, 2])).toBe(2.5));
});

describe("reduceStatsReport", () => {
    it("keeps the rtp streams under their id and drops the rest", () => {
        const streams = reduceStatsReport([
            {
                id: "in-1",
                type: "inbound-rtp",
                kind: "video",
                timestamp: 5,
                bytesReceived: 100,
                packetsReceived: 10,
                packetsLost: -2,
                framesDecoded: 5,
                jitter: 0.01,
            },
            { id: "out-1", type: "outbound-rtp", kind: "audio", bytesSent: 70 },
            { id: "t", type: "transport", bytesReceived: 9999 },
        ]);
        expect(Object.keys(streams)).toEqual(["in-1", "out-1"]);
        expect(streams["in-1"]).toMatchObject({
            direction: "in",
            kind: "video",
            bytes: 100,
            packetsLost: 0,
            framesDecoded: 5,
            jitterSec: 0.01,
        });
        expect(streams["out-1"]).toMatchObject({
            direction: "out",
            bytes: 70,
        });
    });

    it("is empty for no entries", () =>
        expect(reduceStatsReport([])).toEqual({}));
});

describe("measureClient", () => {
    const start = snapshot({
        taskSec: 1,
        metricsClockSec: 10,
        streams: {
            v1: stream({ timestampMs: 1000, framesDecoded: 0 }),
            a1: stream({ kind: "audio", timestampMs: 1000 }),
            out: stream({ direction: "out", timestampMs: 1000 }),
        },
    });

    it("turns two snapshots into rates per stream", () => {
        const end = snapshot({
            taskSec: 3,
            metricsClockSec: 20,
            heapMb: 40,
            streams: {
                v1: stream({
                    timestampMs: 11000,
                    bytes: 125000,
                    packetsReceived: 99,
                    packetsLost: 1,
                    framesDecoded: 300,
                    framesDropped: 4,
                    jitterSec: 0.005,
                }),
                a1: stream({ kind: "audio", timestampMs: 11000 }),
                out: stream({
                    direction: "out",
                    timestampMs: 11000,
                    bytes: 25000,
                }),
            },
        });
        expect(measureClient(start, end)).toEqual({
            receiveKbps: 100,
            sendKbps: 20,
            lossPercent: 1,
            jitterMs: 5,
            videoFps: 30,
            videoStreams: 1,
            droppedFrames: 4,
            streamChanges: 0,
            cpuBusyPercent: 20,
            heapMb: 40,
        });
    });

    it("leaves out a stream that closed or started inside the window", () => {
        const end = snapshot({
            metricsClockSec: 20,
            streams: {
                // v1 closed, v2 is new: neither may add or subtract.
                v2: stream({
                    timestampMs: 11000,
                    bytes: 999999,
                    framesDecoded: 999,
                }),
                a1: stream({ kind: "audio", timestampMs: 11000, bytes: 10000 }),
                out: stream({ direction: "out", timestampMs: 11000 }),
            },
        });
        const result = measureClient(start, end);
        expect(result.receiveKbps).toBe(8);
        expect(result.videoFps).toBe(0);
        expect(result.streamChanges).toBe(2);
        expect(result.videoStreams).toBe(1);
    });

    it("does not divide by zero", () => {
        const same = snapshot({
            streams: { v1: stream({ timestampMs: 5 }) },
        });
        const result = measureClient(same, same);
        expect(result.receiveKbps).toBe(0);
        expect(result.lossPercent).toBe(0);
        expect(result.cpuBusyPercent).toBe(0);
    });
});

describe("summarizeRun", () => {
    it("gives the median and the worst client, lowest fps being the worst", () => {
        const summary = summarizeRun([
            metrics({ jitterMs: 1, videoFps: 30 }),
            metrics({ jitterMs: 9, videoFps: 12 }),
            metrics({ jitterMs: 3, videoFps: 28 }),
        ]);
        expect(summary.jitterMs).toEqual({ median: 3, worst: 9 });
        expect(summary.videoFps).toEqual({ median: 28, worst: 12 });
    });
});

describe("summarizeRuns", () => {
    it("takes the median of the medians and the worst of the worsts", () => {
        const runA = summarizeRun([metrics({ jitterMs: 2, videoFps: 30 })]);
        const runB = summarizeRun([metrics({ jitterMs: 8, videoFps: 10 })]);
        const runC = summarizeRun([metrics({ jitterMs: 4, videoFps: 25 })]);
        const summary = summarizeRuns([runA, runB, runC]);
        expect(summary.jitterMs).toEqual({ median: 4, worst: 8 });
        expect(summary.videoFps).toEqual({ median: 25, worst: 10 });
    });
});

describe("formatBrowserResults", () => {
    it("prints a markdown table with median / worst cells", () => {
        const summary = summarizeRun([metrics({ receiveKbps: 1234.4 })]);
        const table = formatBrowserResults([{ clients: 4, runs: 5, summary }]);
        const [header, rule, row] = table.split("\n");
        expect(header.startsWith("| Browsers | Runs | Receive kbps")).toBe(
            true
        );
        expect(rule).toContain("---");
        expect(row.startsWith("| 4 | 5 | 1234 / 1234 |")).toBe(true);
    });
});

import { median } from "./median";
import type { ClientMetrics, ClientSnapshot, StreamStat } from "../types";

const BITS_PER_BYTE = 8;
const MS_PER_SEC = 1000;

type StreamPair = { start: StreamStat; end: StreamStat; seconds: number };

// The streams present in both readings, each with its own time window. A
// stream in only one of them is not a pair: it started or closed inside the
// window and has no counters to compare.
const pairStreams = (start: ClientSnapshot, end: ClientSnapshot) =>
    Object.entries(end.streams).flatMap(([id, after]): StreamPair[] => {
        const before = start.streams[id];
        if (!before) return [];
        const seconds = (after.timestampMs - before.timestampMs) / MS_PER_SEC;
        if (seconds <= 0) return [];
        return [{ start: before, end: after, seconds }];
    });

const sum = (values: number[]): number =>
    values.reduce((total, value) => total + value, 0);

const kbpsOf = ({ start, end, seconds }: StreamPair): number =>
    ((end.bytes - start.bytes) * BITS_PER_BYTE) / seconds / MS_PER_SEC;

// What one client did between two snapshots. Rates come from the streams
// that lived through the whole window; jitter and heap are the end values.
export const measureClient = (
    start: ClientSnapshot,
    end: ClientSnapshot
): ClientMetrics => {
    const pairs = pairStreams(start, end);
    const inbound = pairs.filter((pair) => pair.end.direction === "in");
    const outbound = pairs.filter((pair) => pair.end.direction === "out");
    const videos = inbound.filter((pair) => pair.end.kind === "video");

    const received = sum(
        inbound.map((p) => p.end.packetsReceived - p.start.packetsReceived)
    );
    const lost = sum(
        inbound.map((p) => p.end.packetsLost - p.start.packetsLost)
    );
    const metricsSeconds = end.metricsClockSec - start.metricsClockSec;
    const startIds = Object.keys(start.streams);
    const endIds = Object.keys(end.streams);

    return {
        receiveKbps: sum(inbound.map(kbpsOf)),
        sendKbps: sum(outbound.map(kbpsOf)),
        lossPercent: received + lost > 0 ? (lost / (received + lost)) * 100 : 0,
        jitterMs:
            Math.max(0, ...inbound.map((p) => p.end.jitterSec)) * MS_PER_SEC,
        videoFps: median(
            videos.map(
                (p) => (p.end.framesDecoded - p.start.framesDecoded) / p.seconds
            )
        ),
        videoStreams: Object.values(end.streams).filter(
            (stream) => stream.direction === "in" && stream.kind === "video"
        ).length,
        droppedFrames: sum(
            videos.map((p) => p.end.framesDropped - p.start.framesDropped)
        ),
        streamChanges:
            endIds.filter((id) => !(id in start.streams)).length +
            startIds.filter((id) => !(id in end.streams)).length,
        cpuBusyPercent:
            metricsSeconds > 0
                ? ((end.taskSec - start.taskSec) / metricsSeconds) * 100
                : 0,
        heapMb: end.heapMb,
    };
};

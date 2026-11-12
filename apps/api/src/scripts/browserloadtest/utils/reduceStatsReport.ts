import type { StatsEntry, StreamStat } from "../types";

const readKind = (entry: StatsEntry): string =>
    entry.kind ?? entry.mediaType ?? "unknown";

const toStat = (
    entry: StatsEntry,
    direction: StreamStat["direction"]
): StreamStat => ({
    direction,
    kind: readKind(entry),
    timestampMs: entry.timestamp ?? 0,
    bytes:
        direction === "in"
            ? (entry.bytesReceived ?? 0)
            : (entry.bytesSent ?? 0),
    packetsReceived: entry.packetsReceived ?? 0,
    // Can dip below zero with duplicates, which is not a loss.
    packetsLost: Math.max(0, entry.packetsLost ?? 0),
    framesDecoded: entry.framesDecoded ?? 0,
    framesDropped: entry.framesDropped ?? 0,
    jitterSec: entry.jitter ?? 0,
});

// Keeps the RTP streams of a report under their stats id. Counters are kept
// per stream, never summed, because a stream that closes takes its history
// with it and a sum would then go backwards.
export const reduceStatsReport = (
    entries: StatsEntry[]
): Record<string, StreamStat> => {
    const streams: Record<string, StreamStat> = {};
    for (const entry of entries) {
        switch (entry.type) {
            case "inbound-rtp":
                streams[entry.id] = toStat(entry, "in");
                break;
            case "outbound-rtp":
                streams[entry.id] = toStat(entry, "out");
                break;
            default:
                break;
        }
    }
    return streams;
};

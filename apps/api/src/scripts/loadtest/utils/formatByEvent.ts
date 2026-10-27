import type { ByEvent } from "./countByEvent";
import { formatTable } from "./formatTable";

const HEADER = ["event", "msg/s", "KB/s", "% msgs", "% bytes", "bytes/msg"];

const percent = (part: number, total: number) =>
    total === 0 ? "0.0" : ((part / total) * 100).toFixed(1);

// What the bots received in a run, one row per event, the heaviest first. This
// is where "how many are positions" and "how many are emotes" is answered.
export const formatByEvent = (
    byEvent: ByEvent,
    durationSec: number
): string => {
    const entries = Object.entries(byEvent).sort(
        ([, a], [, b]) => b.bytes - a.bytes
    );
    const totalMessages = entries.reduce((sum, [, s]) => sum + s.messages, 0);
    const totalBytes = entries.reduce((sum, [, s]) => sum + s.bytes, 0);

    return formatTable(
        HEADER,
        entries.map(([event, stats]) => [
            event,
            (stats.messages / durationSec).toFixed(0),
            (stats.bytes / durationSec / 1024).toFixed(1),
            percent(stats.messages, totalMessages),
            percent(stats.bytes, totalBytes),
            (stats.bytes / Math.max(stats.messages, 1)).toFixed(0),
        ])
    );
};

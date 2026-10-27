import type { RunResult } from "../runLoadTest";
import { formatTable } from "./formatTable";
import { formatByEvent } from "./formatByEvent";

const HEADER = [
    "N",
    "joined",
    "errors",
    "join p50 ms",
    "join p99 ms",
    "msg/s",
    "KB/s",
    "rss start MB",
    "rss peak MB",
    "rss end MB",
    "api cpu %",
    "join cpu s",
];

const oneDecimal = (value: number | null) =>
    value === null ? "n/a" : value.toFixed(1);

const mb = (value: number | null) =>
    value === null ? "n/a" : value.toFixed(0);

const formatSummary = (results: RunResult[]): string =>
    formatTable(
        HEADER,
        results.map((result) => [
            String(result.count),
            String(result.joined),
            String(result.errors),
            result.joinP50Ms.toFixed(1),
            result.joinP99Ms.toFixed(1),
            result.messagesPerSec.toFixed(0),
            (result.bytesPerSec / 1024).toFixed(1),
            mb(result.rssStartMb),
            mb(result.rssPeakMb),
            mb(result.rssEndMb),
            oneDecimal(result.cpuPercent),
            oneDecimal(result.joinCpuSec),
        ])
    );

// The summary of every run, then what each run received by event.
export const formatResults = (results: RunResult[]): string =>
    [
        formatSummary(results),
        ...results.map(
            (result) =>
                `\nN=${result.count}, received by event:\n${formatByEvent(result.byEvent, result.durationSec)}`
        ),
    ].join("\n");

import { median } from "./median";
import type {
    ClientMetrics,
    MetricDirection,
    MetricKey,
    MetricSpread,
    RunSummary,
} from "../types";

export const METRIC_KEYS: MetricKey[] = [
    "receiveKbps",
    "sendKbps",
    "lossPercent",
    "jitterMs",
    "videoFps",
    "videoStreams",
    "droppedFrames",
    "streamChanges",
    "cpuBusyPercent",
    "heapMb",
];

export const WORST_DIRECTION: Record<MetricKey, MetricDirection> = {
    receiveKbps: "max",
    sendKbps: "max",
    lossPercent: "max",
    jitterMs: "max",
    videoFps: "min",
    videoStreams: "min",
    droppedFrames: "max",
    streamChanges: "max",
    cpuBusyPercent: "max",
    heapMb: "max",
};

export const pickWorst = (
    values: number[],
    direction: MetricDirection
): number => {
    if (values.length === 0) return 0;
    if (direction === "min") return Math.min(...values);
    return Math.max(...values);
};

const spreadOf = (values: number[], key: MetricKey): MetricSpread => ({
    median: median(values),
    worst: pickWorst(values, WORST_DIRECTION[key]),
});

const build = (pick: (key: MetricKey) => MetricSpread): RunSummary =>
    Object.fromEntries(
        METRIC_KEYS.map((key) => [key, pick(key)])
    ) as RunSummary;

// One run: for each metric, the median and the worst client.
export const summarizeRun = (clients: ClientMetrics[]): RunSummary =>
    build((key) =>
        spreadOf(
            clients.map((client) => client[key]),
            key
        )
    );

// Several runs of the same size: the median of the run medians and the worst
// of the run worsts, so one bad run still shows.
export const summarizeRuns = (runs: RunSummary[]): RunSummary =>
    build((key) => ({
        median: median(runs.map((run) => run[key].median)),
        worst: pickWorst(
            runs.map((run) => run[key].worst),
            WORST_DIRECTION[key]
        ),
    }));

import type { BrowserContext, CDPSession, Page } from "playwright-core";

// The few fields of an RTCStats entry the harness reads.
export type StatsEntry = {
    id: string;
    type: string;
    kind?: string;
    mediaType?: string;
    timestamp?: number;
    bytesReceived?: number;
    bytesSent?: number;
    packetsReceived?: number;
    packetsLost?: number;
    framesDecoded?: number;
    framesDropped?: number;
    jitter?: number;
};

export type StreamDirection = "in" | "out";

// The counters of one RTP stream, kept under its stats id. Counters only
// grow while the stream lives; a stream that closes leaves no entry.
export type StreamStat = {
    direction: StreamDirection;
    kind: string;
    // Clock of the browser for this reading, in ms.
    timestampMs: number;
    bytes: number;
    packetsReceived: number;
    packetsLost: number;
    framesDecoded: number;
    framesDropped: number;
    jitterSec: number;
};

// One reading of a browser: its streams plus what the page itself costs.
export type ClientSnapshot = {
    streams: Record<string, StreamStat>;
    // Seconds the main thread spent on tasks, from the DevTools metrics.
    taskSec: number;
    // Clock of those metrics, in seconds.
    metricsClockSec: number;
    heapMb: number;
};

// What one client did between two snapshots.
export type ClientMetrics = {
    receiveKbps: number;
    sendKbps: number;
    lossPercent: number;
    jitterMs: number;
    // Median frame rate of one received video, not the sum of all of them.
    videoFps: number;
    videoStreams: number;
    droppedFrames: number;
    // Streams that appeared or closed during the window. Their counters are
    // left out of the rates, so a number above 0 means a shaky window.
    streamChanges: number;
    cpuBusyPercent: number;
    heapMb: number;
};

export type MetricKey = keyof ClientMetrics;

// "max": a bigger value is worse. "min": a smaller one is worse.
export type MetricDirection = "max" | "min";

export type MetricSpread = { median: number; worst: number };

export type RunSummary = Record<MetricKey, MetricSpread>;

export type SizeResult = { clients: number; runs: number; summary: RunSummary };

export type TableColumn = { title: string; key: MetricKey; digits: number };

export type BrowserClient = {
    index: number;
    context: BrowserContext;
    page: Page;
    cdp: CDPSession;
};

export type MetricsReply = { metrics: { name: string; value: number }[] };

export type BrowserLoadArgs = {
    spaceId: string;
    counts: number[];
    runs: number;
    durationSec: number;
    settleSec: number;
    apiUrl: string;
    webUrl: string;
    chromePath: string;
};

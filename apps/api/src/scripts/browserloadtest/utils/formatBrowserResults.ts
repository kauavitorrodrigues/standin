import type { RunSummary, SizeResult, TableColumn } from "../types";

const COLUMNS: TableColumn[] = [
    { title: "Receive kbps", key: "receiveKbps", digits: 0 },
    { title: "Send kbps", key: "sendKbps", digits: 0 },
    { title: "Loss %", key: "lossPercent", digits: 2 },
    { title: "Jitter ms", key: "jitterMs", digits: 1 },
    { title: "Video fps", key: "videoFps", digits: 1 },
    { title: "Videos received", key: "videoStreams", digits: 0 },
    { title: "Dropped frames", key: "droppedFrames", digits: 0 },
    { title: "Stream changes", key: "streamChanges", digits: 0 },
    { title: "Main thread busy %", key: "cpuBusyPercent", digits: 0 },
    { title: "JS heap MB", key: "heapMb", digits: 0 },
];

const cell = (summary: RunSummary, column: TableColumn): string => {
    const { median, worst } = summary[column.key];
    return `${median.toFixed(column.digits)} / ${worst.toFixed(column.digits)}`;
};

// A markdown table that can be pasted into the docs. Each cell is
// "median / worst": the median over the runs of the median client, and the
// worst client of any run.
export const formatBrowserResults = (results: SizeResult[]): string => {
    const header = ["Browsers", "Runs", ...COLUMNS.map((c) => c.title)];
    const rows = results.map((result) => [
        String(result.clients),
        String(result.runs),
        ...COLUMNS.map((column) => cell(result.summary, column)),
    ]);
    const line = (cells: string[]) => `| ${cells.join(" | ")} |`;
    const rule = line(header.map(() => "---"));
    return [line(header), rule, ...rows.map(line)].join("\n");
};

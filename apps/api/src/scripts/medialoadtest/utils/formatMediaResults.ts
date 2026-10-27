import type { ConsumerBreakdown } from "@standin/media";
import { formatTable } from "../../loadtest/utils/formatTable";

export type MediaRunResult = {
    people: number;
    speakers: number;
    cameras: number;
    screens: number;
    layout: string;
    durationSec: number;
    workerCpuPercent: number | null;
    processRssMb: number;
    maxConsumers: number;
    producers: number;
    ingressMbps: number;
    egressMbps: number;
    egressPerPersonMbps: number;
    consumers: ConsumerBreakdown;
    createdPerSec: number;
    closedPerSec: number;
    tickP50Ms: number;
    tickP99Ms: number;
    firstStreamP50Ms: number;
    firstStreamP99Ms: number;
};

const number = (value: number, digits = 1) => value.toFixed(digits);

const formatConsumers = (results: MediaRunResult[]): string =>
    formatTable(
        [
            "people",
            "audio",
            "video low",
            "video mid",
            "video high",
            "screen",
            "paused",
        ],
        results.map((r) => [
            String(r.people),
            String(r.consumers.audio),
            String(r.consumers.videoLow),
            String(r.consumers.videoMid),
            String(r.consumers.videoHigh),
            String(r.consumers.screen),
            String(r.consumers.paused),
        ])
    );

/** The tables the validation script prints at the end of a run. */
export const formatMediaResults = (results: MediaRunResult[]): string =>
    `${formatRun(results)}\n\nConsumers at the end of the run:\n${formatConsumers(results)}`;

const formatRun = (results: MediaRunResult[]): string =>
    formatTable(
        [
            "people",
            "mics",
            "cams",
            "screens",
            "layout",
            "producers",
            "max consumers",
            "created/s",
            "closed/s",
            "worker cpu %",
            "in Mbps",
            "out Mbps",
            "out/person Mbps",
            "rss MB",
            "tick p50",
            "tick p99",
            "1st stream p50",
            "1st stream p99",
        ],
        results.map((r) => [
            String(r.people),
            String(r.speakers),
            String(r.cameras),
            String(r.screens),
            r.layout,
            String(r.producers),
            String(r.maxConsumers),
            number(r.createdPerSec),
            number(r.closedPerSec),
            r.workerCpuPercent === null ? "n/a" : number(r.workerCpuPercent),
            number(r.ingressMbps, 2),
            number(r.egressMbps, 2),
            number(r.egressPerPersonMbps, 2),
            number(r.processRssMb, 0),
            `${number(r.tickP50Ms)} ms`,
            `${number(r.tickP99Ms)} ms`,
            `${number(r.firstStreamP50Ms, 0)} ms`,
            `${number(r.firstStreamP99Ms, 0)} ms`,
        ])
    );

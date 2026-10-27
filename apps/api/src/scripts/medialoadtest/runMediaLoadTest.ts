import { performance } from "node:perf_hooks";
import {
    MediaServer,
    type MediaNotifier,
    type SpaceMedia,
} from "@standin/media";
import {
    FIRST_SSRC,
    FULL_HD_THREE_LAYER_FEEDS,
    SINGLE_LAYER_FEEDS,
    THREE_LAYER_FEEDS,
    type VideoFeedSpec,
    MEDIA_TEST_LISTEN_IP,
    MEDIA_TEST_PORT,
    REPORT_INTERVAL_MS,
    TICK_MS,
} from "./consts";
import type { MediaRunOptions } from "./types";
import { percentile } from "../loadtest/utils/percentile";
import { arrangeWalkers } from "./utils/arrangeWalkers";
import { createSink } from "./utils/createSink";
import { joinSyntheticPeer } from "./utils/joinSyntheticPeer";
import { planStreams } from "./utils/planStreams";
import { startFeeds } from "./utils/startFeeds";
import type { MediaRunResult } from "./utils/formatMediaResults";
import { randomSpot, type Layout, type Point } from "./utils/arrange";

const QUALITY_INDEX = { low: 0, mid: 1, high: 2 } as const;

const feedsFor = ({
    layers,
    fullHd,
    quality,
}: MediaRunOptions): VideoFeedSpec[] => {
    const three = fullHd ? FULL_HD_THREE_LAYER_FEEDS : THREE_LAYER_FEEDS;
    if (layers === 3) return three;
    if (quality === null) return SINGLE_LAYER_FEEDS;
    return [three[QUALITY_INDEX[quality]]];
};

const log = (message: string) => console.log(`  ${message}`);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One run: a real media worker and a real room, with synthetic people who
 * join all at once, send audio and video from ffmpeg, walk, and are planned
 * by the real subscription planner every tick. Prints how it is going and
 * returns the numbers of the run.
 */
export const runMediaLoadTest = async (
    options: MediaRunOptions
): Promise<MediaRunResult> => {
    const joinedAt = new Map<string, number>();
    const firstStream: number[] = [];
    let created = 0;
    let closed = 0;

    // Set once the room exists. A real browser confirms each consumer it was
    // given, which is what starts the flow, so the synthetic receivers do too.
    let activeRoom: SpaceMedia | null = null;
    let reportedError = false;

    const notifier: MediaNotifier = {
        consumerNew: (peerId, payload) => {
            created += 1;
            void activeRoom
                ?.consumerReady(peerId, payload.consumerId)
                .catch((error) => {
                    if (!reportedError) console.log("  consumerReady failed:", String(error));
                    reportedError = true;
                });
            const joined = joinedAt.get(peerId);
            if (joined === undefined) return;
            firstStream.push(performance.now() - joined);
            joinedAt.delete(peerId);
        },
        consumerClosed: () => {
            closed += 1;
        },
        producerDemand: () => undefined,
    };

    const server = await MediaServer.create(
        {
            listenIp: MEDIA_TEST_LISTEN_IP,
            listenPort: MEDIA_TEST_PORT,
            logLevel: "error",
        },
        notifier
    );
    const sink = await createSink();
    const needsVideo = options.cameras + options.screens > 0;
    const feeds = await startFeeds(
        options.speakers > 0,
        needsVideo ? feedsFor(options) : []
    );

    try {
        const room = await server.acquireRoom("media-load-test");
        activeRoom = room;
        const ids = Array.from(
            { length: options.people },
            (_, index) => `p${index}`
        );
        const positions = new Map<string, Point>(
            ids.map((id) => [id, randomSpot(options.layout, options.rng)])
        );
        const source = { get: (id: string) => positions.get(id) };

        let ssrc = FIRST_SSRC;
        const nextSsrc = () => (ssrc += 1);

        // The mass join: everybody at once.
        const startedJoin = performance.now();
        await Promise.all(
            ids.map((id, index) => {
                joinedAt.set(id, performance.now());
                return joinSyntheticPeer(
                    room,
                    id,
                    sink.port,
                    planStreams(index, options, nextSsrc),
                    feeds
                );
            })
        );
        log(
            `${ids.length} people joined in ${Math.round(performance.now() - startedJoin)} ms`
        );

        // Every receiver asks for the chosen layer of the cameras it can see,
        // once everybody is in and before the first tick, so the consumers
        // are made on that layer.
        if (options.view !== null && options.cameras > 0) {
            const owners = ids.slice(0, options.cameras);
            ids.forEach((id) =>
                room.setFocus(
                    id,
                    new Map(
                        owners
                            .filter((owner) => owner !== id)
                            .map((owner) => [owner, options.view!] as const)
                    )
                )
            );
        }

        const before = await server.usage();
        const trafficBefore = await room.traffic();
        const startedAt = performance.now();
        const tickTimes: number[] = [];
        let maxConsumers = 0;
        let lastReport = startedAt;

        while (performance.now() - startedAt < options.durationSec * 1000) {
            arrangeWalkers(ids, positions, options.layout, options.rng);

            const tickStart = performance.now();
            await room.tick(Date.now(), source, new Set(ids));
            tickTimes.push(performance.now() - tickStart);
            maxConsumers = Math.max(maxConsumers, room.counts().consumers);

            if (performance.now() - lastReport >= REPORT_INTERVAL_MS) {
                lastReport = performance.now();
                const counts = room.counts();
                const usage = await server.usage();
                log(
                    `consumers ${counts.consumers}, transports ${counts.transports}, ` +
                        `created ${created}, closed ${closed}, ` +
                        `rss ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB, ` +
                        `worker rss ${Math.round(usage.workerMaxRssKb / 1024)} MB`
                );
            }
            await sleep(Math.max(0, TICK_MS - tickTimes[tickTimes.length - 1]));
        }

        const after = await server.usage();
        const trafficAfter = await room.traffic();
        const elapsedSec = (performance.now() - startedAt) / 1000;
        const counts = room.counts();
        const toMbps = (bytes: number) => (bytes * 8) / elapsedSec / 1_000_000;
        const ingressMbps = toMbps(
            trafficAfter.bytesReceived - trafficBefore.bytesReceived
        );
        const egressMbps = toMbps(
            trafficAfter.bytesSent - trafficBefore.bytesSent
        );

        return {
            people: options.people,
            speakers: options.speakers,
            cameras: options.cameras,
            screens: options.screens,
            layout: options.layout,
            durationSec: options.durationSec,
            workerCpuPercent:
                ((after.workerCpuSeconds - before.workerCpuSeconds) /
                    elapsedSec) *
                100,
            processRssMb: process.memoryUsage().rss / 1024 / 1024,
            maxConsumers,
            producers: counts.producers,
            ingressMbps,
            egressMbps,
            egressPerPersonMbps: egressMbps / options.people,
            consumers: room.consumerBreakdown(),
            createdPerSec: created / elapsedSec,
            closedPerSec: closed / elapsedSec,
            tickP50Ms: percentile(tickTimes, 50),
            tickP99Ms: percentile(tickTimes, 99),
            firstStreamP50Ms: percentile(firstStream, 50),
            firstStreamP99Ms: percentile(firstStream, 99),
        };
    } finally {
        feeds.stop();
        sink.close();
        server.close();
    }
};

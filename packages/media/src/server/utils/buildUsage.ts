import type { types } from "mediasoup";
import type { MediaCounts } from "../spaceTypes";
import type { MediaUsage } from "../types";

// The worker reports its CPU time in milliseconds.
const MS_PER_SECOND = 1000;

export const sumCounts = (all: Iterable<MediaCounts>): MediaCounts => {
    const total: MediaCounts = {
        peers: 0,
        transports: 0,
        producers: 0,
        consumers: 0,
    };
    for (const counts of all) {
        total.peers += counts.peers;
        total.transports += counts.transports;
        total.producers += counts.producers;
        total.consumers += counts.consumers;
    }
    return total;
};

export const buildUsage = (
    rooms: number,
    counts: MediaCounts,
    resources: Awaited<ReturnType<types.Worker["getResourceUsage"]>>
): MediaUsage => ({
    rooms,
    ...counts,
    workerCpuSeconds: (resources.ru_utime + resources.ru_stime) / MS_PER_SECOND,
    workerMaxRssKb: resources.ru_maxrss,
});

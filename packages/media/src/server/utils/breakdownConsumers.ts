import type { ConsumerBreakdown, Peer } from "../spaceTypes";

/**
 * How many consumers the room holds by what they carry: audio, or video in
 * each layer. A paused consumer is counted apart, since it sends nothing.
 */
export const breakdownConsumers = (
    peers: ReadonlyMap<string, Peer>
): ConsumerBreakdown => {
    const breakdown: ConsumerBreakdown = {
        audio: 0,
        videoLow: 0,
        videoMid: 0,
        videoHigh: 0,
        screen: 0,
        paused: 0,
    };
    peers.forEach((peer) => {
        peer.consumers.forEach((entry) => {
            if (entry.paused) breakdown.paused += 1;
            if (entry.kind === "audio") breakdown.audio += 1;
            else if (entry.layer === null) breakdown.screen += 1;
            else if (entry.layer === "low") breakdown.videoLow += 1;
            else if (entry.layer === "mid") breakdown.videoMid += 1;
            else breakdown.videoHigh += 1;
        });
    });
    return breakdown;
};

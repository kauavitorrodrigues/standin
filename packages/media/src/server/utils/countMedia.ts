import type { MediaCounts, Peer } from "../spaceTypes";

export const countMedia = (peers: ReadonlyMap<string, Peer>): MediaCounts => {
    const counts: MediaCounts = {
        peers: peers.size,
        transports: 0,
        producers: 0,
        consumers: 0,
    };
    peers.forEach((peer) => {
        if (peer.sendTransport) counts.transports += 1;
        if (peer.recvTransport) counts.transports += 1;
        counts.producers += peer.producers.size;
        counts.consumers += peer.consumers.size;
    });
    return counts;
};

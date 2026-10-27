import type { types } from "mediasoup";
import type { MediaTraffic, Peer } from "../spaceTypes";

type TransportBytes = { bytesReceived?: number; bytesSent?: number };

const bytesOf = async (
    transport: types.Transport | null
): Promise<TransportBytes> => {
    if (!transport) return {};
    const [stats] = (await transport.getStats()) as TransportBytes[];
    return stats ?? {};
};

/**
 * The bytes the transports of a room have received from the senders and sent
 * to the receivers since they were opened. A transport that cannot report
 * counts as zero.
 */
export const readTraffic = async (
    peers: ReadonlyMap<string, Peer>
): Promise<MediaTraffic> => {
    const traffic: MediaTraffic = { bytesReceived: 0, bytesSent: 0 };
    const reads = [...peers.values()].flatMap((peer) => [
        bytesOf(peer.sendTransport),
        bytesOf(peer.recvTransport),
    ]);
    const results = await Promise.all(
        reads.map((read) => read.catch((): TransportBytes => ({})))
    );
    results.forEach((stats) => {
        traffic.bytesReceived += stats.bytesReceived ?? 0;
        traffic.bytesSent += stats.bytesSent ?? 0;
    });
    return traffic;
};

import type { Peer } from "../spaceTypes";

// A peer can receive once it has a receive transport and its capabilities.
export const canReceive = (peer: Peer): boolean =>
    peer.recvTransport !== null && peer.rtpCapabilities !== null;

export const findTransport = (peer: Peer, transportId: string) =>
    [peer.sendTransport, peer.recvTransport].find(
        (candidate) => candidate?.id === transportId
    );

export const findProducerEntry = (peer: Peer, producerId: string) =>
    [...peer.producers.values()].find(
        ({ producer }) => producer.id === producerId
    );

export const findConsumerEntry = (peer: Peer, consumerId: string) =>
    [...peer.consumers.values()].find(
        ({ consumer }) => consumer.id === consumerId
    );

export const isSameRanking = (
    left: readonly string[],
    right: readonly string[]
): boolean =>
    left.length === right.length &&
    left.every((id, index) => id === right[index]);

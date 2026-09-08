import type Peer from "simple-peer";

// Which connected peers still need the local media stream attached via
// peer.addStream (permission granted, or a device selected, after those
// peers already connected). Pure so it's testable without instantiating
// simple-peer for real.
export const getPeersMissingLocalStream = (
    peers: Map<string, Peer.Instance>,
    attachedSocketIds: Set<string>
): string[] =>
    Array.from(peers.keys()).filter(
        (socketId) => !attachedSocketIds.has(socketId)
    );

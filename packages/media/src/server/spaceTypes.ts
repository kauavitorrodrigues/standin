import type { types } from "mediasoup";
import type { MediaSource } from "@standin/contracts";
import type { ProducerKind, SimulcastLayer } from "../planner/types";

export type ConsumerEntry = {
    consumer: types.Consumer;
    // The peer that owns the producer being consumed.
    ownerId: string;
    producerId: string;
    kind: ProducerKind;
    layer: SimulcastLayer | null;
    // What the planner wants (the magnitude says pause). The consumer itself
    // stays paused until the client confirms it is ready.
    paused: boolean;
    ready: boolean;
};

export type ProducerEntry = {
    producer: types.Producer;
    source: MediaSource;
};

export type Peer = {
    id: string;
    userId: string;
    roomKey: string | null;
    lowQuality: boolean;
    // The microphone is off, so the planner skips this person's audio.
    muted: boolean;
    // Headphones on: no connection with anybody, in both directions.
    headphones: boolean;
    // Focus mode, stored and shown, with no effect on strong connections.
    focusMode: boolean;
    // The layer the person asks for per peer id seen in a tile.
    focus: Map<string, SimulcastLayer>;
    // Peer ids the person pinned on the stage, in pin order.
    pins: string[];
    rtpCapabilities: types.RtpCapabilities | null;
    sendTransport: types.Transport | null;
    recvTransport: types.Transport | null;
    producers: Map<MediaSource, ProducerEntry>;
    // Consumers held by this peer, by the producer they consume.
    consumers: Map<string, ConsumerEntry>;
    lastChangeAt: number | undefined;
    applying: boolean;
};

export type ProducerOwner = { peerId: string; source: MediaSource };

export type TransportParameters = {
    transportId: string;
    iceParameters: types.IceParameters;
    iceCandidates: types.IceCandidate[];
    dtlsParameters: types.DtlsParameters;
};

/** Bytes the transports of a room received from senders and sent to receivers. */
export type MediaTraffic = {
    bytesReceived: number;
    bytesSent: number;
};

/** Consumers of a room by what they carry. A screen has no layer. */
export type ConsumerBreakdown = {
    audio: number;
    videoLow: number;
    videoMid: number;
    videoHigh: number;
    screen: number;
    paused: number;
};

export type MediaCounts = {
    peers: number;
    transports: number;
    producers: number;
    consumers: number;
};

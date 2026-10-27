import type {
    MediaConsumerClosedPayload,
    MediaConsumerNewPayload,
    MediaProducerDemandPayload,
} from "@standin/contracts";

// How the media server talks to the clients. The transport (Socket.IO) lives
// in the API, so the module has no dependency on it and tests use a fake.
export type MediaNotifier = {
    consumerNew: (peerId: string, payload: MediaConsumerNewPayload) => void;
    consumerClosed: (
        peerId: string,
        payload: MediaConsumerClosedPayload
    ) => void;
    producerDemand: (
        peerId: string,
        payload: MediaProducerDemandPayload
    ) => void;
};

export type MediaServerOptions = {
    listenIp: string;
    listenPort: number;
    // The address clients reach the server at, when it differs from the one
    // it listens on (a VPS behind a NAT).
    announcedAddress?: string;
    logLevel?: "debug" | "warn" | "error" | "none";
};

export type MediaUsage = {
    rooms: number;
    peers: number;
    transports: number;
    producers: number;
    consumers: number;
    // Seconds of CPU time the worker used since it started.
    workerCpuSeconds: number;
    workerMaxRssKb: number;
};

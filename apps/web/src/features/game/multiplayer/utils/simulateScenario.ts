import { TransportErrorType } from "../lib/TransportConnectionMonitor";

// Dev only failure harness that simulates connection failures by name.
export const SCENARIO_NAMES = [
    "network-blip",
    "long-network-blip",
    "ice-restart",
    "transport-failure",
    "network-blip-all",
    "network-blip-with-media-state-mismatch",
    "network-blip-while-update-consumer",
    "recover-transport-with-no-signaling",
] as const;

export type ScenarioName = (typeof SCENARIO_NAMES)[number];

// Delay before the reload of "long-network-blip".
export const LONG_NETWORK_BLIP_RELOAD_MS = 5000;

export type ScenarioDeps = {
    socket: { connect: () => unknown; disconnect: () => unknown };
    media: {
        // Builds the media session again, as a broken transport would.
        rebuildSession: () => void;
        // Restarts ICE on the send and the receive transport.
        restartIce: () => void;
        // Reports an error of the transports with nothing behind it.
        publishTransportError: (type: TransportErrorType) => void;
        // The client forgets the send transport that the server still holds.
        dropSendTransport: () => void;
        // Pauses and resumes what the person receives, on this side only.
        pauseConsumers: () => void;
        resumeConsumers: () => void;
        // Closes both transports and forgets them.
        dropTransports: () => void;
    };
    reload: () => void;
    setTimeout: (callback: () => void, delayMs: number) => unknown;
};

export class UnknownScenarioError extends Error {
    constructor(name: string) {
        super(`Unknown scenario "${name}"`);
        this.name = "UnknownScenarioError";
    }
}

export const simulateScenario = (name: string, deps: ScenarioDeps): void => {
    switch (name) {
        case "network-blip":
        case "network-blip-all":
            // The hook rejoins the space on the socket "connect" event.
            deps.socket.disconnect();
            deps.socket.connect();
            return;
        case "long-network-blip":
            deps.socket.disconnect();
            deps.setTimeout(deps.reload, LONG_NETWORK_BLIP_RELOAD_MS);
            return;
        case "ice-restart":
            // Recovers by itself: a new session is built only if it fails.
            deps.media.restartIce();
            return;
        case "transport-failure":
            // Only the report, the session keeps running.
            deps.media.publishTransportError(
                TransportErrorType.FailedToConnect
            );
            return;
        case "network-blip-with-media-state-mismatch":
            // The server keeps a transport the client no longer has.
            deps.media.dropSendTransport();
            deps.socket.disconnect();
            deps.socket.connect();
            return;
        case "network-blip-while-update-consumer":
            // The socket drops while the consumers are paused, and they are
            // resumed with no connection.
            deps.media.pauseConsumers();
            deps.socket.disconnect();
            deps.media.resumeConsumers();
            deps.socket.connect();
            return;
        case "recover-transport-with-no-signaling":
            // The transports are lost while the socket is down, so the new
            // ones are built from scratch once it is back.
            deps.socket.disconnect();
            deps.media.dropTransports();
            deps.socket.connect();
            deps.media.rebuildSession();
            return;
        default:
            throw new UnknownScenarioError(name);
    }
};

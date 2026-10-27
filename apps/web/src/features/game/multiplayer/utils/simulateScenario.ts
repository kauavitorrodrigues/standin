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
    peers: {
        restartIceOnAllPeers: () => void;
        simulateTransportFailureOnAllPeers: () => void;
    };
    reload: () => void;
    setTimeout: (callback: () => void, delayMs: number) => unknown;
};

export class ScenarioNotImplementedError extends Error {
    constructor(name: string) {
        super(
            `Scenario "${name}" only applies to the SFU and is not implemented yet`
        );
        this.name = "ScenarioNotImplementedError";
    }
}

export class UnknownScenarioError extends Error {
    constructor(name: string) {
        super(`Unknown scenario "${name}"`);
        this.name = "UnknownScenarioError";
    }
}

export const simulateScenario = (name: string, deps: ScenarioDeps): void => {
    switch (name) {
        case "network-blip":
            // The hook rejoins the space on the socket "connect" event.
            deps.socket.disconnect();
            deps.socket.connect();
            return;
        case "long-network-blip":
            deps.socket.disconnect();
            deps.setTimeout(deps.reload, LONG_NETWORK_BLIP_RELOAD_MS);
            return;
        case "ice-restart":
            deps.peers.restartIceOnAllPeers();
            return;
        case "transport-failure":
            deps.peers.simulateTransportFailureOnAllPeers();
            return;
        // TODO: fill in once the SFU client exists.
        case "network-blip-all":
        case "network-blip-with-media-state-mismatch":
        case "network-blip-while-update-consumer":
        case "recover-transport-with-no-signaling":
            throw new ScenarioNotImplementedError(name);
        default:
            throw new UnknownScenarioError(name);
    }
};

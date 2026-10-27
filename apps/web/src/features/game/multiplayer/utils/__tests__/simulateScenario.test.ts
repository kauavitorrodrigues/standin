import { describe, expect, it, vi } from "vitest";
import {
    LONG_NETWORK_BLIP_RELOAD_MS,
    ScenarioNotImplementedError,
    UnknownScenarioError,
    simulateScenario,
    type ScenarioDeps,
} from "../simulateScenario";

const buildDeps = () => {
    const deps = {
        socket: { connect: vi.fn(), disconnect: vi.fn() },
        peers: {
            restartIceOnAllPeers: vi.fn(),
            simulateTransportFailureOnAllPeers: vi.fn(),
        },
        reload: vi.fn(),
        setTimeout: vi.fn(),
    } satisfies ScenarioDeps;
    return deps;
};

describe("simulateScenario", () => {
    it("network-blip disconnects then reconnects", () => {
        const deps = buildDeps();
        simulateScenario("network-blip", deps);
        expect(deps.socket.disconnect).toHaveBeenCalledOnce();
        expect(deps.socket.connect).toHaveBeenCalledOnce();
        expect(deps.reload).not.toHaveBeenCalled();
    });

    it("long-network-blip disconnects and reloads after 5 s", () => {
        const deps = buildDeps();
        simulateScenario("long-network-blip", deps);
        expect(deps.socket.disconnect).toHaveBeenCalledOnce();
        expect(deps.socket.connect).not.toHaveBeenCalled();
        expect(deps.setTimeout).toHaveBeenCalledWith(
            deps.reload,
            LONG_NETWORK_BLIP_RELOAD_MS
        );
        expect(LONG_NETWORK_BLIP_RELOAD_MS).toBe(5000);
    });

    it("ice-restart restarts ICE on every peer", () => {
        const deps = buildDeps();
        simulateScenario("ice-restart", deps);
        expect(deps.peers.restartIceOnAllPeers).toHaveBeenCalledOnce();
    });

    it("transport-failure publishes without disconnecting", () => {
        const deps = buildDeps();
        simulateScenario("transport-failure", deps);
        expect(
            deps.peers.simulateTransportFailureOnAllPeers
        ).toHaveBeenCalledOnce();
        expect(deps.socket.disconnect).not.toHaveBeenCalled();
    });

    it.each([
        "network-blip-all",
        "network-blip-with-media-state-mismatch",
        "network-blip-while-update-consumer",
        "recover-transport-with-no-signaling",
    ])("%s throws not implemented", (name) => {
        expect(() => simulateScenario(name, buildDeps())).toThrow(
            ScenarioNotImplementedError
        );
    });

    it("rejects unknown names", () => {
        expect(() => simulateScenario("nope", buildDeps())).toThrow(
            UnknownScenarioError
        );
    });
});

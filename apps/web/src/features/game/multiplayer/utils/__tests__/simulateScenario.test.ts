import { describe, expect, it, vi } from "vitest";
import { TransportErrorType } from "../../lib/TransportConnectionMonitor";
import {
    LONG_NETWORK_BLIP_RELOAD_MS,
    SCENARIO_NAMES,
    UnknownScenarioError,
    simulateScenario,
    type ScenarioDeps,
} from "../simulateScenario";

// Every call is recorded in one list, so a test can read the order of the
// socket and the media together.
const buildDeps = () => {
    const calls: string[] = [];
    const record = (name: string) => vi.fn(() => void calls.push(name));
    const deps = {
        socket: { connect: record("connect"), disconnect: record("disconnect") },
        media: {
            rebuildSession: record("rebuildSession"),
            restartIce: record("restartIce"),
            publishTransportError: vi.fn((type: TransportErrorType) => {
                calls.push(`publishTransportError:${type}`);
            }),
            dropSendTransport: record("dropSendTransport"),
            pauseConsumers: record("pauseConsumers"),
            resumeConsumers: record("resumeConsumers"),
            dropTransports: record("dropTransports"),
        },
        reload: vi.fn(),
        setTimeout: vi.fn(),
    } satisfies ScenarioDeps;
    return { deps, calls };
};

describe("simulateScenario", () => {
    it("network-blip disconnects then reconnects", () => {
        const { deps, calls } = buildDeps();
        simulateScenario("network-blip", deps);
        expect(calls).toEqual(["disconnect", "connect"]);
        expect(deps.reload).not.toHaveBeenCalled();
    });

    it("long-network-blip disconnects and reloads after 5 s", () => {
        const { deps } = buildDeps();
        simulateScenario("long-network-blip", deps);
        expect(deps.socket.disconnect).toHaveBeenCalledOnce();
        expect(deps.socket.connect).not.toHaveBeenCalled();
        expect(deps.setTimeout).toHaveBeenCalledWith(
            deps.reload,
            LONG_NETWORK_BLIP_RELOAD_MS
        );
        expect(LONG_NETWORK_BLIP_RELOAD_MS).toBe(5000);
    });

    it("ice-restart restarts ICE and does not build the session again", () => {
        const { deps, calls } = buildDeps();
        simulateScenario("ice-restart", deps);
        expect(calls).toEqual(["restartIce"]);
    });

    it("transport-failure reports the error without disconnecting or rebuilding", () => {
        const { deps, calls } = buildDeps();
        simulateScenario("transport-failure", deps);
        expect(calls).toEqual([
            `publishTransportError:${TransportErrorType.FailedToConnect}`,
        ]);
        expect(deps.socket.disconnect).not.toHaveBeenCalled();
        expect(deps.media.rebuildSession).not.toHaveBeenCalled();
    });

    it("network-blip-all reconnects the socket like network-blip", () => {
        const { deps, calls } = buildDeps();
        simulateScenario("network-blip-all", deps);
        expect(calls).toEqual(["disconnect", "connect"]);
    });

    it("the media state mismatch forgets the send transport, then the socket blips", () => {
        const { deps, calls } = buildDeps();
        simulateScenario("network-blip-with-media-state-mismatch", deps);
        expect(calls).toEqual(["dropSendTransport", "disconnect", "connect"]);
    });

    it("the blip while consumers update pauses them, drops the socket and resumes them with no connection", () => {
        const { deps, calls } = buildDeps();
        simulateScenario("network-blip-while-update-consumer", deps);
        expect(calls).toEqual([
            "pauseConsumers",
            "disconnect",
            "resumeConsumers",
            "connect",
        ]);
    });

    it("recovering with no signaling loses the transports while the socket is down, then builds them again", () => {
        const { deps, calls } = buildDeps();
        simulateScenario("recover-transport-with-no-signaling", deps);
        expect(calls).toEqual([
            "disconnect",
            "dropTransports",
            "connect",
            "rebuildSession",
        ]);
    });

    it("runs every named scenario without throwing", () => {
        SCENARIO_NAMES.forEach((name) => {
            expect(() => simulateScenario(name, buildDeps().deps)).not.toThrow();
        });
    });

    it("rejects unknown names", () => {
        expect(() => simulateScenario("nope", buildDeps().deps)).toThrow(
            UnknownScenarioError
        );
    });
});

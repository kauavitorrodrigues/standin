import { describe, expect, it, vi } from "vitest";
import type { SfuClient } from "../SfuClient";
import { SfuSupervisor } from "../SfuSupervisor";
import type { SfuEvents } from "../../types/sfu";
import type { SfuSignal } from "../../types/sfuSignal";

const track = () => ({ id: "t" }) as unknown as MediaStreamTrack;

const setup = (failBuilds = 0) => {
    const clients: {
        start: ReturnType<typeof vi.fn>;
        close: ReturnType<typeof vi.fn>;
        setTrack: ReturnType<typeof vi.fn>;
        setDemand: ReturnType<typeof vi.fn>;
        forceIceRestart: ReturnType<typeof vi.fn>;
        simulateTransportError: ReturnType<typeof vi.fn>;
        forgetSendTransport: ReturnType<typeof vi.fn>;
        pauseConsumers: ReturnType<typeof vi.fn>;
        resumeConsumers: ReturnType<typeof vi.fn>;
        dropTransports: ReturnType<typeof vi.fn>;
        events: SfuEvents;
    }[] = [];
    let remainingFailures = failBuilds;
    const signal: SfuSignal = {
        request: vi.fn(async () => ({ ok: true }) as never),
        send: vi.fn(),
    };
    const supervisor = new SfuSupervisor({
        signal,
        events: { onRemoteTrack: vi.fn(), onRemoteTrackClosed: vi.fn() },
        wait: async () => undefined,
        createClient: (events) => {
            const client = {
                start: vi.fn(async () => {
                    if (remainingFailures > 0) {
                        remainingFailures -= 1;
                        throw new Error("boom");
                    }
                }),
                close: vi.fn(),
                setTrack: vi.fn(),
                setDemand: vi.fn(),
                forceIceRestart: vi.fn(),
                simulateTransportError: vi.fn(),
                forgetSendTransport: vi.fn(),
                pauseConsumers: vi.fn(),
                resumeConsumers: vi.fn(),
                dropTransports: vi.fn(),
                handleConsumerNew: vi.fn(),
                handleConsumerClosed: vi.fn(),
                getVideoSenders: () => [],
                events,
            };
            clients.push(client);
            return client as unknown as SfuClient;
        },
    });
    return { supervisor, clients, signal };
};

describe("SfuSupervisor", () => {
    it("gives the tracks it already knew to the first client", async () => {
        const { supervisor, clients } = setup();
        const mic = track();
        supervisor.setTrack("mic", mic);
        await supervisor.start();

        expect(clients[0].setTrack).toHaveBeenCalledWith("mic", mic);
    });

    it("builds a new client with the same tracks after a broken session", async () => {
        const { supervisor, clients, signal } = setup();
        const mic = track();
        supervisor.setTrack("mic", mic);
        await supervisor.start();

        clients[0].events.onBroken();
        await vi.waitFor(() => expect(clients).toHaveLength(2));

        expect(clients[0].close).toHaveBeenCalled();
        expect(signal.request).toHaveBeenCalledWith("media:restart");
        expect(clients[1].setTrack).toHaveBeenCalledWith("mic", mic);
    });

    it("tries again when a rebuild fails", async () => {
        const { supervisor, clients } = setup(1);
        await supervisor.start().catch(() => undefined);
        clients[0].events.onBroken();
        await vi.waitFor(() =>
            expect(clients.length).toBeGreaterThanOrEqual(2)
        );
    });

    it("builds the session again when the first one cannot be started", async () => {
        const { supervisor, clients } = setup(1);
        await supervisor.start();

        await vi.waitFor(() =>
            expect(clients.length).toBeGreaterThanOrEqual(2)
        );
        expect(clients[1].start).toHaveBeenCalled();
    });

    it("does not rebuild after it was stopped", async () => {
        const { supervisor, clients } = setup();
        await supervisor.start();
        supervisor.stop();
        clients[0].events.onBroken();
        await new Promise((r) => setTimeout(r, 20));

        expect(clients).toHaveLength(1);
    });

    it("passes the demand of a video to the current session", async () => {
        const { supervisor, clients } = setup();
        await supervisor.start();
        supervisor.setDemand("camera", false);

        expect(clients[0].setDemand).toHaveBeenCalledWith("camera", false);
    });

    it("sends the focus and the low quality flag to the server", async () => {
        const { supervisor, signal } = setup();
        await supervisor.start();
        supervisor.setFocus([{ userId: "user-b", layer: "mid" }]);
        supervisor.setLowQuality(true);

        expect(signal.send).toHaveBeenCalledWith("media:set-focus", {
            views: [{ userId: "user-b", layer: "mid" }],
        });
        expect(signal.send).toHaveBeenCalledWith("media:set-low-quality", {
            enabled: true,
        });
    });

    it("sends the pins once the session is ready and again after a rebuild", async () => {
        const { supervisor, signal } = setup();
        supervisor.setPins(["user-b"]);
        expect(signal.send).not.toHaveBeenCalledWith("media:set-pins", {
            userIds: ["user-b"],
        });

        await supervisor.start();
        expect(signal.send).toHaveBeenCalledWith("media:set-pins", {
            userIds: ["user-b"],
        });

        supervisor.setPins([]);
        expect(signal.send).toHaveBeenLastCalledWith("media:set-pins", {
            userIds: [],
        });
    });

    it("sends the hidden people once the session is ready, and again after a rebuild", async () => {
        const { supervisor, signal, clients } = setup();
        supervisor.setHiddenVideo(["user-b"]);
        expect(signal.send).not.toHaveBeenCalledWith("media:set-hidden-video", {
            userIds: ["user-b"],
        });

        await supervisor.start();
        expect(signal.send).toHaveBeenCalledWith("media:set-hidden-video", {
            userIds: ["user-b"],
        });

        // The session breaks and is built again: the new one is told who is hidden.
        (signal.send as ReturnType<typeof vi.fn>).mockClear();
        clients[0].events.onBroken();
        await vi.waitFor(() => expect(clients).toHaveLength(2));
        await vi.waitFor(() =>
            expect(signal.send).toHaveBeenCalledWith("media:set-hidden-video", {
                userIds: ["user-b"],
            })
        );

        supervisor.setHiddenVideo([]);
        expect(signal.send).toHaveBeenLastCalledWith("media:set-hidden-video", {
            userIds: [],
        });
    });

    it("does not send a list of hidden people nobody asked for", async () => {
        const { supervisor, signal } = setup();
        await supervisor.start();

        expect(signal.send).not.toHaveBeenCalledWith(
            "media:set-hidden-video",
            expect.anything()
        );
    });

    it("hands the failures of the dev console to the current client", async () => {
        const { supervisor, clients } = setup();
        await supervisor.start();

        supervisor.forceIceRestart();
        supervisor.simulateTransportError("FailedToConnect");
        supervisor.forgetSendTransport();
        supervisor.pauseConsumers();
        supervisor.resumeConsumers();
        supervisor.dropTransports();

        expect(clients[0].forceIceRestart).toHaveBeenCalledOnce();
        expect(clients[0].simulateTransportError).toHaveBeenCalledWith("FailedToConnect");
        expect(clients[0].forgetSendTransport).toHaveBeenCalledOnce();
        expect(clients[0].pauseConsumers).toHaveBeenCalledOnce();
        expect(clients[0].resumeConsumers).toHaveBeenCalledOnce();
        expect(clients[0].dropTransports).toHaveBeenCalledOnce();
    });

    it("does nothing with the failures when there is no session", () => {
        const { supervisor } = setup();

        expect(() => {
            supervisor.forceIceRestart();
            supervisor.dropTransports();
        }).not.toThrow();
    });
});

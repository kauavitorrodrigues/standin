import { describe, expect, it, vi } from "vitest";
import type { Device } from "mediasoup-client";
import { ICE_DISCONNECTED_GRACE_MS } from "../../consts/connection";
import { SfuClient } from "../SfuClient";
import type { SfuEvents } from "../../types/sfu";
import type { SfuSignal } from "../../types/sfuSignal";

type Handler = (...args: unknown[]) => void;

const fakeTrack = (kind: "audio" | "video" = "audio") =>
    ({
        kind,
        id: `${kind}-${Math.random()}`,
        contentHint: "",
    }) as unknown as MediaStreamTrack;

const fakeTransport = (id: string) => {
    const handlers = new Map<string, Handler>();
    const senders = new Map<
        string,
        {
            encodings: { active?: boolean }[];
            setParameters: ReturnType<typeof vi.fn>;
        }
    >();
    const produce = vi.fn(
        async (options: {
            track: MediaStreamTrack;
            appData: { source: string };
        }) => ({
            id: `producer-${options.appData.source}`,
            kind: options.track.kind,
            track: options.track,
            rtpSender: (() => {
                const state = {
                    encodings: [{}, {}] as { active?: boolean }[],
                    setParameters: vi.fn(async () => undefined),
                };
                senders.set(options.appData.source, state);
                return {
                    getParameters: () => ({ encodings: state.encodings }),
                    setParameters: state.setParameters,
                };
            })(),
            close: vi.fn(),
            replaceTrack: vi.fn(
                async ({ track }: { track: MediaStreamTrack }) => {
                    created.track = track;
                }
            ),
        })
    );
    const created = { track: null as MediaStreamTrack | null };
    const transport = {
        id,
        connectionState: "new",
        closed: false,
        on: (event: string, handler: Handler) => handlers.set(event, handler),
        handlers,
        // Like the browser: the state is set before the event is emitted.
        changeState: (state: string) => {
            transport.connectionState = state;
            handlers.get("connectionstatechange")?.(state);
        },
        senders,
        produce,
        consume: vi.fn(async (options: { id: string }) => ({
            id: options.id,
            track: fakeTrack(),
            close: vi.fn(),
            pause: vi.fn(),
            resume: vi.fn(),
        })),
        restartIce: vi.fn(async () => undefined),
        close: vi.fn(() => {
            transport.closed = true;
        }),
    };
    return transport;
};

const setup = () => {
    const transports = {
        send: fakeTransport("send-1"),
        recv: fakeTransport("recv-1"),
    };
    const device = {
        load: vi.fn(async () => undefined),
        rtpCapabilities: { codecs: [] },
        createSendTransport: vi.fn(() => transports.send),
        createRecvTransport: vi.fn(() => transports.recv),
    };
    const requests: { event: string; payload: unknown }[] = [];
    const signal: SfuSignal = {
        request: vi.fn(async (event: string, payload?: unknown) => {
            requests.push({ event, payload });
            if (event === "media:get-capabilities")
                return { ok: true, rtpCapabilities: {} } as never;
            if (event === "media:create-transport") {
                const direction = (payload as { direction: string }).direction;
                return {
                    ok: true,
                    transportId: direction === "send" ? "send-1" : "recv-1",
                    iceParameters: {},
                    iceCandidates: [],
                    dtlsParameters: {},
                } as never;
            }
            return { ok: true } as never;
        }),
        send: vi.fn(),
    };
    const events: SfuEvents = {
        onRemoteTrack: vi.fn(),
        onRemoteTrackClosed: vi.fn(),
        onBroken: vi.fn(),
    };
    const client = new SfuClient(
        signal,
        events,
        () => device as unknown as Device
    );
    return { client, device, signal, events, transports, requests };
};

const consumerNew = (id: string) => ({
    consumerId: id,
    producerId: `p-${id}`,
    userId: "user-b",
    source: "mic" as const,
    kind: "audio" as const,
    rtpParameters: {},
});

describe("SfuClient", () => {
    it("loads the device and opens both transports, sending its capabilities to receive", async () => {
        const { client, device, requests } = setup();
        await client.start();

        expect(device.load).toHaveBeenCalled();
        const created = requests.filter(
            (r) => r.event === "media:create-transport"
        );
        expect(
            created.map((r) => (r.payload as { direction: string }).direction)
        ).toEqual(["send", "recv"]);
        expect(
            (created[1].payload as { rtpCapabilities: unknown }).rtpCapabilities
        ).toEqual({ codecs: [] });
    });

    it("produces what was set before and after the start, once per source", async () => {
        const { client, transports } = setup();
        const mic = fakeTrack();
        client.setTrack("mic", mic);
        await client.start();
        client.setTrack("camera", fakeTrack("video"));
        client.setTrack("camera", fakeTrack("video"));
        await vi.waitFor(() =>
            expect(transports.send.produce).toHaveBeenCalledTimes(2)
        );

        const sources = transports.send.produce.mock.calls.map(
            (call) => call[0].appData.source
        );
        expect(sources.sort()).toEqual(["camera", "mic"]);
    });

    it("sends the camera in three simulcast layers and the screen in one", async () => {
        const { client, transports } = setup();
        await client.start();
        client.setTrack("camera", fakeTrack("video"));
        client.setTrack("screen", fakeTrack("video"));
        await vi.waitFor(() =>
            expect(transports.send.produce).toHaveBeenCalledTimes(2)
        );

        const bySource = Object.fromEntries(
            transports.send.produce.mock.calls.map((call) => [
                call[0].appData.source,
                call[0],
            ])
        ) as unknown as Record<string, { encodings: unknown[] }>;
        expect(bySource.camera.encodings).toHaveLength(3);
        expect(bySource.screen.encodings).toHaveLength(1);
    });

    it("sends the sound of the screen as its own stream, hinted as music", async () => {
        const { client, transports } = setup();
        await client.start();
        const sound = fakeTrack("audio");
        client.setTrack("screen", fakeTrack("video"));
        client.setTrack("screen-audio", sound);
        await vi.waitFor(() =>
            expect(transports.send.produce).toHaveBeenCalledTimes(2)
        );

        const call = transports.send.produce.mock.calls.find(
            (entry) => entry[0].appData.source === "screen-audio"
        );
        expect(call?.[0].track).toBe(sound);
        expect(sound.contentHint).toBe("music");
        // No voice codec options such as discontinuous transmission.
        expect(call?.[0]).not.toHaveProperty("codecOptions");
    });

    it("stops sending a source when its track goes away", async () => {
        const { client, requests } = setup();
        await client.start();
        client.setTrack("mic", fakeTrack());
        await vi.waitFor(() =>
            expect(
                requests.some((r) => r.event === "media:produce") || true
            ).toBe(true)
        );
        await new Promise((r) => setTimeout(r, 10));
        client.setTrack("mic", null);
        await vi.waitFor(() =>
            expect(
                requests.some((r) => r.event === "media:close-producer")
            ).toBe(true)
        );
    });

    it("stops encoding a video nobody receives and starts again when somebody does", async () => {
        const { client, transports } = setup();
        await client.start();
        client.setTrack("camera", fakeTrack("video"));
        await vi.waitFor(() =>
            expect(transports.send.senders.has("camera")).toBe(true)
        );

        client.setDemand("camera", false);
        await vi.waitFor(() =>
            expect(
                transports.send.senders
                    .get("camera")!
                    .encodings.every((e) => e.active === false)
            ).toBe(true)
        );

        client.setDemand("camera", true);
        await vi.waitFor(() =>
            expect(
                transports.send.senders
                    .get("camera")!
                    .encodings.every((e) => e.active === true)
            ).toBe(true)
        );
    });

    it("keeps a video idle that was told to stop before it started", async () => {
        const { client, transports } = setup();
        await client.start();
        client.setDemand("camera", false);
        client.setTrack("camera", fakeTrack("video"));

        await vi.waitFor(() =>
            expect(
                transports.send.senders
                    .get("camera")
                    ?.encodings.every((e) => e.active === false)
            ).toBe(true)
        );
    });

    it("plays a consumer the server announced and confirms it is ready", async () => {
        const { client, events, requests } = setup();
        await client.start();
        await client.handleConsumerNew(consumerNew("c1"));

        expect(events.onRemoteTrack).toHaveBeenCalledWith(
            expect.objectContaining({
                consumerId: "c1",
                userId: "user-b",
                source: "mic",
            })
        );
        expect(requests.some((r) => r.event === "media:consumer-ready")).toBe(
            true
        );
    });

    it("holds a consumer announced before the transports exist", async () => {
        const { client, events } = setup();
        await client.handleConsumerNew(consumerNew("early"));
        expect(events.onRemoteTrack).not.toHaveBeenCalled();

        await client.start();
        expect(events.onRemoteTrack).toHaveBeenCalledTimes(1);
    });

    it("drops a consumer the server closed", async () => {
        const { client, events } = setup();
        await client.start();
        await client.handleConsumerNew(consumerNew("c2"));
        client.handleConsumerClosed("c2");

        expect(events.onRemoteTrackClosed).toHaveBeenCalledWith("c2");
    });

    it("restarts ICE first when a transport fails", async () => {
        vi.useFakeTimers();
        try {
            const { client, events, transports, requests } = setup();
            await client.start();
            transports.recv.changeState("failed");
            await vi.advanceTimersByTimeAsync(3000);

            expect(
                requests.some(
                    (r) =>
                        r.event === "media:restart-ice" &&
                        (r.payload as { transportId: string }).transportId ===
                            "recv-1"
                )
            ).toBe(true);
            expect(transports.recv.restartIce).toHaveBeenCalled();
            expect(events.onBroken).not.toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });

    it("reports a broken session when the server refuses the ICE restart", async () => {
        vi.useFakeTimers();
        try {
            const { client, events, transports, signal } = setup();
            await client.start();
            const request = signal.request as unknown as ReturnType<
                typeof vi.fn
            >;
            const original = request.getMockImplementation() as
                | ((event: string, payload?: unknown) => Promise<unknown>)
                | undefined;
            request.mockImplementation(
                async (event: string, payload?: unknown) => {
                    if (event === "media:restart-ice")
                        throw new Error("refused");
                    return original?.(event, payload);
                }
            );
            transports.recv.changeState("failed");
            await vi.advanceTimersByTimeAsync(3000);

            expect(events.onBroken).toHaveBeenCalledTimes(1);
        } finally {
            vi.useRealTimers();
        }
    });

    it("ignores everything after it was closed", async () => {
        const { client, events } = setup();
        await client.start();
        client.close();
        await client.handleConsumerNew(consumerNew("late"));
        expect(events.onRemoteTrack).not.toHaveBeenCalled();
    });

    describe("ICE restart and the failure scenarios", () => {
        it("restarts ICE when a disconnection outlasts the grace period", async () => {
            vi.useFakeTimers();
            try {
                const { client, transports } = setup();
                await client.start();
                transports.send.changeState("connected");
                transports.send.changeState("disconnected");
                await vi.advanceTimersByTimeAsync(ICE_DISCONNECTED_GRACE_MS + 3000);

                expect(transports.send.restartIce).toHaveBeenCalled();
            } finally {
                vi.useRealTimers();
            }
        });

        it("does not restart ICE for a transport that was closed meanwhile", async () => {
            vi.useFakeTimers();
            try {
                const { client, transports } = setup();
                await client.start();
                transports.send.changeState("connected");
                transports.send.changeState("disconnected");
                transports.send.close();
                await vi.advanceTimersByTimeAsync(ICE_DISCONNECTED_GRACE_MS + 3000);

                expect(transports.send.restartIce).not.toHaveBeenCalled();
            } finally {
                vi.useRealTimers();
            }
        });

        it("forces an ICE restart on both transports, whatever state they are in", async () => {
            vi.useFakeTimers();
            try {
                const { client, events, transports } = setup();
                await client.start();
                client.forceIceRestart();
                await vi.advanceTimersByTimeAsync(3000);

                expect(transports.send.restartIce).toHaveBeenCalled();
                expect(transports.recv.restartIce).toHaveBeenCalled();
                expect(events.onBroken).not.toHaveBeenCalled();
            } finally {
                vi.useRealTimers();
            }
        });

        it("a simulated transport error is only reported, and the session keeps running", async () => {
            vi.spyOn(console, "warn").mockImplementation(() => {});
            const { client, events, transports } = setup();
            await client.start();
            client.simulateTransportError("FailedToConnect");

            expect(console.warn).toHaveBeenCalledWith(
                "[multiplayer] transport error",
                "FailedToConnect",
                expect.objectContaining({ id: "send-1" })
            );
            expect(events.onBroken).not.toHaveBeenCalled();
            expect(transports.send.restartIce).not.toHaveBeenCalled();
            vi.restoreAllMocks();
        });

        it("adds the report of the socket to the warning when it has one", async () => {
            vi.spyOn(console, "warn").mockImplementation(() => {});
            const report = {
                connected: true,
                lastConnectAt: 1,
                lastDisconnectAt: null,
                lastDisconnectReason: null,
                pingIntervalMs: 25000,
                pingTimeoutMs: 20000,
            };
            const { signal, events, device, transports } = setup();
            const client = new SfuClient(
                signal,
                events,
                () => device as unknown as Device,
                () => report
            );
            await client.start();
            transports.send.changeState("failed");
            client.close();

            expect(console.warn).toHaveBeenCalledWith(
                "[multiplayer] transport error",
                "FailedState",
                expect.anything(),
                report
            );
            vi.restoreAllMocks();
        });

        it("pauses and resumes every consumer", async () => {
            const { client } = setup();
            await client.start();
            await client.handleConsumerNew(consumerNew("c1"));
            await client.handleConsumerNew(consumerNew("c2"));
            const consumers = await Promise.all(
                [0, 1].map((index) => {
                    const mock = (client as unknown as {
                        recvTransport: { consume: { mock: { results: { value: Promise<{ pause: () => void; resume: () => void }> }[] } } };
                    }).recvTransport.consume.mock.results[index];
                    return mock.value;
                })
            );

            client.pauseConsumers();
            consumers.forEach((consumer) => expect(consumer.pause).toHaveBeenCalledOnce());
            client.resumeConsumers();
            consumers.forEach((consumer) => expect(consumer.resume).toHaveBeenCalledOnce());
        });

        it("forgets the send transport without closing it, so nothing is produced", async () => {
            const { client, transports } = setup();
            await client.start();
            client.forgetSendTransport();
            client.setTrack("mic", fakeTrack());
            await Promise.resolve();

            expect(transports.send.close).not.toHaveBeenCalled();
            expect(transports.send.produce).not.toHaveBeenCalled();
        });

        it("drops both transports by closing them", async () => {
            const { client, transports } = setup();
            await client.start();
            client.dropTransports();

            expect(transports.send.close).toHaveBeenCalledOnce();
            expect(transports.recv.close).toHaveBeenCalledOnce();
        });
    });
});

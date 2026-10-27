import { Device, type types } from "mediasoup-client";
import {
    MediaEvents,
    type MediaCapabilitiesAck,
    type MediaConsumerNewPayload,
    type MediaRestartIceAck,
} from "@standin/contracts";
import type { SfuEvents, SfuSource } from "../types/sfu";
import type { SfuSignal } from "../types/sfuSignal";
import {
    applyContentHint,
    encodingTierOf,
    produceOptionsFor,
} from "../utils/sfuProducer";
import { setSenderActive } from "../utils/setSenderActive";
import { logMedia } from "../utils/logMedia";
import { openTransport } from "../utils/sfuTransport";
import { IceRestarter } from "./IceRestarter";
import {
    TransportConnectionMonitor,
    type MonitorReason,
} from "./TransportConnectionMonitor";

type CreateDevice = () => Device;

/**
 * The browser side of the media server, for one media session.
 *
 * It sends the microphone, the camera and the screen once, to the server, and
 * plays what the server creates for it. It never asks for a stream: the server
 * decides who receives what, and this class only turns each announcement into
 * a playable track.
 *
 * A session is one device with one send and one receive transport. When a
 * transport fails the client reports it through `onBroken` and stops being
 * useful. {@link SfuSupervisor} owns the decision to build a new one.
 *
 * Producer changes run one after the other, so a quick on and off cannot
 * create two producers of the same source. Streams the server announces
 * before the transports exist are held and played as soon as they do.
 */
export class SfuClient {
    private readonly signal: SfuSignal;
    private readonly events: SfuEvents;
    private readonly device: Device;
    private sendTransport: types.Transport | null = null;
    private recvTransport: types.Transport | null = null;
    private readonly producers = new Map<SfuSource, types.Producer>();
    // The encodings each producer was made with, to make it again when a new
    // track needs others, such as a camera moving to full HD.
    private readonly tiers = new Map<SfuSource, string>();
    private readonly desired = new Map<SfuSource, MediaStreamTrack>();
    // Sources whose video nobody receives, so the browser does not encode them.
    private readonly idle = new Set<SfuSource>();
    private readonly consumers = new Map<string, types.Consumer>();
    private readonly monitors: TransportConnectionMonitor[] = [];
    private readonly restarters: IceRestarter[] = [];
    private waiting: MediaConsumerNewPayload[] = [];
    private ready = false;
    private closed = false;
    private queue: Promise<void> = Promise.resolve();

    constructor(
        signal: SfuSignal,
        events: SfuEvents,
        createDevice: CreateDevice = () => new Device()
    ) {
        this.signal = signal;
        this.events = events;
        this.device = createDevice();
    }

    /**
     * Loads the device with what the server can handle, opens both transports,
     * plays the streams announced meanwhile and produces what was set so far.
     */
    async start(): Promise<void> {
        const caps = await this.signal.request<
            Extract<MediaCapabilitiesAck, { ok: true }>
        >(MediaEvents.GET_CAPABILITIES);
        logMedia("got the capabilities of the router");
        await this.device.load({
            routerRtpCapabilities:
                caps.rtpCapabilities as unknown as types.RtpCapabilities,
        });

        this.sendTransport = await openTransport(
            this.device,
            this.signal,
            "send"
        );
        this.recvTransport = await openTransport(
            this.device,
            this.signal,
            "recv"
        );
        logMedia("send and receive transports are open");
        this.monitor(this.sendTransport);
        this.monitor(this.recvTransport);
        if (this.closed) return;

        this.ready = true;
        const waiting = this.waiting;
        this.waiting = [];
        await Promise.all(waiting.map((payload) => this.consume(payload)));
        await this.syncAll();
    }

    // Watches the connection of a transport. A failure, or a disconnection
    // that outlasts the grace period, breaks the session.
    private monitor(transport: types.Transport): void {
        const restarter = this.createRestarter(transport, (reason) =>
            monitor.setMonitorReason(reason)
        );
        const monitor: TransportConnectionMonitor =
            new TransportConnectionMonitor({
                id: transport.id,
                onError: (type) => {
                    if (type === "FailedState") restarter.trigger();
                },
                onGraceExpired: () => restarter.trigger(),
            });
        this.monitors.push(monitor);
        this.restarters.push(restarter);
        transport.on("connectionstatechange", (state) => {
            logMedia(`${transport.direction} transport is ${state}`);
            monitor.onConnectionStateChanged(state);
            if (state === "connected") restarter.notifyConnected();
        });
    }

    // An ICE restart is tried first, and the session is only broken when the
    // restarts run out or the server refuses.
    private createRestarter(
        transport: types.Transport,
        setReason: (reason: MonitorReason) => void
    ): IceRestarter {
        return new IceRestarter({
            requestIceParameters: async () => {
                const answer = await this.signal.request<
                    Extract<MediaRestartIceAck, { ok: true }>
                >(MediaEvents.RESTART_ICE, { transportId: transport.id });
                return answer.iceParameters;
            },
            restartIce: (iceParameters) =>
                transport.restartIce({
                    iceParameters: iceParameters as unknown as types.IceParameters,
                }),
            setReason,
            onBroken: () => this.breakSession(),
        });
    }

    private breakSession(): void {
        if (this.closed) return;
        this.events.onBroken();
    }

    /**
     * What the person sends for a source. A null track stops sending it, and a
     * different track replaces the one being sent with no new producer.
     */
    setTrack(source: SfuSource, track: MediaStreamTrack | null): void {
        if (track) this.desired.set(source, track);
        else this.desired.delete(source);
        if (this.ready) this.enqueue(() => this.sync(source));
    }

    private syncAll(): Promise<void> {
        const sources = new Set<SfuSource>([
            ...this.desired.keys(),
            ...this.producers.keys(),
        ]);
        sources.forEach((source) => this.enqueue(() => this.sync(source)));
        return this.queue;
    }

    private enqueue(task: () => Promise<void>): void {
        this.queue = this.queue.then(task).catch((error) => {
            console.warn("[multiplayer] media producer change failed", error);
        });
    }

    // Brings the producer of one source to what the person wants now.
    private async sync(source: SfuSource): Promise<void> {
        const sendTransport = this.sendTransport;
        if (this.closed || !sendTransport) return;

        const track = this.desired.get(source) ?? null;
        const producer = this.producers.get(source);

        if (!track) {
            await this.stopProducer(source, producer);
            return;
        }
        const tier = encodingTierOf(source, track);
        if (producer && this.tiers.get(source) === tier) {
            if (producer.track !== track)
                await producer.replaceTrack({ track });
            return;
        }
        if (producer) await this.stopProducer(source, producer);

        applyContentHint(source, track);
        logMedia(`producing ${source}`);
        const created = await sendTransport.produce({
            track,
            appData: { source },
            ...produceOptionsFor(source, track),
        });
        this.producers.set(source, created);
        this.tiers.set(source, tier);
        if (this.idle.has(source)) await setSenderActive(created, false);
    }

    /**
     * The server says whether anybody receives a video this person sends. When
     * nobody does the encoding stops, which is what spares the CPU, and it
     * starts again when somebody comes near.
     */
    setDemand(source: SfuSource, wanted: boolean): void {
        if (wanted) this.idle.delete(source);
        else this.idle.add(source);

        const producer = this.producers.get(source);
        if (!producer) return;
        logMedia(
            `${wanted ? "resuming" : "pausing"} the encoding of ${source}`
        );
        void setSenderActive(producer, wanted).catch(() => undefined);
    }

    // Resolves once the server closed it, so a producer made again right after
    // does not meet the old one.
    private async stopProducer(
        source: SfuSource,
        producer?: types.Producer
    ): Promise<void> {
        if (!producer) return;

        this.producers.delete(source);
        this.tiers.delete(source);
        producer.close();
        await this.signal
            .request(MediaEvents.CLOSE_PRODUCER, { producerId: producer.id })
            .catch(() => undefined);
    }

    /** The server announced a stream for this person. */
    async handleConsumerNew(payload: MediaConsumerNewPayload): Promise<void> {
        if (this.closed) return;
        if (!this.ready) {
            this.waiting.push(payload);
            return;
        }
        await this.consume(payload);
    }

    // Builds the consumer, hands the track to the owner and tells the server
    // it can start the flow.
    private async consume(payload: MediaConsumerNewPayload): Promise<void> {
        const transport = this.recvTransport;
        if (!transport) return;

        const consumer = await transport.consume({
            id: payload.consumerId,
            producerId: payload.producerId,
            kind: payload.kind,
            rtpParameters:
                payload.rtpParameters as unknown as types.RtpParameters,
        });
        if (this.closed) {
            consumer.close();
            return;
        }

        this.consumers.set(consumer.id, consumer);
        logMedia(`receiving ${payload.source} of ${payload.userId}`);
        this.events.onRemoteTrack({
            consumerId: consumer.id,
            userId: payload.userId,
            source: payload.source,
            kind: payload.kind,
            track: consumer.track,
        });
        await this.signal.request(MediaEvents.CONSUMER_READY, {
            consumerId: consumer.id,
        });
    }

    /** The server stopped a stream, because the person went out of range or left. */
    handleConsumerClosed(consumerId: string): void {
        this.waiting = this.waiting.filter(
            (item) => item.consumerId !== consumerId
        );
        const consumer = this.consumers.get(consumerId);
        if (!consumer) return;

        this.consumers.delete(consumerId);
        consumer.close();
        this.events.onRemoteTrackClosed(consumerId);
    }

    /** The video senders, for the reading of the CPU limitation. */
    getVideoSenders(): RTCRtpSender[] {
        return [...this.producers.values()]
            .filter((producer) => producer.kind === "video")
            .map((producer) => producer.rtpSender)
            .filter((sender): sender is RTCRtpSender => sender !== undefined);
    }

    /** Closes the session. Everything announced afterwards is ignored. */
    close(): void {
        if (this.closed) return;
        this.closed = true;
        this.ready = false;
        this.monitors.forEach((monitor) => monitor.dispose());
        this.restarters.forEach((restarter) => restarter.close());
        this.consumers.forEach((consumer) => consumer.close());
        this.consumers.clear();
        this.producers.clear();
        this.sendTransport?.close();
        this.recvTransport?.close();
    }
}

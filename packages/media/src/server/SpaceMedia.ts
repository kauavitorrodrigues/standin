import type { types } from "mediasoup";
import {
    MEDIA_SOURCES,
    MEDIA_SOURCE_KINDS,
    MediaCannotProduceError,
    MediaConsumerNotFoundError,
    MediaInvalidRequestError,
    MediaProducerExistsError,
    MediaProducerNotFoundError,
    MediaTransportExistsError,
    MediaTransportNotFoundError,
    MediaTransportNotRestartableError,
    type MediaPauseReason,
    DEFAULT_PROXIMITY_PRESET,
    type MediaSource,
    type ProximityPreset,
    type MediaTransportDirection,
} from "@standin/contracts";
import {
    DEMAND_IDLE_MS,
    INITIAL_OUTGOING_BITRATE,
    MAX_INCOMING_BITRATE,
    SPEAKER_INTERVAL_MS,
    SPEAKER_MAX_ENTRIES,
    SPEAKER_THRESHOLD_DB,
} from "../consts/server";
import type {
    CurrentConsumer,
    PersonState,
    PositionSource,
    ProducerKind,
    ReceiverPlan,
    SimulcastLayer,
} from "../planner/types";
import type {
    ConsumerBreakdown,
    MediaCounts,
    MediaTraffic,
    Peer,
    ProducerOwner,
    TransportParameters,
} from "./spaceTypes";
import type { MediaNotifier } from "./types";
import { buildCurrentConsumers, buildPeople } from "./utils/buildPlannerInput";
import {
    buildConsumer,
    closeConsumer,
    setConsumerLayer,
    setConsumerPaused,
} from "./utils/consumerOps";
import { breakdownConsumers } from "./utils/breakdownConsumers";
import { countMedia } from "./utils/countMedia";
import { readTraffic } from "./utils/readTraffic";
import {
    nextDemand,
    type DemandBook,
    type DemandEntry,
} from "./utils/producerDemand";
import { createPeer } from "./utils/createPeer";
import {
    canReceive,
    findConsumerEntry,
    findProducerEntry,
    findTransport,
    isSameRanking,
} from "./utils/peerQueries";
import { isWebRtcTransport } from "./utils/isWebRtcTransport";
import { planReceivers } from "./utils/planReceivers";
import { stabilizeRanking } from "./utils/stabilizeRanking";
import { isSilenced } from "./utils/isSilenced";
import { speakersHeardBy } from "./utils/speakersHeardBy";
import { splitReceivers } from "./utils/splitReceivers";
import { toConsumerNewPayload } from "./utils/toConsumerNewPayload";

export type {
    ConsumerBreakdown,
    MediaCounts,
    MediaTraffic,
    TransportParameters,
} from "./spaceTypes";

/**
 * The media of one space: a mediasoup router, the transports, producers and
 * consumers of each person in it, and the audio level observer that ranks who
 * is speaking.
 *
 * People are identified by the id of their socket, the same id the position
 * grid uses, so the planner can read positions without a translation.
 *
 * A client never chooses what to consume. Every consumer is created here from
 * the plan of the subscription planner (see {@link SpaceMedia.tick}), and a
 * producer can only be created on the send transport of the person who asks.
 *
 * The class keeps the state and the order of operations. The pure decisions
 * live in `./utils` and the constants in `../consts/spaceMedia`.
 */
export class SpaceMedia {
    private readonly peers = new Map<string, Peer>();
    private readonly producerOwners = new Map<string, ProducerOwner>();
    private speakerIds: string[] = [];
    private readonly demand: DemandBook = new Map();
    private speakerListener: ((peerIds: string[]) => void) | null = null;
    private closed = false;
    private proximityPreset: ProximityPreset = DEFAULT_PROXIMITY_PRESET;
    // How many videos of each receiver the server holds back while it is short
    // of CPU (see ServerLoadMonitor), 0 when it is not.
    private videoShed = 0;

    private constructor(
        readonly spaceId: string,
        readonly router: types.Router,
        private readonly webRtcServer: types.WebRtcServer,
        private readonly notifier: MediaNotifier,
        levelObserver: types.AudioLevelObserver
    ) {
        this.levelObserver = levelObserver;
        levelObserver.on("volumes", (volumes) => {
            const ranked = volumes
                .map(
                    (entry) =>
                        this.producerOwners.get(entry.producer.id)?.peerId
                )
                .filter((id): id is string => id !== undefined);
            this.setSpeakers([...new Set(ranked)]);
        });
        levelObserver.on("silence", () => this.setSpeakers([]));
    }

    private readonly levelObserver: types.AudioLevelObserver;

    /** Builds the media of a space on top of a router that already exists. */
    static async create(
        spaceId: string,
        router: types.Router,
        webRtcServer: types.WebRtcServer,
        notifier: MediaNotifier
    ): Promise<SpaceMedia> {
        const levelObserver = await router.createAudioLevelObserver({
            maxEntries: SPEAKER_MAX_ENTRIES,
            threshold: SPEAKER_THRESHOLD_DB,
            interval: SPEAKER_INTERVAL_MS,
        });
        return new SpaceMedia(
            spaceId,
            router,
            webRtcServer,
            notifier,
            levelObserver
        );
    }

    /** What the router can receive and send, which a client needs to load its device. */
    get rtpCapabilities(): types.RtpCapabilities {
        return this.router.rtpCapabilities;
    }

    // ---- Speakers

    /** Calls `listener` with the peer ids, loudest first, whenever the ranking changes. */
    onSpeakersChanged(listener: (peerIds: string[]) => void): void {
        this.speakerListener = listener;
    }

    /** The loudest speakers right now, as peer ids, loudest first. */
    speakers(): readonly string[] {
        return this.speakerIds;
    }

    /**
     * The speakers a receiver may know about, which are itself and the people
     * it hears. Keeps the speaking indicator from leaking who talks elsewhere.
     */
    speakersFor(receiverId: string): string[] {
        const peer = this.peers.get(receiverId);
        if (!peer) return [];
        return speakersHeardBy(peer, this.speakerIds);
    }

    private setSpeakers(reported: string[]): void {
        // The observer can still report a muted person, who never ranks.
        const audible = reported.filter((id) => {
            const peer = this.peers.get(id);
            return !peer || !isSilenced(peer);
        });
        const next = stabilizeRanking(this.speakerIds, audible);
        if (isSameRanking(next, this.speakerIds)) return;
        this.speakerIds = next;
        this.speakerListener?.(next);
    }

    // ---- Proximity

    /** Sets how far people hear and see each other in this space. */
    setProximityPreset(preset: ProximityPreset): void {
        this.proximityPreset = preset;
    }

    /** How far people hear and see each other in this space. */
    getProximityPreset(): ProximityPreset {
        return this.proximityPreset;
    }

    // ---- People

    /** How many people are in the room. */
    peerCount(): number {
        return this.peers.size;
    }

    /** The socket ids of everybody in the room. */
    peerIds(): string[] {
        return [...this.peers.keys()];
    }

    /** Whether the person was added to the room. */
    hasPeer(peerId: string): boolean {
        return this.peers.has(peerId);
    }

    /** The private room the person stands in, or null outside every room. */
    roomKeyOf(peerId: string): string | null {
        return this.peers.get(peerId)?.roomKey ?? null;
    }

    /** The account behind a socket id. */
    userIdOf(peerId: string): string | undefined {
        return this.peers.get(peerId)?.userId;
    }

    /** The producer a person has for a source, if they are sending it. */
    producerIdOf(peerId: string, source: MediaSource): string | undefined {
        return this.peers.get(peerId)?.producers.get(source)?.producer.id;
    }

    /** Adds a person to the room. Does nothing if they are already in. */
    addPeer(peerId: string, userId: string): void {
        if (this.peers.has(peerId)) return;
        this.peers.set(peerId, createPeer(peerId, userId));
    }

    /**
     * Closes everything of a person. Closing the transports takes their
     * producers and consumers with them, and the people who consumed this
     * person are told through the notifier.
     */
    removePeer(peerId: string): void {
        const peer = this.peers.get(peerId);
        if (!peer) return;

        peer.producers.forEach(({ producer }) => {
            this.producerOwners.delete(producer.id);
        });
        // Removed first so the close events of the consumers below stay silent.
        this.peers.delete(peerId);
        // Nobody keeps a person hidden who is gone, so a new person who comes
        // with another id starts shown.
        this.peers.forEach((other) => other.hiddenVideo.delete(peerId));
        peer.sendTransport?.close();
        peer.recvTransport?.close();
        peer.consumers.clear();
        this.setSpeakers(this.speakerIds.filter((id) => id !== peerId));
    }

    /** Sets the private room of a person, which the planner uses to split who hears whom. */
    setRoomKey(peerId: string, roomKey: string | null): void {
        const peer = this.peers.get(peerId);
        if (peer) peer.roomKey = roomKey;
    }

    /** A weak machine gets the low layer, one video and fewer voices. */
    setLowQuality(peerId: string, enabled: boolean): void {
        const peer = this.peers.get(peerId);
        if (peer) peer.lowQuality = enabled;
    }

    /**
     * A muted person gets no audio consumer for others and leaves the speaker
     * ranking. The caller marks the neighbours dirty so the slot is reassigned.
     */
    setMuted(peerId: string, muted: boolean): void {
        const peer = this.peers.get(peerId);
        if (!peer) return;
        peer.muted = muted;
        if (isSilenced(peer)) {
            this.setSpeakers(this.speakerIds.filter((id) => id !== peerId));
        }
    }

    /**
     * A soundboard clip starts or stops on the microphone track of a person.
     * While it plays the person is heard even when muted. The caller marks the
     * neighbours dirty so the planner runs.
     */
    setSoundboardActive(peerId: string, active: boolean): void {
        const peer = this.peers.get(peerId);
        if (!peer) return;
        peer.soundboardActive = active;
        if (isSilenced(peer)) {
            this.setSpeakers(this.speakerIds.filter((id) => id !== peerId));
        }
    }

    /**
     * The privacy modes of a person. Headphones cut every connection in both
     * directions. The caller marks the neighbours dirty so the planner runs.
     */
    setPrivacy(
        peerId: string,
        privacy: { headphones: boolean; focus: boolean }
    ): void {
        const peer = this.peers.get(peerId);
        if (!peer) return;
        peer.headphones = privacy.headphones;
        peer.focusMode = privacy.focus;
    }

    /** The layer a receiver asks for per person it sees in a tile. */
    setFocus(peerId: string, views: ReadonlyMap<string, SimulcastLayer>): void {
        const peer = this.peers.get(peerId);
        if (peer) peer.focus = new Map(views);
    }

    /**
     * The people a receiver pinned, in pin order. A pinned person that is
     * close enough and in the same private room always gets a video slot.
     */
    setPins(peerId: string, pinnedPeerIds: readonly string[]): void {
        const peer = this.peers.get(peerId);
        if (peer) peer.pins = [...pinnedPeerIds];
    }

    /**
     * The people a receiver hid. They have no video for this receiver, and are
     * still heard. The caller marks the receiver dirty so the plan runs again.
     */
    setHiddenVideo(peerId: string, hiddenPeerIds: readonly string[]): void {
        const peer = this.peers.get(peerId);
        if (peer) peer.hiddenVideo = new Set(hiddenPeerIds);
    }

    /**
     * How many videos of each receiver are held back for the load of the
     * server. The caller marks everybody dirty when it changes.
     *
     * @returns Whether the level changed.
     */
    setVideoShed(level: number): boolean {
        if (level === this.videoShed) return false;
        this.videoShed = level;
        return true;
    }

    private requirePeer(peerId: string): Peer {
        const peer = this.peers.get(peerId);
        if (!peer) throw new MediaInvalidRequestError();
        return peer;
    }

    // ---- Transports

    /**
     * Creates the send or the receive transport of a person on the shared
     * port. A person has at most one of each. The receive transport needs the
     * capabilities of the device of the browser to build consumers it can decode.
     *
     * @throws MediaTransportExistsError when the transport already exists.
     * @throws MediaInvalidRequestError for a receive transport with no capabilities.
     */
    async createTransport(
        peerId: string,
        direction: MediaTransportDirection,
        rtpCapabilities?: types.RtpCapabilities
    ): Promise<TransportParameters> {
        const peer = this.requirePeer(peerId);
        const isSend = direction === "send";
        if (isSend ? peer.sendTransport : peer.recvTransport) {
            throw new MediaTransportExistsError();
        }
        if (!isSend && !rtpCapabilities) throw new MediaInvalidRequestError();

        const transport = await this.router.createWebRtcTransport({
            webRtcServer: this.webRtcServer,
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            initialAvailableOutgoingBitrate: INITIAL_OUTGOING_BITRATE,
        });

        // The peer may have left while the transport was being created.
        if (!this.peers.has(peerId) || this.closed) {
            transport.close();
            throw new MediaInvalidRequestError();
        }

        if (isSend) {
            peer.sendTransport = transport;
            await transport
                .setMaxIncomingBitrate(MAX_INCOMING_BITRATE)
                .catch(() => undefined);
        } else {
            peer.recvTransport = transport;
            peer.rtpCapabilities = rtpCapabilities ?? null;
        }
        this.watchTransport(peer, transport);

        return {
            transportId: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        };
    }

    /**
     * Uses transports that were created outside the signalling, plain ones
     * that carry RTP from a local process. The synthetic producers of the
     * validation tools and the integration tests feed the server this way.
     */
    attachTransports(
        peerId: string,
        transports: {
            send: types.Transport;
            recv: types.Transport;
            rtpCapabilities: types.RtpCapabilities;
        }
    ): void {
        const peer = this.requirePeer(peerId);
        peer.sendTransport = transports.send;
        peer.recvTransport = transports.recv;
        peer.rtpCapabilities = transports.rtpCapabilities;
        this.watchTransport(peer, transports.send);
        this.watchTransport(peer, transports.recv);
    }

    private watchTransport(peer: Peer, transport: types.Transport): void {
        transport.observer.on("close", () => {
            if (peer.sendTransport === transport) peer.sendTransport = null;
            if (peer.recvTransport === transport) peer.recvTransport = null;
        });
    }

    /** Finishes the DTLS handshake of one of the transports of a person. */
    async connectTransport(
        peerId: string,
        transportId: string,
        dtlsParameters: types.DtlsParameters
    ): Promise<void> {
        const transport = findTransport(this.requirePeer(peerId), transportId);
        if (!transport) throw new MediaTransportNotFoundError();
        await transport.connect({ dtlsParameters });
    }

    /**
     * Starts an ICE restart of one of the transports of a person and returns
     * the new ICE parameters the browser applies to its own transport.
     *
     * @throws MediaTransportNotFoundError for a transport that is not theirs.
     * @throws MediaTransportNotRestartableError for a transport that is not WebRTC.
     */
    async restartIce(
        peerId: string,
        transportId: string
    ): Promise<types.IceParameters> {
        const transport = findTransport(this.requirePeer(peerId), transportId);
        if (!transport) throw new MediaTransportNotFoundError();
        if (!isWebRtcTransport(transport)) {
            throw new MediaTransportNotRestartableError();
        }
        return transport.restartIce();
    }

    // ---- Producers

    /**
     * Starts a stream of a person. There is one producer per source per person,
     * and it can only be created on the send transport of that same person.
     * A microphone also joins the audio level observer.
     *
     * @returns The id of the producer.
     * @throws MediaProducerExistsError when the source is already being sent.
     * @throws MediaTransportNotFoundError for a transport that is not theirs.
     * @throws MediaCannotProduceError when the worker refuses the parameters.
     */
    async produce(
        peerId: string,
        transportId: string,
        source: MediaSource,
        rtpParameters: types.RtpParameters
    ): Promise<string> {
        const peer = this.requirePeer(peerId);
        const { sendTransport } = peer;
        if (!sendTransport || sendTransport.id !== transportId) {
            throw new MediaTransportNotFoundError();
        }
        if (peer.producers.has(source)) throw new MediaProducerExistsError();

        const producer = await sendTransport
            .produce({
                kind: MEDIA_SOURCE_KINDS[source],
                rtpParameters,
                appData: { source },
            })
            .catch(() => {
                throw new MediaCannotProduceError();
            });

        // Two requests for the same source can be in flight at once.
        if (!this.peers.has(peerId) || peer.producers.has(source)) {
            producer.close();
            throw new MediaProducerExistsError();
        }

        this.registerProducer(peer, source, producer);
        if (source === MEDIA_SOURCES.MIC) {
            await this.levelObserver
                .addProducer({ producerId: producer.id })
                .catch(() => undefined);
        }
        return producer.id;
    }

    private registerProducer(
        peer: Peer,
        source: MediaSource,
        producer: types.Producer
    ): void {
        peer.producers.set(source, { producer, source });
        this.producerOwners.set(producer.id, { peerId: peer.id, source });
        producer.observer.on("close", () => {
            this.producerOwners.delete(producer.id);
            if (peer.producers.get(source)?.producer !== producer) return;
            peer.producers.delete(source);
        });
    }

    /**
     * Stops a stream of a person. Only a producer of that person can be closed.
     *
     * @throws MediaProducerNotFoundError when it is not theirs.
     */
    closeProducer(peerId: string, producerId: string): void {
        const entry = findProducerEntry(this.requirePeer(peerId), producerId);
        if (!entry) throw new MediaProducerNotFoundError();
        entry.producer.close();
    }

    // ---- Consumers

    /**
     * The client has built its consumer. Only now does media flow, unless the
     * planner wants that consumer paused.
     */
    async consumerReady(peerId: string, consumerId: string): Promise<void> {
        const entry = findConsumerEntry(this.requirePeer(peerId), consumerId);
        if (!entry) throw new MediaConsumerNotFoundError();

        entry.ready = true;
        if (entry.paused || !entry.consumer.paused) return;
        await entry.consumer.resume();
    }

    /** Who is in the room and what each one sends, in the shape the planner reads. */
    people(): PersonState[] {
        return buildPeople(this.peers.values());
    }

    /** The consumers each receiver holds now, which the planner compares with what it wants. */
    currentConsumers(): Map<string, CurrentConsumer[]> {
        return buildCurrentConsumers(this.peers.values());
    }

    /**
     * One planner pass for the receivers in `dirtyIds`, applied right away.
     *
     * @param now Clock reading in ms, used by the debounce of the planner.
     * @param positions Where each person stands.
     * @param dirtyIds The receivers whose surroundings changed.
     * @returns The receivers to keep dirty for the next tick, which are the
     * ones the debounce held back and the ones still busy with the last pass.
     */
    async tick(
        now: number,
        positions: PositionSource,
        dirtyIds: ReadonlySet<string>
    ): Promise<string[]> {
        const split = splitReceivers(dirtyIds, this.peers);
        if (split.normal.size === 0 && split.low.size === 0) return split.busy;

        const planned = planReceivers(
            now,
            positions,
            this.speakerIds,
            this.peers,
            split,
            this.proximityPreset,
            this.videoShed
        );
        await Promise.all(
            planned.plans
                .filter((plan) => plan.changed)
                .map((plan) =>
                    this.applyPlan(
                        plan,
                        now,
                        planned.lowIds.has(plan.receiverId)
                    )
                )
        );
        return planned.deferred;
    }

    /**
     * Turns the plan of one receiver into consumer changes and tells the
     * client. Closes first, then pauses, resumes and changes layers together,
     * then creates the new consumers.
     *
     * @param forceLowLayer Always uses the low layer, for a weak machine.
     */
    async applyPlan(
        plan: ReceiverPlan,
        now: number,
        forceLowLayer: boolean = false
    ): Promise<void> {
        const peer = this.peers.get(plan.receiverId);
        if (!peer || !canReceive(peer)) return;

        const layerOf = (layer: SimulcastLayer): SimulcastLayer =>
            forceLowLayer ? "low" : layer;

        peer.applying = true;
        peer.lastChangeAt = now;
        try {
            plan.close.forEach(({ producerId }) =>
                closeConsumer(peer, producerId, this.notifier)
            );
            await Promise.all([
                ...[...plan.pause, ...plan.retag].map(
                    ({ producerId, reason }) =>
                        setConsumerPaused(
                            peer,
                            producerId,
                            true,
                            this.notifier,
                            reason
                        )
                ),
                ...plan.resume.map((id) =>
                    setConsumerPaused(peer, id, false, this.notifier)
                ),
                ...plan.setLayer.map(({ producerId, layer }) =>
                    setConsumerLayer(peer, producerId, layerOf(layer))
                ),
            ]);
            for (const want of plan.create) {
                await this.createConsumer(
                    peer,
                    want.producerId,
                    want.kind,
                    want.layer && layerOf(want.layer),
                    want.paused,
                    want.pauseReason ?? null
                );
            }
            this.releaseHidden(peer, plan.releasedHidden);
        } finally {
            peer.applying = false;
        }
    }

    // Ends the hiding of the people who left the reach of the video and tells
    // the client which are still hidden.
    private releaseHidden(peer: Peer, released: readonly string[]): void {
        const dropped = released.filter((id) => peer.hiddenVideo.delete(id));
        if (dropped.length === 0) return;

        this.notifier.hiddenVideoChanged(peer.id, {
            userIds: [...peer.hiddenVideo].flatMap((id) => {
                const userId = this.userIdOf(id);
                return userId ? [userId] : [];
            }),
        });
    }

    private async createConsumer(
        peer: Peer,
        producerId: string,
        kind: ProducerKind,
        layer: SimulcastLayer | null,
        paused: boolean,
        pauseReason: MediaPauseReason | null
    ): Promise<void> {
        const owner = this.producerOwners.get(producerId);
        if (!owner) return;

        const entry = await buildConsumer(
            this.router,
            peer,
            { producerId, kind, layer, paused, pauseReason },
            owner.peerId
        );
        if (!entry) return;

        // The receiver or the producer may be gone by now.
        if (!this.peers.has(peer.id) || !this.producerOwners.has(producerId)) {
            entry.consumer.close();
            return;
        }

        peer.consumers.set(producerId, entry);
        entry.consumer.on("producerclose", () => {
            this.onProducerClosed(peer, entry.producerId, entry.consumer);
        });
        this.notifier.consumerNew(
            peer.id,
            toConsumerNewPayload(entry, this.userIdOf(owner.peerId) ?? "")
        );
        // A consumer that is made held back says so right after it is announced.
        if (entry.pauseReason) {
            this.notifier.consumerPaused(peer.id, {
                consumerId: entry.consumer.id,
                reason: entry.pauseReason,
            });
        }
    }

    private onProducerClosed(
        peer: Peer,
        producerId: string,
        consumer: types.Consumer
    ): void {
        if (peer.consumers.get(producerId)?.consumer !== consumer) return;

        peer.consumers.delete(producerId);
        consumer.close();
        if (!this.peers.has(peer.id)) return;
        this.notifier.consumerClosed(peer.id, { consumerId: consumer.id });
    }

    /**
     * Tells each sender of a video whether anybody receives it. A sender whose
     * video nobody receives is told to stop encoding after a short grace
     * period, and to start again as soon as somebody does. Called on every
     * tick, since a consumer can go away without a plan.
     */
    syncDemand(now: number): void {
        const counts = new Map<string, number>();
        this.peers.forEach((peer) =>
            peer.consumers.forEach((entry) =>
                counts.set(
                    entry.producerId,
                    (counts.get(entry.producerId) ?? 0) + 1
                )
            )
        );

        const entries: DemandEntry[] = [];
        this.peers.forEach((peer) =>
            peer.producers.forEach(({ producer, source }) => {
                if (producer.kind !== "video") return;
                entries.push({
                    peerId: peer.id,
                    source,
                    consumerCount: counts.get(producer.id) ?? 0,
                });
            })
        );

        nextDemand(entries, this.demand, now, DEMAND_IDLE_MS).forEach(
            ({ peerId, source, wanted }) =>
                this.notifier.producerDemand(peerId, { source, wanted })
        );
    }

    /** How many peers, transports, producers and consumers the room holds. */
    counts(): MediaCounts {
        return countMedia(this.peers);
    }

    /** The consumers of the room by audio, video layer, screen and paused. */
    consumerBreakdown(): ConsumerBreakdown {
        return breakdownConsumers(this.peers);
    }

    /** The bytes received from senders and sent to receivers so far. */
    traffic(): Promise<MediaTraffic> {
        return readTraffic(this.peers);
    }

    /** Closes the router and forgets everybody. Safe to call twice. */
    close(): void {
        if (this.closed) return;
        this.closed = true;
        this.peers.clear();
        this.producerOwners.clear();
        this.router.close();
    }
}

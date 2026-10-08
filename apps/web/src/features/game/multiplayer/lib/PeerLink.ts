import {
    DATA_CHANNEL_ID,
    DATA_CHANNEL_LABEL,
    ICE_DISCONNECTED_GRACE_MS,
    ICE_RESTART_BASE_DELAY_MS,
    ICE_RESTART_MAX_ATTEMPTS,
} from "../consts/connection";
import {
    MEDIA_SLOTS,
    type MediaSlot,
    type PeerLinkEvents,
    type PeerSignal,
    type SlotEncoding,
} from "../types/transport";

export type PeerLinkDeps = {
    createPeerConnection: (config: RTCConfiguration) => RTCPeerConnection;
    createMediaStream: () => MediaStream;
};

const defaultDeps: PeerLinkDeps = {
    createPeerConnection: (config) => new RTCPeerConnection(config),
    createMediaStream: () => new MediaStream(),
};

export type PeerLinkOptions = {
    // Whether this side is the one the server told to start the connection
    // (the peer that was already in the space when the other one joined
    // never initiates). Only decides who sends the very first offer;
    // every later renegotiation can come from either side.
    initiator: boolean;
    polite: boolean;
    iceServers: RTCIceServer[];
    // Asked for right before an ICE restart. TURN credentials expire, so a
    // link that outlives them has to restart with the current list rather
    // than the one it was created with.
    getIceServers?: () => RTCIceServer[];
    events: PeerLinkEvents;
    deps?: PeerLinkDeps;
};

type SlotState = {
    // Stable for the lifetime of the link: its id is what the receiver
    // uses to recognise which slot a remote track belongs to.
    stream: MediaStream;
    sender: RTCRtpSender | null;
    track: MediaStreamTrack | null;
    // What the caller wants, and what was last pushed to the sender, so the
    // same limits are not re-applied on every proximity tick.
    encoding: SlotEncoding | null;
    appliedEncoding: SlotEncoding | null;
};

const isSameEncoding = (
    first: SlotEncoding | null,
    second: SlotEncoding | null
): boolean =>
    first?.maxBitrate === second?.maxBitrate &&
    first?.maxFramerate === second?.maxFramerate &&
    first?.scaleResolutionDownBy === second?.scaleResolutionDownBy;

const SLOT_KINDS: Record<MediaSlot, "audio" | "video"> = {
    [MEDIA_SLOTS.AUDIO]: "audio",
    [MEDIA_SLOTS.CAMERA]: "video",
    [MEDIA_SLOTS.SCREEN]: "video",
};

// One WebRTC connection to one remote peer, over the browser's native
// RTCPeerConnection. It owns:
// * a negotiated DataChannel for app messages (position, chat, media state)
// * one outgoing transceiver per MediaSlot, created lazily the first time
//   a slot has a track and kept afterwards (turning a slot off is
//   replaceTrack(null), which does not renegotiate)
// * the "perfect negotiation" collision handling, so either side can add
//   or remove media at any time without the two offers deadlocking
// * ICE restart with backoff when the connection degrades
export class PeerLink {
    private readonly pc: RTCPeerConnection;
    private readonly channel: RTCDataChannel;
    private readonly events: PeerLinkEvents;
    private readonly initiator: boolean;
    private readonly polite: boolean;
    private readonly slots: Record<MediaSlot, SlotState>;

    private makingOffer = false;
    private ignoreOffer = false;
    private hasRemoteDescription = false;
    // A negotiationneeded that could not be acted on yet (see negotiate).
    // Replayed as soon as signaling is stable and we are allowed to offer.
    private pendingNegotiation = false;
    // Incoming signals are handled strictly one at a time: an offer and the
    // candidates right behind it arrive back to back, and a candidate must
    // not be applied before setRemoteDescription for the offer has finished.
    private signalQueue: Promise<void> = Promise.resolve();

    private restartTimer: ReturnType<typeof setTimeout> | null = null;
    private restartAttempts = 0;
    private closed = false;
    private readonly getIceServers: (() => RTCIceServer[]) | undefined;

    constructor({
        initiator,
        polite,
        iceServers,
        getIceServers,
        events,
        deps = defaultDeps,
    }: PeerLinkOptions) {
        this.getIceServers = getIceServers;
        this.initiator = initiator;
        this.polite = polite;
        this.events = events;

        this.slots = {
            [MEDIA_SLOTS.AUDIO]: this.createSlot(deps),
            [MEDIA_SLOTS.CAMERA]: this.createSlot(deps),
            [MEDIA_SLOTS.SCREEN]: this.createSlot(deps),
        };

        this.pc = deps.createPeerConnection({ iceServers });
        this.channel = this.pc.createDataChannel(DATA_CHANNEL_LABEL, {
            negotiated: true,
            id: DATA_CHANNEL_ID,
        });

        this.channel.onopen = () => this.events.onOpen();
        this.channel.onmessage = (event) => {
            if (typeof event.data === "string") this.events.onData(event.data);
        };
        this.channel.onclose = () => this.close();

        this.pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                this.events.onSignal({ candidate: candidate.toJSON() });
            }
        };
        this.pc.ontrack = ({ track, streams }) => {
            this.events.onTrack({ track, streamId: streams[0]?.id ?? null });
        };
        this.pc.onnegotiationneeded = () => void this.negotiate();
        this.pc.oniceconnectionstatechange = () => this.onIceStateChange();
        this.pc.onsignalingstatechange = () => {
            if (this.pc.signalingState !== "stable") return;

            this.applyAllEncodings();
            this.replayPendingNegotiation();
        };
    }

    get isOpen(): boolean {
        return !this.closed && this.channel.readyState === "open";
    }

    // The id the remote side will see on tracks of this slot. Stable from
    // construction, so it can be announced before the first track exists.
    getStreamId(slot: MediaSlot): string {
        return this.slots[slot].stream.id;
    }

    signal(signal: PeerSignal): void {
        if (this.closed) return;

        this.signalQueue = this.signalQueue
            .then(() => this.applySignal(signal))
            .catch((error) => {
                console.error("[multiplayer] failed to apply signal", error);
            });
    }

    send(data: string): boolean {
        if (!this.isOpen) return false;

        this.channel.send(data);
        return true;
    }

    // Idempotent: setting the track a slot already carries is a no-op, so
    // callers can reapply their whole desired state on every proximity tick.
    setTrack(slot: MediaSlot, track: MediaStreamTrack | null): void {
        if (this.closed) return;

        const state = this.slots[slot];
        if (state.track === track) return;
        state.track = track;

        if (state.sender) {
            state.sender.replaceTrack(track).catch((error) => {
                console.error(
                    "[multiplayer] failed to replace",
                    slot,
                    "track",
                    error
                );
            });
            this.applyEncoding(slot);
            return;
        }

        // Nothing to send and nothing negotiated yet: leave the slot
        // without a transceiver rather than negotiating an empty m-line.
        if (!track) return;

        // The limits go in at creation (video only) so the very first offer
        // already carries them, instead of the sender running unconstrained
        // until the parameters can be set after negotiation.
        const initialEncoding =
            SLOT_KINDS[slot] === "video" ? state.encoding : null;
        const transceiver = this.pc.addTransceiver(track, {
            direction: "sendonly",
            streams: [state.stream],
            ...(initialEncoding ? { sendEncodings: [initialEncoding] } : {}),
        });
        state.sender = transceiver.sender;
        state.appliedEncoding = initialEncoding;
        this.applyEncoding(slot);
    }

    setEncoding(slot: MediaSlot, encoding: SlotEncoding): void {
        this.slots[slot].encoding = encoding;
        this.applyEncoding(slot);
    }

    close(): void {
        if (this.closed) return;
        this.closed = true;

        this.clearRestartTimer();
        this.channel.onopen = null;
        this.channel.onmessage = null;
        this.channel.onclose = null;
        this.pc.onicecandidate = null;
        this.pc.ontrack = null;
        this.pc.onnegotiationneeded = null;
        this.pc.oniceconnectionstatechange = null;
        this.pc.onsignalingstatechange = null;

        try {
            this.channel.close();
            this.pc.close();
        } finally {
            this.events.onClose();
        }
    }

    private createSlot(deps: PeerLinkDeps): SlotState {
        return {
            stream: deps.createMediaStream(),
            sender: null,
            track: null,
            encoding: null,
            appliedEncoding: null,
        };
    }

    // The offer side of perfect negotiation. `makingOffer` is what lets
    // applySignal recognise a collision while the offer is still being
    // built.
    private async negotiate(): Promise<void> {
        if (this.closed) return;

        // Not acting on it right now, but not dropping it either:
        // * the very first offer belongs to the initiator, so the other
        //   side waits for it (creating the data channel and adding media
        //   also makes it want to negotiate) instead of starting a fresh
        //   connection with two colliding offers
        // * an offer or answer is already in flight, and stacking a second
        //   local offer on top of it would leave the remote side answering
        //   twice
        if (!this.canOffer()) {
            this.pendingNegotiation = true;
            return;
        }

        try {
            this.makingOffer = true;
            await this.pc.setLocalDescription();
            if (this.pc.localDescription) {
                this.events.onSignal({
                    description: this.pc.localDescription.toJSON(),
                });
            }
        } catch (error) {
            console.error("[multiplayer] failed to create offer", error);
        } finally {
            this.makingOffer = false;
        }
    }

    private canOffer(): boolean {
        if (!this.initiator && !this.hasRemoteDescription) return false;

        return !this.makingOffer && this.pc.signalingState === "stable";
    }

    private replayPendingNegotiation(): void {
        if (!this.pendingNegotiation || !this.canOffer()) return;

        this.pendingNegotiation = false;
        void this.negotiate();
    }

    private async applySignal({
        description,
        candidate,
    }: PeerSignal): Promise<void> {
        if (description) {
            const offerCollision =
                description.type === "offer" &&
                (this.makingOffer || this.pc.signalingState !== "stable");

            this.ignoreOffer = !this.polite && offerCollision;
            if (this.ignoreOffer) return;

            // For the polite side this implicitly rolls back its own
            // pending local offer before applying the remote one.
            await this.pc.setRemoteDescription(description);
            this.hasRemoteDescription = true;

            if (description.type === "offer") {
                await this.pc.setLocalDescription();
                if (this.pc.localDescription) {
                    this.events.onSignal({
                        description: this.pc.localDescription.toJSON(),
                    });
                }
            }
            return;
        }

        if (candidate) {
            try {
                await this.pc.addIceCandidate(candidate);
            } catch (error) {
                // A candidate that belongs to an offer we deliberately
                // ignored is expected to be rejected.
                if (!this.ignoreOffer) throw error;
            }
        }
    }

    private onIceStateChange(): void {
        const state = this.pc.iceConnectionState;

        if (state === "connected" || state === "completed") {
            this.clearRestartTimer();
            this.restartAttempts = 0;
            return;
        }

        if (state === "disconnected") {
            this.scheduleRestart(ICE_DISCONNECTED_GRACE_MS);
            return;
        }

        if (state === "failed") {
            this.scheduleRestart(
                ICE_RESTART_BASE_DELAY_MS * 2 ** this.restartAttempts
            );
        }
    }

    private scheduleRestart(delayMs: number): void {
        if (this.closed || this.restartTimer) return;

        if (this.restartAttempts >= ICE_RESTART_MAX_ATTEMPTS) {
            console.warn("[multiplayer] giving up on peer after ICE restarts");
            this.close();
            return;
        }

        this.restartTimer = setTimeout(() => {
            this.restartTimer = null;
            if (this.closed) return;

            const state = this.pc.iceConnectionState;
            if (state === "connected" || state === "completed") return;

            this.restartAttempts += 1;
            this.refreshIceServers();
            this.pc.restartIce();
        }, delayMs);
    }

    private refreshIceServers(): void {
        const iceServers = this.getIceServers?.();
        if (!iceServers) return;

        try {
            this.pc.setConfiguration({
                ...this.pc.getConfiguration(),
                iceServers,
            });
        } catch (error) {
            console.warn("[multiplayer] could not refresh ICE servers", error);
        }
    }

    private clearRestartTimer(): void {
        if (!this.restartTimer) return;

        clearTimeout(this.restartTimer);
        this.restartTimer = null;
    }

    private applyAllEncodings(): void {
        (Object.keys(this.slots) as MediaSlot[]).forEach((slot) =>
            this.applyEncoding(slot)
        );
    }

    // Sender parameters only take effect once the sender is part of a
    // negotiated m-line, so this is retried whenever signaling settles back
    // to stable and is a silent no-op until then.
    private applyEncoding(slot: MediaSlot): void {
        const state = this.slots[slot];
        const { sender, encoding } = state;
        if (SLOT_KINDS[slot] !== "video" || !sender || !encoding) return;
        if (isSameEncoding(encoding, state.appliedEncoding)) return;

        const parameters = sender.getParameters();
        if (!parameters.encodings || parameters.encodings.length === 0) return;

        state.appliedEncoding = encoding;
        parameters.encodings[0] = { ...parameters.encodings[0], ...encoding };
        sender.setParameters(parameters).catch((error) => {
            state.appliedEncoding = null;
            console.warn("[multiplayer] failed to set", slot, "encoding", error);
        });
    }
}

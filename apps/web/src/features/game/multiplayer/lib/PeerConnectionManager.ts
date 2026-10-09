import {
    PEER_MESSAGE_TYPES,
    type PeerChatPayload,
    type PeerConfirmPayload,
    type PeerDeletePayload,
    type PeerEditPayload,
    type PeerMediaStatePayload,
    type PeerMessage,
    type PeerReactionPayload,
    type PeerTypingPayload,
    type PlayerPosition,
} from "@standin/contracts";
import { PEER_CONNECT_TIMEOUT_MS, SEND_INTERVAL_MS } from "../consts/sync";
import { PeerLink, type PeerLinkOptions } from "./PeerLink";
import {
    MEDIA_SLOTS,
    type MediaSlot,
    type PeerSignal,
    type RemoteTrack,
} from "../types/transport";
import { isPolitePeer } from "../utils/negotiation";
import {
    getReceivingVideoPeers,
    getVideoEncoding,
    NO_MEDIA,
    type PeerMediaPolicy,
} from "../utils/mediaPolicy";

export type PeerConnectionEvents = {
    onSignal: (targetSocketId: string, signal: PeerSignal) => void;
    onPeerConnected: (socketId: string) => void;
    onPeerData: (socketId: string, data: unknown) => void;
    onRemoteTrack: (socketId: string, remote: RemoteTrack) => void;
    onPeerClosed: (socketId: string) => void;
};

// The slice of PeerLink the manager depends on, so tests can hand it a
// stand-in instead of a real RTCPeerConnection.
export type PeerLinkHandle = Pick<
    PeerLink,
    | "isOpen"
    | "getStreamId"
    | "signal"
    | "send"
    | "setTrack"
    | "setEncoding"
    | "close"
>;

export type PeerLinkFactory = (options: PeerLinkOptions) => PeerLinkHandle;

const defaultLinkFactory: PeerLinkFactory = (options) => new PeerLink(options);

type LocalTracks = Record<MediaSlot, MediaStreamTrack | null>;

// One instance per Space session, created and destroyed alongside it, not a
// singleton: the set of peers only makes sense for the Space currently
// joined.
//
// Outgoing media is decided per peer, never globally: setMediaPolicies says
// what each peer may receive (audio and video only while in range), and
// every outgoing track is attached to, or detached from, that peer's link
// accordingly. A peer out of range therefore receives no media at all, not
// merely a lowered volume, so this is a real privacy boundary and not only
// a UX one.
export class PeerConnectionManager {
    private readonly peers = new Map<string, PeerLinkHandle>();
    private readonly connectTimeouts = new Map<
        string,
        ReturnType<typeof setTimeout>
    >();
    private readonly policies = new Map<string, PeerMediaPolicy>();
    // Last media state announced to each peer, so an unchanged state is not
    // resent on every proximity tick.
    private readonly announcedMediaState = new Map<string, string>();
    private readonly localTracks: LocalTracks = {
        [MEDIA_SLOTS.AUDIO]: null,
        [MEDIA_SLOTS.CAMERA]: null,
        [MEDIA_SLOTS.SCREEN]: null,
    };
    private events: PeerConnectionEvents;
    private readonly createLink: PeerLinkFactory;
    private lastPositionSentAt = 0;
    private iceServers: RTCIceServer[] = [];
    private localSocketId: string | null = null;
    private localUserId: string | null = null;
    private localMicMuted = false;

    constructor(
        events: PeerConnectionEvents,
        createLink: PeerLinkFactory = defaultLinkFactory
    ) {
        this.events = events;
        this.createLink = createLink;
    }

    // Lets the caller swap in event handlers that close over fresh
    // React state/props without re-creating the manager (and therefore the
    // underlying peer connections) on every render.
    setEvents(events: PeerConnectionEvents): void {
        this.events = events;
    }

    setIceServers(iceServers: RTCIceServer[]): void {
        this.iceServers = iceServers;
    }

    // Both are needed before any link is created: the socket id decides
    // which side of each pair is the polite one, and the user id goes into
    // the media state announced to peers.
    setLocalIdentity(identity: { socketId: string; userId: string }): void {
        this.localSocketId = identity.socketId;
        this.localUserId = identity.userId;
    }

    createConnection(targetSocketId: string, initiator: boolean): void {
        if (this.peers.has(targetSocketId)) return;

        if (!this.localSocketId) {
            console.warn(
                "[multiplayer] creating a peer link before the local socket id is known"
            );
        }

        const link = this.createLink({
            initiator,
            // Without our own socket id there is nothing to compare, so
            // fall back to something that is still asymmetric by
            // construction: the side that was told to initiate is the
            // impolite one. Two impolite peers would deadlock on glare.
            polite: this.localSocketId
                ? isPolitePeer(this.localSocketId, targetSocketId)
                : !initiator,
            iceServers: this.iceServers,
            getIceServers: () => this.iceServers,
            events: {
                onSignal: (signal) =>
                    this.events.onSignal(targetSocketId, signal),
                onOpen: () => this.handleOpen(targetSocketId),
                onData: (data) => this.handleData(targetSocketId, data),
                onTrack: (remote) =>
                    this.events.onRemoteTrack(targetSocketId, remote),
                onClose: () => this.handleClosed(targetSocketId),
            },
        });
        this.peers.set(targetSocketId, link);

        this.connectTimeouts.set(
            targetSocketId,
            setTimeout(() => {
                console.warn(
                    "[multiplayer] peer connection to",
                    targetSocketId,
                    "timed out after",
                    PEER_CONNECT_TIMEOUT_MS,
                    "ms without connecting"
                );
                this.destroy(targetSocketId);
            }, PEER_CONNECT_TIMEOUT_MS)
        );

        // Attached before the first offer is even built, so media that is
        // already allowed for this peer travels in the initial negotiation
        // instead of triggering a second one right after.
        this.applyMedia(targetSocketId);
    }

    handleSignal(fromSocketId: string, signal: PeerSignal): void {
        const existing = this.peers.get(fromSocketId);
        // Only an offer can legitimately start a connection we don't know
        // about yet (a signal racing ahead of space:peer-joined). Anything
        // else for an unknown peer is a straggler from someone who already
        // left: creating a connection for it would never complete and
        // would leak for the lifetime of the page.
        if (!existing && signal.description?.type !== "offer") return;

        if (!existing) this.createConnection(fromSocketId, false);
        this.peers.get(fromSocketId)?.signal(signal);
    }

    private handleOpen(socketId: string): void {
        this.clearConnectTimeout(socketId);
        this.announcedMediaState.delete(socketId);
        this.sendMediaState(socketId);
        this.events.onPeerConnected(socketId);
    }

    private handleData(socketId: string, data: string): void {
        try {
            this.events.onPeerData(socketId, JSON.parse(data));
        } catch (error) {
            console.warn(
                "[multiplayer] malformed data frame from",
                socketId,
                error
            );
        }
    }

    private handleClosed(socketId: string): void {
        this.clearConnectTimeout(socketId);
        this.peers.delete(socketId);
        this.policies.delete(socketId);
        this.announcedMediaState.delete(socketId);
        this.events.onPeerClosed(socketId);
    }

    private dispatch(message: PeerMessage): void {
        const serialized = JSON.stringify(message);
        this.peers.forEach((link) => {
            if (link.isOpen) link.send(serialized);
        });
    }

    broadcastPosition(state: PlayerPosition): void {
        const now = Date.now();
        if (now - this.lastPositionSentAt < SEND_INTERVAL_MS) return;

        this.lastPositionSentAt = now;
        this.dispatch({ type: PEER_MESSAGE_TYPES.POSITION, payload: state });
    }

    // No throttling here on purpose: a chat message is a discrete, user-
    // triggered event (unlike position, which is sampled continuously), so
    // every send must go out immediately.
    broadcastChatMessage(payload: PeerChatPayload): void {
        this.dispatch({ type: PEER_MESSAGE_TYPES.CHAT, payload });
    }

    // Debouncing/expiry is the caller's responsibility (see SendMessageForm),
    // same reasoning as broadcastChatMessage.
    broadcastTyping(payload: PeerTypingPayload): void {
        this.dispatch({ type: PEER_MESSAGE_TYPES.TYPING, payload });
    }

    // Same reasoning as broadcastChatMessage: a reaction toggle is a
    // discrete, user-triggered event, so it goes out immediately.
    broadcastReaction(payload: PeerReactionPayload): void {
        this.dispatch({ type: PEER_MESSAGE_TYPES.REACTION, payload });
    }

    // Same reasoning as broadcastChatMessage: an edit is a discrete, user-
    // triggered event, so it goes out immediately.
    broadcastEdit(payload: PeerEditPayload): void {
        this.dispatch({ type: PEER_MESSAGE_TYPES.EDIT, payload });
    }

    // Same reasoning as broadcastChatMessage: a delete is a discrete, user-
    // triggered event, so it goes out immediately.
    broadcastDelete(payload: PeerDeletePayload): void {
        this.dispatch({ type: PEER_MESSAGE_TYPES.DELETE, payload });
    }

    // Sent once the API call behind an earlier broadcastChatMessage
    // resolves, so peers can swap the temporary id for the real one.
    broadcastConfirm(payload: PeerConfirmPayload): void {
        this.dispatch({ type: PEER_MESSAGE_TYPES.CONFIRM, payload });
    }

    // Called whenever a local source changes: the mic stream becoming
    // available or being swapped, the camera or a screen share starting or
    // stopping. Every peer is reconciled against the new track and its own
    // policy.
    setLocalTrack(slot: MediaSlot, track: MediaStreamTrack | null): void {
        if (this.localTracks[slot] === track) return;

        this.localTracks[slot] = track;
        this.peers.forEach((_link, socketId) => this.applyMedia(socketId));
    }

    // Called whenever the local mic is switched on or off. Peers learn it
    // through the same announcement as the video streams, which also covers
    // peers that connect later.
    setLocalMicMuted(muted: boolean): void {
        if (this.localMicMuted === muted) return;

        this.localMicMuted = muted;
        this.peers.forEach((_link, socketId) => this.sendMediaState(socketId));
    }

    // Replaces the whole picture of who may receive what. Peers missing from
    // the map are treated as out of range.
    setMediaPolicies(policies: ReadonlyMap<string, PeerMediaPolicy>): void {
        this.policies.clear();
        policies.forEach((policy, socketId) =>
            this.policies.set(socketId, policy)
        );

        this.peers.forEach((_link, socketId) => this.applyMedia(socketId));
    }

    // Which peers currently receive the local video. Feeds the hysteresis
    // of the next policy computation.
    getReceivingVideoPeers(): Set<string> {
        return getReceivingVideoPeers(this.policies);
    }

    private applyMedia(socketId: string): void {
        const link = this.peers.get(socketId);
        if (!link) return;

        const policy = this.policies.get(socketId) ?? NO_MEDIA;
        link.setTrack(
            MEDIA_SLOTS.AUDIO,
            policy.audio ? this.localTracks[MEDIA_SLOTS.AUDIO] : null
        );
        link.setTrack(
            MEDIA_SLOTS.CAMERA,
            policy.video ? this.localTracks[MEDIA_SLOTS.CAMERA] : null
        );
        link.setTrack(
            MEDIA_SLOTS.SCREEN,
            policy.video ? this.localTracks[MEDIA_SLOTS.SCREEN] : null
        );

        this.applyEncodings();
        this.sendMediaState(socketId);
    }

    private applyEncodings(): void {
        const receiverCount = this.getReceivingVideoPeers().size;
        const camera = getVideoEncoding("camera", receiverCount);
        const screen = getVideoEncoding("screen", receiverCount);

        this.peers.forEach((link) => {
            link.setEncoding(MEDIA_SLOTS.CAMERA, camera);
            link.setEncoding(MEDIA_SLOTS.SCREEN, screen);
        });
    }

    // Tells one peer which of its incoming video tracks are live and which
    // slot each one is. Sent per peer (not broadcast) because it depends on
    // that peer's own range.
    private sendMediaState(socketId: string): void {
        const link = this.peers.get(socketId);
        if (!link?.isOpen || !this.localUserId) return;

        const policy = this.policies.get(socketId) ?? NO_MEDIA;
        const payload: PeerMediaStatePayload = {
            userId: this.localUserId,
            cameraStreamId:
                policy.video && this.localTracks[MEDIA_SLOTS.CAMERA]
                    ? link.getStreamId(MEDIA_SLOTS.CAMERA)
                    : null,
            screenStreamId:
                policy.video && this.localTracks[MEDIA_SLOTS.SCREEN]
                    ? link.getStreamId(MEDIA_SLOTS.SCREEN)
                    : null,
            isMicMuted: this.localMicMuted,
        };

        const serialized = JSON.stringify({
            type: PEER_MESSAGE_TYPES.MEDIA_STATE,
            payload,
        } satisfies PeerMessage);
        if (this.announcedMediaState.get(socketId) === serialized) return;

        this.announcedMediaState.set(socketId, serialized);
        link.send(serialized);
    }

    destroy(socketId: string): void {
        this.clearConnectTimeout(socketId);
        // close() reports through onClose, which does the map cleanup, but
        // the entries are also dropped here in case the link was already
        // closed and will not report again.
        this.peers.get(socketId)?.close();
        this.peers.delete(socketId);
        this.policies.delete(socketId);
        this.announcedMediaState.delete(socketId);
    }

    destroyAll(): void {
        [...this.peers.keys()].forEach((socketId) => this.destroy(socketId));
        this.connectTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
        this.connectTimeouts.clear();
    }

    private clearConnectTimeout(socketId: string): void {
        const timeoutId = this.connectTimeouts.get(socketId);
        if (timeoutId === undefined) return;

        clearTimeout(timeoutId);
        this.connectTimeouts.delete(socketId);
    }
}

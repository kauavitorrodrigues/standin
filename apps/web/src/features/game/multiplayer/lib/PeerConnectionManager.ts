import Peer from "simple-peer";
import {
    PEER_MESSAGE_TYPES,
    type PeerChatPayload,
    type PeerConfirmPayload,
    type PeerDeletePayload,
    type PeerEditPayload,
    type PeerMessage,
    type PeerReactionPayload,
    type PeerTypingPayload,
    type PlayerPosition,
} from "@standin/contracts";
import { PEER_CONNECT_TIMEOUT_MS, SEND_INTERVAL_MS } from "../consts/sync";
import { ICE_SERVERS } from "../consts/ice-servers";
import { getPeersMissingLocalStream } from "../utils/localStream";

export type PeerConnectionEvents = {
    onSignal: (targetSocketId: string, signal: Peer.SignalData) => void;
    onPeerConnected: (socketId: string) => void;
    onPeerData: (socketId: string, data: unknown) => void;
    onRemoteStream: (socketId: string, stream: MediaStream) => void;
    onPeerClosed: (socketId: string) => void;
};

const textDecoder = new TextDecoder();

// One instance per Space session, created and destroyed alongside it, not a
// singleton: the set of peers only makes sense for the Space currently
// joined.
//
// Known limitation: proximity muting (see MapScene/RemoteAudioManager) is
// enforced receiver-side only, by lowering playback volume. The outgoing
// mic track itself keeps flowing to every peer in the mesh regardless of
// distance (gated only by the local mute toggle), so this is a UX feature,
// not a privacy guarantee - a modified client can always set its own
// received volume back to 1 and listen from anywhere in the space.
//
// Known limitation: if two already-connected peers both call
// setLocalStream with a fresh MediaStream at nearly the same time (e.g.
// both grant mic permission moments after the mesh comes up), both sides
// trigger addStream-driven renegotiation concurrently. simple-peer has no
// perfect-negotiation/polite-peer rollback for that glare; it's expected
// to be rare in practice (most local streams arrive well before any peer
// connects) and is left as a known gap rather than adding a speculative
// negotiation queue.
export class PeerConnectionManager {
    private readonly peers = new Map<string, Peer.Instance>();
    private readonly connectTimeouts = new Map<
        string,
        ReturnType<typeof setTimeout>
    >();
    // Tracks, per peer, the local media stream/track currently registered
    // with simple-peer. `senderStream` is the exact MediaStream object
    // originally passed to peer.addStream for that peer and never changes
    // afterwards - simple-peer's internal _senderMap keys a peer's sender by
    // that stream object for the lifetime of the connection, so a later
    // replaceTrack or removeStream call MUST keep using it (not whatever
    // the most recently set stream happens to be) or the lookup misses and
    // throws. `track` is the currently active audio track, updated on every
    // replaceTrack.
    private readonly localStreamAttachments = new Map<
        string,
        { senderStream: MediaStream; track: MediaStreamTrack }
    >();
    private events: PeerConnectionEvents;
    private lastPositionSentAt = 0;
    // Single source of truth for the outgoing media track: every peer,
    // whether created before or after this is set, reads it from here
    // instead of receiving it as a per-call argument. That's what makes
    // handleSignal's own createConnection call (an offer racing ahead of
    // space:peer-joined) get the stream too, instead of being created
    // stream-less and silently staying that way for the rest of the
    // session.
    private localStream: MediaStream | null = null;

    constructor(events: PeerConnectionEvents) {
        this.events = events;
    }

    // Lets the caller swap in event handlers that close over fresh
    // React state/props without re-creating the manager (and therefore the
    // underlying peer connections) on every render.
    setEvents(events: PeerConnectionEvents): void {
        this.events = events;
    }

    createConnection(
        targetSocketId: string,
        initiator: boolean
    ): Peer.Instance {
        const existingPeer = this.peers.get(targetSocketId);
        if (existingPeer) return existingPeer;

        const peer = new Peer({
            initiator,
            trickle: true,
            config: { iceServers: ICE_SERVERS },
            ...(this.localStream ? { stream: this.localStream } : {}),
        });
        if (this.localStream) {
            const track = this.localStream.getAudioTracks()[0];
            if (track) {
                this.localStreamAttachments.set(targetSocketId, {
                    senderStream: this.localStream,
                    track,
                });
            }
        }

        peer.on("signal", (signal) => {
            this.events.onSignal(targetSocketId, signal);
        });

        const timeoutId = setTimeout(() => {
            console.warn(
                "[multiplayer] peer connection to",
                targetSocketId,
                "timed out after",
                PEER_CONNECT_TIMEOUT_MS,
                "ms without connecting"
            );
            this.destroy(targetSocketId);
        }, PEER_CONNECT_TIMEOUT_MS);
        this.connectTimeouts.set(targetSocketId, timeoutId);

        peer.on("connect", () => {
            this.clearConnectTimeout(targetSocketId);
            this.events.onPeerConnected(targetSocketId);
        });

        peer.on("stream", (stream) => {
            this.events.onRemoteStream(targetSocketId, stream);
        });

        peer.on("data", (data: Uint8Array) => {
            try {
                this.events.onPeerData(
                    targetSocketId,
                    JSON.parse(textDecoder.decode(data))
                );
            } catch (error) {
                console.warn(
                    "[multiplayer] malformed data frame from",
                    targetSocketId,
                    error
                );
            }
        });

        peer.on("close", () => {
            this.clearConnectTimeout(targetSocketId);
            this.peers.delete(targetSocketId);
            this.localStreamAttachments.delete(targetSocketId);
            this.events.onPeerClosed(targetSocketId);
        });

        peer.on("error", (error) => {
            // simple-peer always emits "close" right after "error", which
            // already handles cleanup here - just surface the failure
            // instead of reporting it twice.
            console.error(
                "[multiplayer] peer connection error with",
                targetSocketId,
                error
            );
        });

        this.peers.set(targetSocketId, peer);
        return peer;
    }

    handleSignal(fromSocketId: string, signal: Peer.SignalData): void {
        const existingPeer = this.peers.get(fromSocketId);
        // Only an offer can legitimately start a connection we don't know
        // about yet (a signal racing ahead of space:peer-joined). Anything
        // else for an unknown peer is a straggler from someone who already
        // left - creating a connection for it would never complete and
        // would leak for the lifetime of the page.
        if (!existingPeer && signal.type !== "offer") return;

        const peer = existingPeer ?? this.createConnection(fromSocketId, false);
        try {
            peer.signal(signal);
        } catch (error) {
            console.error(
                "[multiplayer] invalid signal from",
                fromSocketId,
                error
            );
            this.destroy(fromSocketId);
        }
    }

    private dispatch(message: PeerMessage): void {
        const serialized = JSON.stringify(message);
        this.peers.forEach((peer) => {
            if (peer.connected) peer.send(serialized);
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

    // Called whenever the local mic stream changes: becomes available for
    // the first time (permission granted with a delay), swaps to a
    // different device, or goes away (permission revoked, device
    // unplugged). Every already-connected peer is reconciled against the
    // new value; a peer created afterwards picks it up on its own via
    // `this.localStream` in createConnection.
    setLocalStream(stream: MediaStream | null): void {
        const previousStream = this.localStream;
        this.localStream = stream;

        if (previousStream === stream) return;

        if (!stream) {
            this.detachStream();
            return;
        }

        if (!previousStream) {
            this.attachStreamToMissingPeers(stream);
            return;
        }

        this.replaceStreamForAttachedPeers(stream);
    }

    private attachStreamToMissingPeers(stream: MediaStream): void {
        const attachedSocketIds = new Set(this.localStreamAttachments.keys());
        const missingSocketIds = getPeersMissingLocalStream(
            this.peers,
            attachedSocketIds
        );

        missingSocketIds.forEach((socketId) => {
            this.addStreamToPeer(socketId, stream);
        });
    }

    // A device change while peers are already up: peers that already carry
    // a stream get their track swapped in place via replaceTrack (no
    // renegotiation, unlike addStream/removeStream), and any peer that
    // never got a stream at all (e.g. connected while the mic was still
    // unavailable) gets the new one attached like normal.
    private replaceStreamForAttachedPeers(stream: MediaStream): void {
        const newTrack = stream.getAudioTracks()[0];

        this.peers.forEach((peer, socketId) => {
            if (peer.destroyed) return;

            const attachment = this.localStreamAttachments.get(socketId);
            if (!attachment) {
                this.addStreamToPeer(socketId, stream);
                return;
            }

            if (!newTrack) {
                console.warn(
                    "[multiplayer] new local stream has no audio track, leaving",
                    socketId,
                    "on its previous track"
                );
                return;
            }

            try {
                // `attachment.senderStream`, not the new (or previous)
                // stream: it's the exact object simple-peer's _senderMap
                // keys this peer's sender by, invariant for the connection's
                // lifetime regardless of how many times the track itself is
                // swapped. Passing anything else here works for exactly one
                // swap and then silently fails every one after (caught
                // below, but the peer is left on a stale track).
                peer.replaceTrack(
                    attachment.track,
                    newTrack,
                    attachment.senderStream
                );
                this.localStreamAttachments.set(socketId, {
                    senderStream: attachment.senderStream,
                    track: newTrack,
                });
            } catch (error) {
                console.error(
                    "[multiplayer] failed to replace local stream track for",
                    socketId,
                    error
                );
            }
        });
    }

    private detachStream(): void {
        this.localStreamAttachments.forEach((attachment, socketId) => {
            const peer = this.peers.get(socketId);
            if (peer && !peer.destroyed) {
                try {
                    peer.removeStream(attachment.senderStream);
                } catch (error) {
                    console.error(
                        "[multiplayer] failed to detach local stream from",
                        socketId,
                        error
                    );
                }
            }
        });
        this.localStreamAttachments.clear();
    }

    // Centralizes every peer.addStream call: simple-peer throws
    // synchronously for a peer that's already destroyed (a legitimate race
    // with destroy() being in flight), so this is the one place that needs
    // to guard against it and not let the throw escape into a React effect.
    private addStreamToPeer(socketId: string, stream: MediaStream): void {
        const peer = this.peers.get(socketId);
        if (!peer || peer.destroyed) return;

        const track = stream.getAudioTracks()[0];
        if (!track) {
            console.warn(
                "[multiplayer] local stream has no audio track, skipping attach for",
                socketId
            );
            return;
        }

        try {
            peer.addStream(stream);
            this.localStreamAttachments.set(socketId, {
                senderStream: stream,
                track,
            });
        } catch (error) {
            console.error(
                "[multiplayer] failed to attach local stream to",
                socketId,
                error
            );
        }
    }

    destroy(socketId: string): void {
        this.clearConnectTimeout(socketId);
        this.peers.get(socketId)?.destroy();
        this.peers.delete(socketId);
        this.localStreamAttachments.delete(socketId);
    }

    destroyAll(): void {
        this.peers.forEach((peer) => peer.destroy());
        this.peers.clear();
        this.localStreamAttachments.clear();
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

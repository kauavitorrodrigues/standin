import Peer from "simple-peer";
import { ICE_SERVERS } from "../consts/ice-servers";

export type PeerConnectionEvents = {
    onSignal: (targetSocketId: string, signal: Peer.SignalData) => void;
    onPeerConnected: (socketId: string) => void;
    onPeerData: (socketId: string, data: unknown) => void;
    onPeerClosed: (socketId: string) => void;
};

const textDecoder = new TextDecoder();

// One instance per Space session, created and destroyed alongside it, not a
// singleton: the set of peers only makes sense for the Space currently
// joined.
export class PeerConnectionManager {
    private readonly peers = new Map<string, Peer.Instance>();
    private readonly events: PeerConnectionEvents;

    constructor(events: PeerConnectionEvents) {
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
        });

        peer.on("signal", (signal) => {
            this.events.onSignal(targetSocketId, signal);
        });

        peer.on("connect", () => {
            this.events.onPeerConnected(targetSocketId);
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
            this.peers.delete(targetSocketId);
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

    send(payload: unknown): void {
        const message = JSON.stringify(payload);
        this.peers.forEach((peer) => {
            if (peer.connected) peer.send(message);
        });
    }

    destroy(socketId: string): void {
        this.peers.get(socketId)?.destroy();
        this.peers.delete(socketId);
    }

    destroyAll(): void {
        this.peers.forEach((peer) => peer.destroy());
        this.peers.clear();
    }
}

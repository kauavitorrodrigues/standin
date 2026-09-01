import { useEffect, useRef, useState } from "react";
import type { Organization, Space, User } from "@standin/contracts";
import type { SignalData } from "simple-peer";
import { socket } from "../socket";
import {
    PeerConnectionManager,
    type PeerConnectionEvents,
} from "../lib/PeerConnectionManager";
import { useSocketEvent } from "./useSocketEvent";

export type UseSpaceConnectionOptions = {
    organizationId: Organization["id"];
    spaceId: Space["id"];
    userId: User["id"];
};

const JOIN_TIMEOUT_MS = 5000;

const addPeerId = (peerIds: string[], socketId: string): string[] =>
    peerIds.includes(socketId) ? peerIds : [...peerIds, socketId];

const removePeerId = (peerIds: string[], socketId: string): string[] =>
    peerIds.filter((id) => id !== socketId);

// Orchestrates the join -> peer discovery -> WebRTC handshake cycle
// described in the multiplayer spec: connects the socket, joins the space,
// and, for every peer that's already there vs. one that joins later,
// applies the initiator rule so both sides don't race to start the same
// connection. No rendering here yet, just the connections themselves.
export function useSpaceConnection({
    organizationId,
    spaceId,
    userId,
}: UseSpaceConnectionOptions) {
    const [connectedPeerIds, setConnectedPeerIds] = useState<string[]>([]);

    // Re-created every render and stashed in a ref (read only by the
    // manager's callbacks below) so a future callback that closes over a
    // changing prop doesn't get pinned to whatever it was on first render.
    const eventsRef = useRef<PeerConnectionEvents | null>(null);
    eventsRef.current = {
        onSignal: (targetSocketId, signal) => {
            socket.emit("webrtc:signal", { targetSocketId, signal });
        },
        onPeerConnected: (socketId) => {
            setConnectedPeerIds((peerIds) => addPeerId(peerIds, socketId));
        },
        onPeerClosed: (socketId) => {
            setConnectedPeerIds((peerIds) => removePeerId(peerIds, socketId));
        },
        onPeerData: (socketId, data) => {
            if (import.meta.env.DEV) {
                console.log("[multiplayer] data from", socketId, data);
            }
        },
    };

    // Lazy useState initializer instead of a ref: refs can't be read during
    // render, and this needs to be constructed exactly once per mount.
    const [manager] = useState(
        () =>
            new PeerConnectionManager({
                onSignal: (id, signal) => eventsRef.current?.onSignal(id, signal),
                onPeerConnected: (id) => eventsRef.current?.onPeerConnected(id),
                onPeerClosed: (id) => eventsRef.current?.onPeerClosed(id),
                onPeerData: (id, data) => eventsRef.current?.onPeerData(id, data),
            })
    );

    useSocketEvent("space:joined", ({ peers }) => {
        // A dropped-then-reconnected socket re-emits space:join (see the
        // "connect" handler below), so this can fire more than once per
        // mount. Treat every arrival as the start of a fresh session: the
        // previous peers are keyed by socket ids that no longer exist on
        // the server once the socket reconnects with a new id.
        manager.destroyAll();
        setConnectedPeerIds([]);
        peers.forEach((peer) => {
            manager.createConnection(peer.socketId, true);
        });
    });

    useSocketEvent("space:peer-joined", (peer) => {
        manager.createConnection(peer.socketId, false);
    });

    useSocketEvent("webrtc:signal", ({ fromSocketId, signal }) => {
        // The server relays this opaquely by design (it never inspects
        // WebRTC payloads); PeerConnectionManager.handleSignal validates it
        // defensively before handing it to simple-peer.
        manager.handleSignal(fromSocketId, signal as SignalData);
    });

    useSocketEvent("space:peer-left", ({ socketId }) => {
        manager.destroy(socketId);
        setConnectedPeerIds((peerIds) => removePeerId(peerIds, socketId));
    });

    useEffect(() => {
        // Joining on "connect" (rather than right after calling connect())
        // also re-joins automatically if the socket ever reconnects after a
        // drop, not just on the initial handshake.
        const onConnect = () => {
            socket.emit("space:join", { organizationId, spaceId, userId });
        };

        const joinTimeout = setTimeout(() => {
            console.warn(
                "[multiplayer] space:join wasn't acknowledged within",
                JOIN_TIMEOUT_MS,
                "ms - the space may not exist or you may not have access to it"
            );
        }, JOIN_TIMEOUT_MS);
        const onJoined = () => clearTimeout(joinTimeout);

        socket.on("connect", onConnect);
        socket.once("space:joined", onJoined);

        // connect() is a no-op (and never re-fires "connect") if the shared
        // socket singleton is already connected, e.g. from a previous
        // mount that hasn't fully torn down yet.
        if (socket.connected) onConnect();
        else socket.connect();

        return () => {
            clearTimeout(joinTimeout);
            socket.off("connect", onConnect);
            socket.off("space:joined", onJoined);
            manager.destroyAll();
            setConnectedPeerIds([]);
            socket.disconnect();
        };
    }, [manager, organizationId, spaceId, userId]);

    return { connectedPeerIds };
}

import { useEffect, useRef, useState } from "react";
import type { Organization, Space, User } from "@standin/contracts";
import type { SignalData } from "simple-peer";
import type Phaser from "phaser";
import { socket } from "../socket";
import {
    PeerConnectionManager,
    type PeerConnectionEvents,
} from "../lib/PeerConnectionManager";
import { isPlayerPosition } from "../utils/isPlayerPosition";
import { getMapScene } from "@/features/game/utils/map";
import { SCENE_EVENTS } from "@/features/game/consts/scene-keys";
import { useSocketEvent } from "./useSocketEvent";

export type UseSpaceConnectionOptions = {
    organizationId: Organization["id"];
    spaceId: Space["id"];
    userId: User["id"];
    game: Phaser.Game | null;
};

const JOIN_TIMEOUT_MS = 5000;

const addPeerId = (peerIds: string[], socketId: string): string[] =>
    peerIds.includes(socketId) ? peerIds : [...peerIds, socketId];

const removePeerId = (peerIds: string[], socketId: string): string[] =>
    peerIds.filter((id) => id !== socketId);

// Orchestrates the join -> peer discovery -> WebRTC handshake cycle
// described in the multiplayer spec, and drives the MapScene from it:
// connects the socket, joins the space, and, for every peer that's already
// there vs. one that joins later, applies the initiator rule so both sides
// don't race to start the same connection. Every peer discovered here also
// gets a RemoteAvatar spawned/moved/removed in the running scene (a no-op
// while the scene isn't mounted yet, e.g. before the game engine finishes
// its first render).
export function useSpaceConnection({
    organizationId,
    spaceId,
    userId,
    game,
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
            // Covers both a real space:peer-left and a purely local failure
            // (e.g. PeerConnectionManager's connect timeout): either way,
            // nothing is arriving from this peer anymore, so its avatar
            // shouldn't sit there frozen. Redundant with the
            // space:peer-left handler's own removeRemoteAvatar call when
            // both fire for the same departure; MapScene.removeRemoteAvatar
            // is a no-op for an id it doesn't have.
            (game ? getMapScene(game) : null)?.removeRemoteAvatar(socketId);
        },
        onPeerData: (socketId, data) => {
            if (!isPlayerPosition(data)) {
                if (import.meta.env.DEV) {
                    console.warn(
                        "[multiplayer] malformed position from",
                        socketId,
                        data
                    );
                }
                return;
            }

            (game ? getMapScene(game) : null)?.applyRemotePosition(
                socketId,
                data
            );
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

        const scene = game ? getMapScene(game) : null;
        scene?.clearRemoteAvatars();
        peers.forEach((peer) => {
            manager.createConnection(peer.socketId, true);
            scene?.spawnRemoteAvatar(peer.socketId);
        });
    });

    useSocketEvent("space:peer-joined", (peer) => {
        manager.createConnection(peer.socketId, false);
        (game ? getMapScene(game) : null)?.spawnRemoteAvatar(peer.socketId);
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
        (game ? getMapScene(game) : null)?.removeRemoteAvatar(socketId);
    });

    // Separate from the connection effect below on purpose: this only wires
    // the scene up to the already-live manager, it must not disconnect or
    // rejoin the space when the game engine mounts after the socket already
    // connected (the scene is created after the first render, so `game`
    // starts null and flips to an instance shortly after). Listening on
    // `game.events` (rather than calling getMapScene(game) once here) avoids
    // a race with Phaser's own async scene boot: `game.scene.add(..., true)`
    // doesn't create the MapScene instance synchronously, so `game` being
    // non-null is no guarantee the scene already exists - by the time this
    // effect's dependencies change again (they don't, since `game`/`manager`
    // are both stable once set), the window to retry would already be gone.
    useEffect(() => {
        if (!game) return;

        const applyBroadcaster = () => {
            getMapScene(game)?.setPositionBroadcaster((state) =>
                manager.broadcastPosition(state)
            );
        };

        applyBroadcaster();
        game.events.on(SCENE_EVENTS.MAP_READY, applyBroadcaster);

        return () => {
            game.events.off(SCENE_EVENTS.MAP_READY, applyBroadcaster);
            getMapScene(game)?.setPositionBroadcaster(null);
        };
    }, [game, manager]);

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

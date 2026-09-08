import { useCallback, useEffect, useRef, useState } from "react";
import {
    PEER_MESSAGE_TYPES,
    type Organization,
    type PeerChatPayload,
    type PeerConfirmPayload,
    type PeerDeletePayload,
    type PeerEditPayload,
    type PeerReactionPayload,
    type PeerTypingPayload,
    type Space,
    type User,
} from "@standin/contracts";
import type Phaser from "phaser";
import { socket } from "../socket";
import type { SignalData } from "simple-peer";
import { useSocketEvent } from "./useSocketEvent";
import { JOIN_TIMEOUT_MS } from "../consts/connection";
import { getMapScene } from "@/features/game/utils/map";
import { SCENE_EVENTS } from "@/features/game/consts/scene-keys";
import { PeerConnectionManager } from "../lib/PeerConnectionManager";
import { RemoteAudioManager } from "../lib/RemoteAudioManager";
import { SpeakingDetector } from "../lib/SpeakingDetector";
import {
    addPeerId,
    getClaimedUserId,
    parsePeerMessage,
    removePeerId,
} from "../utils/peer";
import { useLocalAudioStream } from "@/features/media-devices/hooks/useLocalAudioStream";
import {
    getPreferredDeviceId,
    subscribeToPreferredDeviceId,
} from "@/features/media-devices/lib/mediaDevicePreferences";

export type UseSpaceConnectionOptions = {
    organizationId: Organization["id"];
    spaceId: Space["id"];
    userId: User["id"];
    game: Phaser.Game | null;
    onChatMessage?: (socketId: string, payload: PeerChatPayload) => void;
    onTyping?: (socketId: string, payload: PeerTypingPayload) => void;
    onReaction?: (socketId: string, payload: PeerReactionPayload) => void;
    onEdit?: (socketId: string, payload: PeerEditPayload) => void;
    onDelete?: (socketId: string, payload: PeerDeletePayload) => void;
    onConfirm?: (socketId: string, payload: PeerConfirmPayload) => void;
};

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
    onChatMessage,
    onTyping,
    onReaction,
    onEdit,
    onDelete,
    onConfirm,
}: UseSpaceConnectionOptions) {
    const [connectedPeerIds, setConnectedPeerIds] = useState<string[]>([]);

    const {
        stream: localStream,
        error: localAudioError,
        setProximityGate,
    } = useLocalAudioStream();

    // Raw ("is the mic/peer's stream actually detecting speech") state,
    // kept apart from whether anyone is currently in range: the ring only
    // ever reflects the AND of both, but each can change independently
    // (SpeakingDetector fires on its own cadence, proximity on MapScene's
    // throttled update()).
    const localSpeakingRawRef = useRef(false);
    const anyPeerAudibleRef = useRef(false);

    const syncLocalSpeakingRing = useCallback(() => {
        (game ? getMapScene(game) : null)?.player?.setSpeaking(
            localSpeakingRawRef.current && anyPeerAudibleRef.current
        );
    }, [game]);

    // The server is the source of truth for which userId owns each
    // socketId (from space:joined/space:peer-joined). Every peer payload
    // that claims to speak for a userId is checked against this map before
    // it reaches app state, so one member of the space can't impersonate
    // another by putting someone else's id in a chat/edit/delete/reaction
    // payload.
    const peerUserIdsRef = useRef<Record<string, string>>({});

    // Lazy useState initializer instead of a ref: refs can't be read during
    // render, and this needs to be constructed exactly once per mount. Given
    // a harmless placeholder for events. The real handlers (which close over
    // props/state that change every render) are wired in below, via
    // manager.setEvents(), from an effect instead of the constructor.
    const [manager] = useState(
        () =>
            new PeerConnectionManager({
                onSignal: () => {},
                onPeerConnected: () => {},
                onPeerClosed: () => {},
                onPeerData: () => {},
                onRemoteStream: () => {},
            })
    );

    // One RemoteAudioManager per Space session, mirroring `manager` above.
    const [remoteAudioManager] = useState(() => new RemoteAudioManager());

    // One SpeakingDetector per connected peer's remote stream, keyed by
    // socketId. Kept in a ref, not state, since these are imperative
    // resources (AudioContext/rAF loop), not something render output
    // depends on.
    const remoteSpeakingDetectorsRef = useRef<Map<string, SpeakingDetector>>(
        new Map()
    );

    // Re-registered every render so a callback that closes over a changing
    // prop doesn't get pinned to whatever it was on first render. Done via
    // manager.setEvents() from an effect, not during the render body itself,
    // since this is a side effect (mutating the manager), not something the
    // render output depends on.
    useEffect(() => {
        manager.setEvents({
            onSignal: (targetSocketId, signal) => {
                socket.emit("webrtc:signal", { targetSocketId, signal });
            },
            onPeerConnected: (socketId) => {
                setConnectedPeerIds((ids) => addPeerId(ids, socketId));
            },
            onPeerClosed: (socketId) => {
                setConnectedPeerIds((ids) => removePeerId(ids, socketId));
                // Covers both a real space:peer-left and a purely local
                // failure (e.g. PeerConnectionManager's connect timeout):
                // either way, nothing is arriving from this peer anymore, so
                // its avatar shouldn't sit there frozen. Redundant with the
                // space:peer-left handler's own removeRemoteAvatar call when
                // both fire for the same departure; MapScene.removeRemoteAvatar
                // is a no-op for an id it doesn't have.
                (game ? getMapScene(game) : null)?.removeRemoteAvatar(socketId);
                remoteAudioManager.remove(socketId);
                remoteSpeakingDetectorsRef.current.get(socketId)?.stop();
                remoteSpeakingDetectorsRef.current.delete(socketId);
            },
            onRemoteStream: (socketId, stream) => {
                remoteAudioManager.attach(socketId, stream);

                remoteSpeakingDetectorsRef.current.get(socketId)?.stop();
                const detector = new SpeakingDetector({
                    onSpeakingChange: (isSpeaking) => {
                        (game ? getMapScene(game) : null)?.setRemoteSpeaking(
                            socketId,
                            isSpeaking
                        );
                    },
                });
                detector.start(stream);
                remoteSpeakingDetectorsRef.current.set(socketId, detector);
            },
            onPeerData: (socketId, data) => {
                const message = parsePeerMessage(data);
                if (!message) {
                    if (import.meta.env.DEV) {
                        console.warn(
                            "[multiplayer] malformed peer message from",
                            socketId,
                            data
                        );
                    }
                    return;
                }

                if (message.type !== PEER_MESSAGE_TYPES.POSITION) {
                    const claimedUserId = getClaimedUserId(message);
                    const knownUserId = peerUserIdsRef.current[socketId];

                    if (claimedUserId !== knownUserId) {
                        if (import.meta.env.DEV) {
                            console.warn(
                                "[multiplayer] dropped",
                                message.type,
                                "from",
                                socketId,
                                "claiming to be",
                                claimedUserId,
                                "but the server knows it as",
                                knownUserId
                            );
                        }
                        return;
                    }
                }

                switch (message.type) {
                case PEER_MESSAGE_TYPES.POSITION:
                    (game ? getMapScene(game) : null)?.applyRemotePosition(
                        socketId,
                        message.payload
                    );
                    return;
                case PEER_MESSAGE_TYPES.CHAT:
                    onChatMessage?.(socketId, message.payload);
                    return;
                case PEER_MESSAGE_TYPES.TYPING:
                    onTyping?.(socketId, message.payload);
                    return;
                case PEER_MESSAGE_TYPES.REACTION:
                    onReaction?.(socketId, message.payload);
                    return;
                case PEER_MESSAGE_TYPES.EDIT:
                    onEdit?.(socketId, message.payload);
                    return;
                case PEER_MESSAGE_TYPES.DELETE:
                    onDelete?.(socketId, message.payload);
                    return;
                case PEER_MESSAGE_TYPES.CONFIRM:
                    onConfirm?.(socketId, message.payload);
                    return;
                }
            },
        });
    });

    // The manager is the single source of truth for the outgoing stream
    // (see PeerConnectionManager.setLocalStream): this both attaches it to
    // peers that connected before it became available, and reconciles
    // already-attached peers (via replaceTrack) when it changes later, e.g.
    // the input device was switched after the mesh was already up.
    useEffect(() => {
        manager.setLocalStream(localStream);
    }, [localStream, manager]);

    // Mirrors the speaker device preference onto every remote <audio>
    // element, live: useMediaDeviceControl (a separate hook instance, owning
    // the device picker) has no direct handle on remoteAudioManager.
    useEffect(() => {
        remoteAudioManager.setSinkId(getPreferredDeviceId("speaker"));
        return subscribeToPreferredDeviceId("speaker", (deviceId) => {
            remoteAudioManager.setSinkId(deviceId);
        });
    }, [remoteAudioManager]);

    // Local counterpart to the per-peer SpeakingDetector above: this client
    // seeing its own avatar "speak", driven by the same local stream
    // useLocalAudioStream captures. Gated by anyPeerAudibleRef (see
    // syncLocalSpeakingRing) so it doesn't light up while talking to no one
    // within range.
    useEffect(() => {
        if (!localStream) return;

        const detector = new SpeakingDetector({
            onSpeakingChange: (isSpeaking) => {
                localSpeakingRawRef.current = isSpeaking;
                syncLocalSpeakingRing();
            },
        });
        detector.start(localStream);

        return () => detector.stop();
    }, [localStream, syncLocalSpeakingRing]);

    useSocketEvent("space:joined", ({ peers }) => {
        // A dropped-then-reconnected socket re-emits space:join (see the
        // "connect" handler below), so this can fire more than once per
        // mount. Treat every arrival as the start of a fresh session: the
        // previous peers are keyed by socket ids that no longer exist on
        // the server once the socket reconnects with a new id.
        manager.destroyAll();
        setConnectedPeerIds([]);

        peerUserIdsRef.current = Object.fromEntries(
            peers.map((peer) => [peer.socketId, peer.userId])
        );

        const scene = game ? getMapScene(game) : null;
        scene?.clearRemoteAvatars();
        peers.forEach((peer) => {
            manager.createConnection(peer.socketId, true);
            scene?.spawnRemoteAvatar(peer.socketId);
        });
    });

    useSocketEvent("space:peer-joined", (peer) => {
        peerUserIdsRef.current[peer.socketId] = peer.userId;
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
        delete peerUserIdsRef.current[socketId];
        manager.destroy(socketId);
        setConnectedPeerIds((peerIds) => removePeerId(peerIds, socketId));
        (game ? getMapScene(game) : null)?.removeRemoteAvatar(socketId);
        remoteAudioManager.remove(socketId);
        remoteSpeakingDetectorsRef.current.get(socketId)?.stop();
        remoteSpeakingDetectorsRef.current.delete(socketId);
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
            const scene = getMapScene(game);
            scene?.setPositionBroadcaster((state) =>
                manager.broadcastPosition(state)
            );
            scene?.setVolumeUpdater((socketId, volume) =>
                remoteAudioManager.setVolume(socketId, volume)
            );
            // No one within range: gate the outgoing mic track (on top of
            // the user's own mute toggle) and re-check the local speaking
            // ring, which shouldn't stay lit just because someone was
            // nearby a moment ago.
            scene?.setProximityListener((anyPeerAudible) => {
                anyPeerAudibleRef.current = anyPeerAudible;
                setProximityGate(anyPeerAudible);
                syncLocalSpeakingRing();
            });
        };

        applyBroadcaster();
        game.events.on(SCENE_EVENTS.MAP_READY, applyBroadcaster);

        return () => {
            game.events.off(SCENE_EVENTS.MAP_READY, applyBroadcaster);
            const scene = getMapScene(game);
            scene?.setPositionBroadcaster(null);
            scene?.setVolumeUpdater(null);
            scene?.setProximityListener(null);
        };
    }, [
        game,
        manager,
        remoteAudioManager,
        setProximityGate,
        syncLocalSpeakingRing,
    ]);

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

        // Captured once per effect run (not read from the ref inside the
        // cleanup below) since the ref's underlying Map is only ever
        // replaced together with this same effect re-running.
        const speakingDetectors = remoteSpeakingDetectorsRef.current;

        return () => {
            clearTimeout(joinTimeout);
            socket.off("connect", onConnect);
            socket.off("space:joined", onJoined);
            manager.destroyAll();
            setConnectedPeerIds([]);
            // Explicit teardown rather than relying on manager.destroyAll()
            // to indirectly trigger it (each peer's "close" event happens
            // to route through onPeerClosed, which happens to clean these
            // up too): cleanup of resources this hook owns shouldn't depend
            // on another subsystem's event wiring to run.
            speakingDetectors.forEach((detector) => detector.stop());
            speakingDetectors.clear();
            remoteAudioManager.removeAll();
            socket.disconnect();
        };
    }, [manager, remoteAudioManager, organizationId, spaceId, userId]);

    const broadcastChatMessage = useCallback(
        (payload: PeerChatPayload) => manager.broadcastChatMessage(payload),
        [manager]
    );
    const broadcastTyping = useCallback(
        (payload: PeerTypingPayload) => manager.broadcastTyping(payload),
        [manager]
    );
    const broadcastReaction = useCallback(
        (payload: PeerReactionPayload) => manager.broadcastReaction(payload),
        [manager]
    );
    const broadcastEdit = useCallback(
        (payload: PeerEditPayload) => manager.broadcastEdit(payload),
        [manager]
    );
    const broadcastDelete = useCallback(
        (payload: PeerDeletePayload) => manager.broadcastDelete(payload),
        [manager]
    );
    const broadcastConfirm = useCallback(
        (payload: PeerConfirmPayload) => manager.broadcastConfirm(payload),
        [manager]
    );

    return {
        connectedPeerIds,
        localAudioError,
        broadcastChatMessage,
        broadcastTyping,
        broadcastReaction,
        broadcastEdit,
        broadcastDelete,
        broadcastConfirm,
    };
}

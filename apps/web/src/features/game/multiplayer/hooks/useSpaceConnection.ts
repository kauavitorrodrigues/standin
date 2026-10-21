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
import { useQueryClient } from "@tanstack/react-query";
import type Phaser from "phaser";
import { socket } from "../socket";
import { useSocketEvent } from "./useSocketEvent";
import { JOIN_TIMEOUT_MS } from "../consts/connection";
import { getMapScene } from "@/features/game/utils/map";
import { EmoteSender } from "@/features/game/lib/EmoteSender";
import { SCENE_EVENTS } from "@/features/game/consts/scene-keys";
import { PeerConnectionManager } from "../lib/PeerConnectionManager";
import { RemoteAudioManager } from "../lib/RemoteAudioManager";
import { SpeakingDetector } from "../lib/SpeakingDetector";
import {
    addPeerId,
    isMessageFromKnownSender,
    parsePeerMessage,
    removePeerId,
} from "../utils/peer";
import { applyNameChange } from "@/features/game/multiplayer/utils/applyNameChange";
import { applyProfilePictureChange } from "@/features/game/multiplayer/utils/applyProfilePictureChange";
import { invalidateProfilePictureQueries } from "@/features/users/utils/invalidateProfilePictureQueries";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";
import { MY_AVATAR_QUERY_KEY } from "@/features/avatar/consts/editor/queryKeys";
import { useMicEnabled } from "@/features/media-devices/hooks/useMicEnabled";
import { useLocalAudioStream } from "@/features/media-devices/hooks/useLocalAudioStream";
import { useLocalCameraStream } from "@/features/media-devices/hooks/useLocalCameraStream";
import { useLocalScreenShare } from "@/features/media-devices/hooks/useLocalScreenShare";
import { useOutputVolumePreference } from "@/features/media-devices/hooks/useOutputVolumePreference";
import { useIceServers } from "./useIceServers";
import { useRemoteVideos } from "./useRemoteVideos";
import { useSpeakingUsers } from "./useSpeakingUsers";
import { MEDIA_SLOTS, type PeerSignal } from "../types/transport";
import { getMaxVideoPeers } from "@/features/settings/performance/lib/performanceValues";
import { performanceSettingsPreference } from "@/features/settings/performance/lib/performanceSettingsPreferences";
import { getPeerMediaPolicies } from "../utils/mediaPolicy";
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
    const queryClient = useQueryClient();
    const [connectedPeerIds, setConnectedPeerIds] = useState<string[]>([]);

    const {
        stream: localStream,
        error: localAudioError,
        setProximityGate,
    } = useLocalAudioStream();
    const { stream: localCameraStream, error: localCameraError } =
        useLocalCameraStream();
    const screenShare = useLocalScreenShare();
    // Users currently close enough to receive the local video, sorted so the
    // list is stable between ticks. Drives the stage (everyone nearby is
    // shown there, with an avatar until they turn a camera on) and whether
    // the "share screen" button is offered at all.
    const [nearbyUserIds, setNearbyUserIds] = useState<string[]>([]);

    const iceServersQuery = useIceServers();
    // A failed request must not block joining: without ICE servers, peers
    // still connect over direct candidates.
    const iceReady = iceServersQuery.isSuccess || iceServersQuery.isError;
    // Read from a ref inside the join effect so a background refetch of the
    // list (new credentials) does not tear the whole session down and rejoin.
    // Declared before the join effect on purpose: effects of one commit run
    // in order, so the ref is already current when that effect reads it.
    const iceServersRef = useRef<RTCIceServer[]>([]);
    const iceServers = iceServersQuery.data;
    useEffect(() => {
        iceServersRef.current = iceServers ?? [];
    }, [iceServers]);

    // Raw ("is the mic actually detecting speech") state of the local user,
    // kept apart from whether anyone is currently in range: the user only
    // counts as speaking when both are true, but each can change
    // independently (SpeakingDetector fires on its own cadence, proximity on
    // MapScene's throttled update()).
    const localSpeakingRawRef = useRef(false);
    const anyPeerAudibleRef = useRef(false);

    // Who is speaking, for the interface around the game. The avatars in the
    // game do not show it.
    const { speakingUserIds, setUserSpeaking, clearSpeakingUsers } =
        useSpeakingUsers();

    const syncLocalSpeaking = useCallback(() => {
        setUserSpeaking(
            userId,
            localSpeakingRawRef.current && anyPeerAudibleRef.current
        );
    }, [setUserSpeaking, userId]);

    // The server is the source of truth for which userId owns each
    // socketId (from space:joined/space:peer-joined). Every peer payload
    // that claims to speak for a userId is checked against this map before
    // it reaches app state, so one member of the space can't impersonate
    // another by putting someone else's id in a chat/edit/delete/reaction
    // payload.
    const peerUserIdsRef = useRef<Record<string, string>>({});
    // Same data as the ref above, as state, so the UI can show who is here.
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([userId]);
    const syncOnlineUserIds = () =>
        setOnlineUserIds([
            ...new Set([userId, ...Object.values(peerUserIdsRef.current)]),
        ]);

    const getPeerUserId = useCallback(
        (socketId: string) => peerUserIdsRef.current[socketId],
        []
    );
    // A peer that leaves, or whose link closes, stops speaking.
    const stopSpeakingOf = useCallback(
        (socketId: string) => {
            const peerUserId = peerUserIdsRef.current[socketId];
            if (peerUserId) setUserSpeaking(peerUserId, false);
        },
        [setUserSpeaking]
    );
    const {
        remoteVideos,
        addTrack: addRemoteVideoTrack,
        setState: setRemoteMediaState,
        removePeer: removeRemoteVideoPeer,
        clear: clearRemoteVideos,
    } = useRemoteVideos(getPeerUserId);

    const [mutedUserIds, setMutedUserIds] = useState<ReadonlySet<string>>(
        () => new Set()
    );
    const setRemoteMicMuted = useCallback(
        (remoteUserId: string, isMuted: boolean) =>
            setMutedUserIds((previous) => {
                if (previous.has(remoteUserId) === isMuted) return previous;

                const next = new Set(previous);
                if (isMuted) next.add(remoteUserId);
                else next.delete(remoteUserId);
                return next;
            }),
        []
    );

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
                onRemoteTrack: () => {},
            })
    );

    // Keeps the manager on the freshest credentials as the list is refetched:
    // links created later use them, and so do the ICE restarts of links that
    // already exist (see PeerLink's getIceServers).
    useEffect(() => {
        manager.setIceServers(iceServers ?? []);
    }, [manager, iceServers]);

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
                stopSpeakingOf(socketId);
                remoteSpeakingDetectorsRef.current.get(socketId)?.stop();
                remoteSpeakingDetectorsRef.current.delete(socketId);
                removeRemoteVideoPeer(socketId);
            },
            onRemoteTrack: (socketId, remote) => {
                // Video is routed by the stream id the sender announced, see
                // useRemoteVideos. Only audio continues below.
                if (remote.track.kind !== "audio") {
                    addRemoteVideoTrack(socketId, remote);
                    return;
                }

                const stream = new MediaStream([remote.track]);
                remoteAudioManager.attach(socketId, stream);

                remoteSpeakingDetectorsRef.current.get(socketId)?.stop();
                const detector = new SpeakingDetector({
                    onSpeakingChange: (isSpeaking) => {
                        const peerUserId = peerUserIdsRef.current[socketId];
                        if (peerUserId) setUserSpeaking(peerUserId, isSpeaking);
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

                const knownUserId = peerUserIdsRef.current[socketId];
                if (!isMessageFromKnownSender(message, knownUserId)) {
                    if (import.meta.env.DEV) {
                        console.warn(
                            "[multiplayer] dropped",
                            message.type,
                            "from",
                            socketId,
                            "which the server knows as",
                            knownUserId
                        );
                    }
                    return;
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
                    case PEER_MESSAGE_TYPES.EMOTE:
                        (game ? getMapScene(game) : null)?.applyRemoteEmote(
                            socketId,
                            message.payload
                        );
                        return;
                    case PEER_MESSAGE_TYPES.NEARBY_MESSAGE:
                        (
                            game ? getMapScene(game) : null
                        )?.applyRemoteNearbyMessage(socketId, message.payload);
                        return;
                    case PEER_MESSAGE_TYPES.NEARBY_TYPING:
                        (
                            game ? getMapScene(game) : null
                        )?.applyRemoteNearbyTyping(socketId, message.payload);
                        return;
                    case PEER_MESSAGE_TYPES.MEDIA_STATE:
                        setRemoteMicMuted(
                            message.payload.userId,
                            message.payload.isMicMuted
                        );
                        setRemoteMediaState(socketId, {
                            cameraStreamId: message.payload.cameraStreamId,
                            screenStreamId: message.payload.screenStreamId,
                        });
                        return;
                }
            },
        });
    });

    // The manager is the single source of truth for what is sent (see
    // PeerConnectionManager.setLocalTrack): each track is attached to, or
    // withheld from, every peer according to that peer's own range, and a
    // changed track (the input device was switched, the camera or a screen
    // share started or stopped) is reconciled against all of them.
    const isMicEnabled = useMicEnabled();
    useEffect(() => {
        manager.setLocalMicMuted(!isMicEnabled);
    }, [isMicEnabled, manager]);

    const localAudioTrack = localStream?.getAudioTracks()[0] ?? null;
    const localCameraTrack = localCameraStream?.getVideoTracks()[0] ?? null;
    const localScreenTrack = screenShare.stream?.getVideoTracks()[0] ?? null;

    useEffect(() => {
        manager.setLocalTrack(MEDIA_SLOTS.AUDIO, localAudioTrack);
    }, [localAudioTrack, manager]);

    useEffect(() => {
        manager.setLocalTrack(MEDIA_SLOTS.CAMERA, localCameraTrack);
    }, [localCameraTrack, manager]);

    useEffect(() => {
        manager.setLocalTrack(MEDIA_SLOTS.SCREEN, localScreenTrack);
    }, [localScreenTrack, manager]);

    // Mirrors the speaker device preference onto every remote <audio>
    // element, live: useMediaDeviceControl (a separate hook instance, owning
    // the device picker) has no direct handle on remoteAudioManager.
    useEffect(() => {
        remoteAudioManager.setSinkId(getPreferredDeviceId("speaker"));
        return subscribeToPreferredDeviceId("speaker", (deviceId) => {
            remoteAudioManager.setSinkId(deviceId);
        });
    }, [remoteAudioManager]);

    // The output volume from the settings, live, on top of the distance
    // volume of every peer.
    const outputVolume = useOutputVolumePreference();
    useEffect(() => {
        remoteAudioManager.setMasterVolume(outputVolume);
    }, [remoteAudioManager, outputVolume]);

    // Local counterpart to the per-peer SpeakingDetector above, driven by the
    // same local stream useLocalAudioStream captures. Gated by
    // anyPeerAudibleRef (see syncLocalSpeaking) so it doesn't count as
    // speaking while talking to no one within range.
    useEffect(() => {
        if (!localStream) return;

        const detector = new SpeakingDetector({
            onSpeakingChange: (isSpeaking) => {
                localSpeakingRawRef.current = isSpeaking;
                syncLocalSpeaking();
            },
        });
        detector.start(localStream);

        return () => detector.stop();
    }, [localStream, syncLocalSpeaking]);

    useSocketEvent("space:joined", ({ peers }) => {
        // A dropped-then-reconnected socket re-emits space:join (see the
        // "connect" handler below), so this can fire more than once per
        // mount. Treat every arrival as the start of a fresh session: the
        // previous peers are keyed by socket ids that no longer exist on
        // the server once the socket reconnects with a new id.
        manager.destroyAll();
        setConnectedPeerIds([]);
        clearRemoteVideos();
        manager.setLocalIdentity({ socketId: socket.id ?? "", userId });
        clearSpeakingUsers();

        peerUserIdsRef.current = Object.fromEntries(
            peers.map((peer) => [peer.socketId, peer.userId])
        );
        syncOnlineUserIds();

        const scene = game ? getMapScene(game) : null;
        scene?.clearRemoteAvatars();
        peers.forEach((peer) => {
            manager.createConnection(peer.socketId, true);
            scene?.spawnRemoteAvatar(
                peer.socketId,
                peer.userId,
                peer.avatarSheetFileId,
                { name: peer.name, profilePictureUrl: peer.profilePictureUrl }
            );
        });
    });

    useSocketEvent("space:peer-joined", (peer) => {
        peerUserIdsRef.current[peer.socketId] = peer.userId;
        syncOnlineUserIds();
        manager.createConnection(peer.socketId, false);
        (game ? getMapScene(game) : null)?.spawnRemoteAvatar(
            peer.socketId,
            peer.userId,
            peer.avatarSheetFileId,
            { name: peer.name, profilePictureUrl: peer.profilePictureUrl }
        );
    });

    // Someone saved or cleared their avatar. The sprite is swapped in the
    // running scene, with no refresh. The local player is also redrawn from the
    // cached avatar (see useLocalAvatarSheet), so the cache is refreshed here
    // for a change made from another tab.
    useSocketEvent("space:avatar-changed", (change) => {
        if (change.userId === userId) {
            queryClient.invalidateQueries({ queryKey: [MY_AVATAR_QUERY_KEY] });
            return;
        }

        (game ? getMapScene(game) : null)?.setRemoteAvatarSheet(
            change.userId,
            change.avatarSheetFileId
        );
    });

    // Someone saved a new name (see applyNameChange).
    useSocketEvent("space:name-changed", (change) => {
        applyNameChange({
            change,
            selfUserId: userId,
            scene: game ? getMapScene(game) : null,
            updateOwnName: (name) =>
                queryClient.setQueryData(
                    getMeQueryOptions().queryKey,
                    (previous) => previous && { ...previous, name }
                ),
        });
    });

    // Someone saved or removed their profile picture (see
    // applyProfilePictureChange).
    useSocketEvent("space:profile-picture-changed", (change) => {
        applyProfilePictureChange({
            change,
            selfUserId: userId,
            ownPictureUrl:
                queryClient.getQueryData(getMeQueryOptions().queryKey)
                    ?.profilePictureUrl ?? null,
            scene: game ? getMapScene(game) : null,
            updateOwnPicture: (profilePictureUrl) =>
                queryClient.setQueryData(
                    getMeQueryOptions().queryKey,
                    (previous) => previous && { ...previous, profilePictureUrl }
                ),
            refreshPictures: () =>
                void invalidateProfilePictureQueries(queryClient),
        });
    });

    useSocketEvent("webrtc:signal", ({ fromSocketId, signal }) => {
        // The server relays this opaquely by design (it never inspects
        // WebRTC payloads); PeerConnectionManager.handleSignal validates it
        // defensively before handing it to the peer link.
        manager.handleSignal(fromSocketId, signal as PeerSignal);
    });

    useSocketEvent("space:peer-left", ({ socketId, userId: peerUserId }) => {
        (game ? getMapScene(game) : null)?.forgetPendingUserName(peerUserId);
        stopSpeakingOf(socketId);
        delete peerUserIdsRef.current[socketId];
        syncOnlineUserIds();
        manager.destroy(socketId);
        setConnectedPeerIds((peerIds) => removePeerId(peerIds, socketId));
        (game ? getMapScene(game) : null)?.removeRemoteAvatar(socketId);
        remoteAudioManager.remove(socketId);
        remoteSpeakingDetectorsRef.current.get(socketId)?.stop();
        remoteSpeakingDetectorsRef.current.delete(socketId);
        removeRemoteVideoPeer(socketId);
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
            scene?.setLocalSocketIdProvider(() => socket.id ?? "");
            scene?.setVolumeUpdater((socketId, volume) =>
                remoteAudioManager.setVolume(socketId, volume)
            );
            // No one within range: gate the outgoing mic track (on top of
            // the user's own mute toggle) and re-check the local speaking
            // state, which shouldn't stay on just because someone was
            // nearby a moment ago.
            scene?.setProximityListener((anyPeerAudible) => {
                anyPeerAudibleRef.current = anyPeerAudible;
                setProximityGate(anyPeerAudible);
                syncLocalSpeaking();
            });
            // Decides, per peer, whether it may receive our audio and video
            // (see getPeerMediaPolicies). The previous set of video
            // receivers is fed back in so the boundary has hysteresis.
            scene?.setPeerDistanceListener((distances) => {
                const policies = getPeerMediaPolicies(
                    distances,
                    manager.getReceivingVideoPeers(),
                    getMaxVideoPeers(performanceSettingsPreference.get())
                );
                manager.setMediaPolicies(policies);

                const nearby = [...manager.getReceivingVideoPeers()]
                    .map(getPeerUserId)
                    .filter((id): id is string => id !== undefined)
                    .sort();
                setNearbyUserIds((previous) =>
                    previous.length === nearby.length &&
                    previous.every((id, index) => id === nearby[index])
                        ? previous
                        : nearby
                );
            });
        };

        applyBroadcaster();
        game.events.on(SCENE_EVENTS.MAP_READY, applyBroadcaster);

        return () => {
            game.events.off(SCENE_EVENTS.MAP_READY, applyBroadcaster);
            const scene = getMapScene(game);
            scene?.setPositionBroadcaster(null);
            scene?.setLocalSocketIdProvider(null);
            scene?.setVolumeUpdater(null);
            scene?.setProximityListener(null);
            scene?.setPeerDistanceListener(null);
        };
    }, [
        game,
        manager,
        remoteAudioManager,
        getPeerUserId,
        setProximityGate,
        syncLocalSpeaking,
    ]);

    useEffect(() => {
        // Waits for the ICE server list (or its failure) so every peer link
        // is created with it from the very first offer.
        if (!iceReady) return;

        manager.setIceServers(iceServersRef.current);

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
    }, [
        manager,
        remoteAudioManager,
        organizationId,
        spaceId,
        userId,
        iceReady,
        clearRemoteVideos,
    ]);

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

    // Clicks in the same emoji are grouped into one event, which is sent to
    // the peers and shown on the local avatar at the same time. The sender is
    // rebuilt when the game appears, so it always finds the scene.
    const emoteSenderRef = useRef<EmoteSender | null>(null);
    useEffect(() => {
        const sender = new EmoteSender((payload) => {
            manager.broadcastEmote(payload);
            const scene = game ? getMapScene(game) : null;
            scene?.playLocalEmote(payload);
        });
        emoteSenderRef.current = sender;

        return () => {
            sender.destroy();
            emoteSenderRef.current = null;
        };
    }, [manager, game]);
    const sendEmote = useCallback(
        (emoji: string) => emoteSenderRef.current?.send(emoji),
        []
    );

    // A nearby message goes to the mesh and is shown at once on the local
    // avatar and in the list, since the mesh never sends it back. The text was
    // already validated by the form that sent it.
    const sendNearbyMessage = useCallback(
        (text: string) => {
            manager.broadcastNearbyMessage({ text });
            const scene = game ? getMapScene(game) : null;
            scene?.playLocalNearbyMessage(text);
        },
        [manager, game]
    );
    const sendNearbyTyping = useCallback(
        (isTyping: boolean) => {
            manager.broadcastNearbyTyping({ isTyping });
            const scene = game ? getMapScene(game) : null;
            scene?.playLocalNearbyTyping(isTyping);
        },
        [manager, game]
    );

    return {
        connectedPeerIds,
        onlineUserIds,
        speakingUserIds,
        localAudioError,
        video: {
            remoteVideos,
            localCameraStream,
            localCameraError,
            nearbyUserIds,
            screenShare,
            mutedUserIds,
        },
        broadcastChatMessage,
        broadcastTyping,
        broadcastReaction,
        broadcastEdit,
        broadcastDelete,
        broadcastConfirm,
        sendEmote,
        sendNearbyMessage,
        sendNearbyTyping,
    };
}

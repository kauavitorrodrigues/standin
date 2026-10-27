import { useCallback, useEffect, useRef, useState } from "react";
import { type SpaceSettings, type Space, type User } from "@standin/contracts";
import { useQueryClient } from "@tanstack/react-query";
import type Phaser from "phaser";
import { socket } from "../socket";
import { useSocketEvent } from "./useSocketEvent";
import { DEFAULT_SPACE_SETTINGS, JOIN_TIMEOUT_MS } from "../consts/connection";
import { getMapScene } from "@/features/game/utils/map";
import { EmoteSender } from "@/features/game/lib/EmoteSender";
import { SpaceChannel, type SpaceChannelTransport } from "../lib/SpaceChannel";
import { SCENE_EVENTS } from "@/features/game/consts/scene-keys";
import { simulateScenario } from "../utils/simulateScenario";
import {
    applySpacePositions,
    createSpacePositionsState,
    drawInSight,
} from "../utils/applySpacePositions";
import { RemoteAudioManager } from "../lib/RemoteAudioManager";
import { SpeakingDetector } from "../lib/SpeakingDetector";
import { applyNameChange } from "@/features/game/multiplayer/utils/applyNameChange";
import { applyProfilePictureChange } from "@/features/game/multiplayer/utils/applyProfilePictureChange";
import { invalidateProfilePictureQueries } from "@/features/users/utils/invalidateProfilePictureQueries";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";
import { MY_AVATAR_QUERY_KEY } from "@/features/avatar/consts/editor/queryKeys";
import { useMicEnabled } from "@/features/media-devices/hooks/useMicEnabled";
import { usePrivacyMode } from "@/features/media-devices/hooks/usePrivacyMode";
import { useLocalAudioStream } from "@/features/media-devices/hooks/useLocalAudioStream";
import { useLocalCameraStream } from "@/features/media-devices/hooks/useLocalCameraStream";
import { useLocalScreenShare } from "@/features/media-devices/hooks/useLocalScreenShare";
import { useOutputVolumePreference } from "@/features/media-devices/hooks/useOutputVolumePreference";
import { useSfuMedia } from "./useSfuMedia";
import type { RemotePrivacy } from "../types/sfuHooks";
import { useSpeakingUsers } from "./useSpeakingUsers";
import { STAGE_MAX_NEARBY_PEERS } from "../consts/video";
import { selectNearbyPeers } from "../utils/nearbyPeers";
import { getProximityRadii } from "../utils/proximityRadii";
import {
    getPreferredDeviceId,
    subscribeToPreferredDeviceId,
} from "@/features/media-devices/lib/mediaDevicePreferences";

export type UseSpaceConnectionOptions = {
    spaceId: Space["id"];
    userId: User["id"];
    game: Phaser.Game | null;
};

// Orchestrates the join and the media session of a stay in a space and drives
// the MapScene from it: connects the socket, joins the space, and starts the
// media session (see useSfuMedia) once the join answers. Every person known
// here also gets a RemoteAvatar spawned/moved/removed in the running scene (a
// no-op while the scene isn't mounted yet, e.g. before the game engine
// finishes its first render).
export function useSpaceConnection({
    spaceId,
    userId,
    game,
}: UseSpaceConnectionOptions) {
    const queryClient = useQueryClient();
    // The settings of the space, from the join and from each save of the owner.
    // Until the join answers, the defaults apply.
    const [settings, setSettings] = useState<SpaceSettings>(
        DEFAULT_SPACE_SETTINGS
    );

    const { proximityPreset } = settings;

    const {
        stream: localStream,
        error: localAudioError,
        setProximityGate,
    } = useLocalAudioStream();
    const screenShare = useLocalScreenShare();
    // Users currently close enough to receive the local video, nearest first. Drives the stage (everyone nearby is
    // shown there, with an avatar until they turn a camera on) and whether
    // the "share screen" button is offered at all.
    const [nearbyUserIds, setNearbyUserIds] = useState<string[]>([]);
    const nearbySocketIdsRef = useRef<ReadonlySet<string>>(new Set());

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
    const { stream: localCameraStream, error: localCameraError } =
        useLocalCameraStream(onlineUserIds.length);
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

    // Who has headphones on or is in focus mode, as the server told it.
    const [remotePrivacy, setRemotePrivacyState] = useState<
        ReadonlyMap<string, RemotePrivacy>
    >(() => new Map());
    const setRemotePrivacy = useCallback(
        (remoteUserId: string, privacy: RemotePrivacy) =>
            setRemotePrivacyState((previous) => {
                const next = new Map(previous);
                if (privacy.headphones || privacy.focus) {
                    next.set(remoteUserId, privacy);
                } else {
                    next.delete(remoteUserId);
                }
                return next;
            }),
        []
    );

    // Positions, emotes, nearby messages and typing go through the server.
    const [channel] = useState(
        () => new SpaceChannel(socket as unknown as SpaceChannelTransport)
    );

    // Who is in the space, by socket id, as the server told it. The avatar of a
    // person is only drawn while they are in sight (see `space:positions`), so
    // what is needed to draw one is kept here for when they come in.
    // What this client knows about the people around it: the roster, the short
    // ids of `space:positions` and who is in sight. It lives apart from the
    // scene, so a message that arrives before the scene is ready is kept.
    const positionsRef = useRef(createSpacePositionsState());

    // One RemoteAudioManager per Space session.
    const [remoteAudioManager] = useState(() => new RemoteAudioManager());

    const getSocketIdOfUser = useCallback(
        (remoteUserId: string) =>
            Object.entries(peerUserIdsRef.current).find(
                ([, id]) => id === remoteUserId
            )?.[0],
        []
    );

    // The microphone, the camera and the screen go to the media server once,
    // and what the server creates for this person is played from here.
    const isMicEnabled = useMicEnabled();
    const isHeadphonesOn = usePrivacyMode("headphones");
    const isFocusModeOn = usePrivacyMode("focus");
    const sfu = useSfuMedia({
        userId,
        remoteAudioManager,
        getSocketIdOfUser,
        localAudioTrack: localStream?.getAudioTracks()[0] ?? null,
        localCameraTrack: localCameraStream?.getVideoTracks()[0] ?? null,
        localScreenTrack: screenShare.stream?.getVideoTracks()[0] ?? null,
        isMicEnabled,
        isHeadphonesOn,
        isFocusModeOn,
        setUserSpeaking,
        setRemoteMicMuted,
        setRemotePrivacy,
    });
    const { beginSession, endSession, rebuildSession } = sfu;

    // Dev only failure harness, not present in production builds:
    // Vite replaces import.meta.env.DEV with false and drops the branch.
    useEffect(() => {
        if (!import.meta.env.DEV) return;

        window.__simulateScenario = (name) =>
            simulateScenario(name, {
                socket,
                media: { rebuildSession },
                reload: () => window.location.reload(),
                setTimeout: (callback, delayMs) =>
                    setTimeout(callback, delayMs),
            });
        return () => {
            delete window.__simulateScenario;
        };
    }, [rebuildSession]);

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

    // The speaking state of the local person, driven by the local stream
    // useLocalAudioStream captures. The others come from the server. Gated by
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

    useSocketEvent("space:settings-changed", ({ settings: changed }) => {
        setSettings(changed);
    });

    useSocketEvent("space:joined", ({ peers, settings: joined }) => {
        setSettings(joined);
        // A dropped-then-reconnected socket re-emits space:join (see the
        // "connect" handler below), so this can fire more than once per
        // mount. Treat every arrival as the start of a fresh session: the
        // previous peers are keyed by socket ids that no longer exist on
        // the server once the socket reconnects with a new id.
        clearSpeakingUsers();

        peerUserIdsRef.current = Object.fromEntries(
            peers.map((peer) => [peer.socketId, peer.userId])
        );
        positionsRef.current = createSpacePositionsState();
        positionsRef.current.roster = new Map(
            peers.map((peer) => [peer.socketId, peer])
        );
        syncOnlineUserIds();
        channel.resetPosition();

        // The avatars come with the positions, as each person gets in sight.
        (game ? getMapScene(game) : null)?.clearRemoteAvatars();
        setMutedUserIds(
            new Set(
                peers.filter((peer) => peer.muted).map((peer) => peer.userId)
            )
        );
        setRemotePrivacyState(new Map());
        peers.forEach((peer) =>
            setRemotePrivacy(peer.userId, {
                headphones: peer.headphones,
                focus: peer.focus,
            })
        );
        beginSession();
    });

    // Draws the people already in sight once there is a scene to draw them in,
    // and again when someone joins: a sighting can come before the scene is
    // ready, or before the roster entry of the person.
    const drawPeopleInSight = useCallback(() => {
        const scene = game ? getMapScene(game) : null;
        if (scene?.isReady()) drawInSight(positionsRef.current, scene);
    }, [game]);

    useEffect(() => {
        if (!game) return;

        drawPeopleInSight();
        game.events.on(SCENE_EVENTS.MAP_READY, drawPeopleInSight);

        return () => {
            game.events.off(SCENE_EVENTS.MAP_READY, drawPeopleInSight);
        };
    }, [game, drawPeopleInSight]);

    useSocketEvent("space:peer-joined", (peer) => {
        peerUserIdsRef.current[peer.socketId] = peer.userId;
        positionsRef.current.roster.set(peer.socketId, peer);
        syncOnlineUserIds();
        setRemoteMicMuted(peer.userId, peer.muted);
        setRemotePrivacy(peer.userId, {
            headphones: peer.headphones,
            focus: peer.focus,
        });
        drawPeopleInSight();
    });

    // What changed around the local avatar since the last tick. Someone who came
    // into sight is drawn at the spot the server gave, someone already drawn
    // glides to the new one, and someone who went out of sight is taken down.
    useSocketEvent("space:positions", (payload) => {
        const scene = game ? getMapScene(game) : null;
        applySpacePositions(
            payload,
            positionsRef.current,
            scene?.isReady() ? scene : null
        );
    });

    useSocketEvent("space:emote", ({ socketId, emoji, count }) => {
        (game ? getMapScene(game) : null)?.applyRemoteEmote(socketId, {
            emoji,
            count,
        });
    });

    useSocketEvent("space:nearby-message", ({ socketId, text }) => {
        (game ? getMapScene(game) : null)?.applyRemoteNearbyMessage(socketId, {
            text,
        });
    });

    useSocketEvent("space:nearby-typing", ({ socketId, isTyping }) => {
        (game ? getMapScene(game) : null)?.applyRemoteNearbyTyping(socketId, {
            isTyping,
        });
    });

    // Someone saved or cleared their avatar. The sprite is swapped in the
    // running scene, with no refresh. The local player is also redrawn from the
    // cached avatar (see useLocalAvatarSheet), so the cache is refreshed here
    // for a change made from another tab.
    useSocketEvent("space:avatar-changed", (change) => {
        positionsRef.current.roster.forEach((peer, socketId) => {
            if (peer.userId !== change.userId) return;
            positionsRef.current.roster.set(socketId, {
                ...peer,
                avatarSheetFileId: change.avatarSheetFileId,
            });
        });
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
        positionsRef.current.roster.forEach((peer, socketId) => {
            if (peer.userId !== change.userId) return;
            positionsRef.current.roster.set(socketId, {
                ...peer,
                name: change.name,
            });
        });
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
        positionsRef.current.roster.forEach((peer, socketId) => {
            if (peer.userId !== change.userId) return;
            positionsRef.current.roster.set(socketId, {
                ...peer,
                profilePictureUrl: change.profilePictureUrl,
            });
        });
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

    useSocketEvent("space:peer-left", ({ socketId, userId: peerUserId }) => {
        (game ? getMapScene(game) : null)?.forgetPendingUserName(peerUserId);
        stopSpeakingOf(socketId);
        delete peerUserIdsRef.current[socketId];
        positionsRef.current.roster.delete(socketId);
        positionsRef.current.inSight.delete(socketId);
        syncOnlineUserIds();
        (game ? getMapScene(game) : null)?.removeRemoteAvatar(socketId);
        remoteAudioManager.remove(socketId);
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
                channel.sendPosition(state)
            );
            scene?.setLocalSocketIdProvider(() => socket.id ?? "");
            scene?.setProximityPreset(proximityPreset);
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
            // The people close enough to show on the stage, nearest first. The
            // server decides on its own who it sends video of.
            scene?.setPeerDistanceListener((distances) => {
                const nearby = selectNearbyPeers(
                    distances,
                    nearbySocketIdsRef.current,
                    STAGE_MAX_NEARBY_PEERS,
                    getProximityRadii(proximityPreset)
                );
                nearbySocketIdsRef.current = new Set(nearby);

                const nearbyUsers = nearby
                    .map(getPeerUserId)
                    .filter((id): id is string => id !== undefined);
                setNearbyUserIds((previous) =>
                    previous.length === nearbyUsers.length &&
                    previous.every((id, index) => id === nearbyUsers[index])
                        ? previous
                        : nearbyUsers
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
        channel,
        remoteAudioManager,
        getPeerUserId,
        setProximityGate,
        syncLocalSpeaking,
        proximityPreset,
    ]);

    useEffect(() => {
        // Joining on "connect" (rather than right after calling connect())
        // also re-joins automatically if the socket ever reconnects after a
        // drop, not just on the initial handshake.
        const onConnect = () => {
            socket.emit("space:join", { spaceId });
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
            endSession();
            remoteAudioManager.removeAll();
            socket.disconnect();
        };
    }, [remoteAudioManager, spaceId, userId, endSession]);

    const sendChatTyping = useCallback(
        (conversationId: string, isTyping: boolean) =>
            channel.sendChatTyping({ conversationId, isTyping }),
        [channel]
    );

    // Clicks in the same emoji are grouped into one event, which is sent to
    // the peers and shown on the local avatar at the same time. The sender is
    // rebuilt when the game appears, so it always finds the scene.
    const emoteSenderRef = useRef<EmoteSender | null>(null);
    useEffect(() => {
        const sender = new EmoteSender((payload) => {
            channel.sendEmote(payload);
            const scene = game ? getMapScene(game) : null;
            scene?.playLocalEmote(payload);
        });
        emoteSenderRef.current = sender;

        return () => {
            sender.destroy();
            emoteSenderRef.current = null;
        };
    }, [channel, game]);
    const sendEmote = useCallback(
        (emoji: string) => emoteSenderRef.current?.send(emoji),
        []
    );

    // A nearby message goes to the server and is shown at once on the local
    // avatar and in the list, since the server never sends it back. The text was
    // already validated by the form that sent it.
    const sendNearbyMessage = useCallback(
        (text: string) => {
            channel.sendNearbyMessage({ text });
            const scene = game ? getMapScene(game) : null;
            scene?.playLocalNearbyMessage(text);
        },
        [channel, game]
    );
    const sendNearbyTyping = useCallback(
        (isTyping: boolean) => {
            channel.sendNearbyTyping({ isTyping });
            const scene = game ? getMapScene(game) : null;
            scene?.playLocalNearbyTyping(isTyping);
        },
        [channel, game]
    );

    return {
        onlineUserIds,
        speakingUserIds,
        localAudioError,
        video: {
            remoteVideos: sfu.remoteVideos,
            setActiveVideoIds: sfu.setActiveVideoIds,
            setFocus: sfu.setFocus,
            setPins: sfu.setPins,
            localCameraStream,
            localCameraError,
            nearbyUserIds,
            screenShare,
            mutedUserIds,
            remotePrivacy,
        },
        sendChatTyping,
        sendEmote,
        sendNearbyMessage,
        sendNearbyTyping,
        isSendNearbyEnabled: settings.enableSendNearbyInMapView,
    };
}

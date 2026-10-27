import { useCallback, useRef } from "react";
import type { UseSfuRemoteMediaOptions } from "../types/sfuHooks";
import type { SfuRemoteTrack } from "../types/sfu";
import { diffSpeakers } from "../utils/diffSpeakers";
import { useRemoteVideos } from "./useRemoteVideos";

/**
 * What the server sends to this person, from the point of view of the
 * interface: video goes to the stage, audio to the audio manager, and the
 * speaking indicators follow the ranking the server reports.
 *
 * Audio is kept under the socket id of the speaker, because that is the key
 * the scene uses to set the volume by distance.
 */
export function useSfuRemoteMedia({
    userId,
    remoteAudioManager,
    getSocketIdOfUser,
    setUserSpeaking,
}: UseSfuRemoteMediaOptions) {
    
    const videos = useRemoteVideos();
    
    const {
        addTrack: addVideoTrack,
        removeConsumer,
        clear: clearVideos,
    } = videos;

    // The socket each audio consumer plays under, to take it down when the
    // server closes the consumer.
    const audioConsumersRef = useRef(new Map<string, string>());
    const speakingRef = useRef<ReadonlySet<string>>(new Set());

    /** Starts playing a stream the server created. */
    const playRemote = useCallback(
        (remote: SfuRemoteTrack) => {
            if (remote.kind === "video") {
                addVideoTrack(remote);
                return;
            }
            if (remote.source !== "mic") return;

            const socketId = getSocketIdOfUser(remote.userId);
            if (!socketId) return;

            audioConsumersRef.current.set(remote.consumerId, socketId);
            remoteAudioManager.attach(
                socketId,
                new MediaStream([remote.track])
            );
        },
        [addVideoTrack, getSocketIdOfUser, remoteAudioManager]
    );

    /** Stops the stream of one consumer. */
    const stopRemote = useCallback(
        (consumerId: string) => {
            removeConsumer(consumerId);
            const socketId = audioConsumersRef.current.get(consumerId);
            if (!socketId) return;

            audioConsumersRef.current.delete(consumerId);
            remoteAudioManager.remove(socketId);
        },
        [remoteAudioManager, removeConsumer]
    );

    /** Stops every remote stream, when the session is rebuilt or ends. */
    const stopAllRemote = useCallback(() => {
        clearVideos();
        audioConsumersRef.current.forEach((socketId) =>
            remoteAudioManager.remove(socketId)
        );
        audioConsumersRef.current.clear();
    }, [clearVideos, remoteAudioManager]);

    /** Applies the list of speakers the server reported. */
    const applySpeakers = useCallback(
        (userIds: readonly string[]) => {
            const { next, started, stopped } = diffSpeakers(
                speakingRef.current,
                userIds,
                userId
            );
            speakingRef.current = next;

            const mark = (id: string, isSpeaking: boolean) => {
                setUserSpeaking(id, isSpeaking);
                const socketId = getSocketIdOfUser(id);
                if (socketId)
                    remoteAudioManager.setSpeaking(socketId, isSpeaking);
            };
            started.forEach((id) => mark(id, true));
            stopped.forEach((id) => mark(id, false));
        },
        [getSocketIdOfUser, remoteAudioManager, setUserSpeaking, userId]
    );

    return {
        remoteVideos: videos.remoteVideos,
        setActiveVideoIds: videos.setActiveVideoIds,
        playRemote,
        stopRemote,
        stopAllRemote,
        applySpeakers,
    };
}

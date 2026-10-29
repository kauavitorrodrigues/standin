import { useCallback, useRef, useState } from "react";
import type { RemoteVideo } from "../types/remoteVideo";
import type { SfuRemoteTrack } from "../types/sfu";
import {
    areRemoteVideosEqual,
    dedupeEntries,
    slotOfSource,
    type RemoteVideoEntry,
} from "../utils/remoteVideo";

/**
 * Keeps the videos the server is sending to this person and turns them into
 * the flat list the UI renders. The source of each consumer tells a camera
 * from a screen, so nothing is announced apart from the stream.
 *
 * `setActiveVideoIds` limits decoding to the videos the stage shows: the
 * others keep their track but have no stream attached.
 */
export function useRemoteVideos() {
    
    const [remoteVideos, setRemoteVideos] = useState<RemoteVideo[]>([]);
    
    const entriesRef = useRef(new Map<string, RemoteVideoEntry>());
    
    // One MediaStream per track, reused across syncs so a React re-render does
    // not hand <video> a new srcObject (which restarts playback).
    const streamsRef = useRef(new Map<string, MediaStream>());
    
    // Ids of the videos the stage is rendering. `null` means all of them
    // (full grid open, or no stage yet).
    // 
    const activeIdsRef = useRef<ReadonlySet<string> | null>(null);

    const sync = useCallback(() => {
        const usedTrackIds = new Set<string>();
        const next = dedupeEntries(entriesRef.current).map((entry) => {
            const id = `${entry.userId}:${entry.slot}`;
            const isActive =
                activeIdsRef.current === null || activeIdsRef.current.has(id);
            const video: RemoteVideo = {
                id,
                userId: entry.userId,
                slot: entry.slot,
                stream: null,
                pauseReason: entry.pauseReason ?? null,
            };
            if (!isActive) return video;

            usedTrackIds.add(entry.track.id);
            const stream =
                streamsRef.current.get(entry.track.id) ??
                new MediaStream([entry.track]);
            streamsRef.current.set(entry.track.id, stream);
            return { ...video, stream };
        });

        streamsRef.current.forEach((_stream, trackId) => {
            if (!usedTrackIds.has(trackId)) streamsRef.current.delete(trackId);
        });
        setRemoteVideos((previous) =>
            areRemoteVideosEqual(previous, next) ? previous : next
        );
    }, []);

    const setActiveVideoIds = useCallback(
        (ids: ReadonlySet<string> | null) => {
            activeIdsRef.current = ids;
            sync();
        },
        [sync]
    );

    const addTrack = useCallback(
        ({ consumerId, userId, source, kind, track }: SfuRemoteTrack) => {
            if (kind !== "video") return;

            entriesRef.current.set(consumerId, {
                userId,
                slot: slotOfSource(source),
                track,
            });
            sync();
        },
        [sync]
    );

    // The server holds a video back for a reason, or lets it play again.
    const setPauseReason = useCallback(
        (consumerId: string, reason: RemoteVideo["pauseReason"]) => {
            const entry = entriesRef.current.get(consumerId);
            if (!entry || (entry.pauseReason ?? null) === reason) return;

            entriesRef.current.set(consumerId, {
                ...entry,
                pauseReason: reason,
            });
            sync();
        },
        [sync]
    );

    const removeConsumer = useCallback(
        (consumerId: string) => {
            if (!entriesRef.current.delete(consumerId)) return;
            sync();
        },
        [sync]
    );

    const clear = useCallback(() => {
        entriesRef.current.clear();
        sync();
    }, [sync]);

    return {
        remoteVideos,
        addTrack,
        removeConsumer,
        setPauseReason,
        clear,
        setActiveVideoIds,
    };
}

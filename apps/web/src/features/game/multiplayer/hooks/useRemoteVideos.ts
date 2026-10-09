import { useCallback, useEffect, useRef, useState } from "react";
import type { RemoteVideo } from "@/features/game/multiplayer/types/remoteVideo";
import {
    areRemoteVideosEqual,
    NO_REMOTE_MEDIA_STATE,
    resolveVideoTracks,
    type RemoteMediaState,
    type RemoteVideoSlot,
} from "../utils/remoteVideo";
import type { RemoteTrack } from "../types/transport";

type PeerMedia = {
    tracksByStreamId: Map<string, MediaStreamTrack>;
    state: RemoteMediaState;
};

const VIDEO_SLOTS: RemoteVideoSlot[] = ["camera", "screen"];

// Keeps the incoming video of every peer and turns it into the flat list the
// UI renders. Two independent facts have to be true before a video shows:
// the peer announced the stream (MEDIA_STATE) and the track itself arrived,
// and they can happen in either order, so both are stored and resolved
// together on every change.
export function useRemoteVideos(
    getUserId: (socketId: string) => string | undefined
) {
    const [remoteVideos, setRemoteVideos] = useState<RemoteVideo[]>([]);
    const peersRef = useRef(new Map<string, PeerMedia>());
    // One MediaStream per track, reused across resolves so a React re-render
    // does not hand <video> a new srcObject (which restarts playback).
    const streamsRef = useRef(new Map<string, MediaStream>());
    const getUserIdRef = useRef(getUserId);

    useEffect(() => {
        getUserIdRef.current = getUserId;
    }, [getUserId]);

    const sync = useCallback(() => {
        const next: RemoteVideo[] = [];
        const usedTrackIds = new Set<string>();

        peersRef.current.forEach((media, socketId) => {
            const resolved = resolveVideoTracks(
                media.tracksByStreamId,
                media.state
            );

            VIDEO_SLOTS.forEach((slot) => {
                const track = resolved[slot];
                if (!track) return;

                usedTrackIds.add(track.id);
                const stream =
                    streamsRef.current.get(track.id) ??
                    new MediaStream([track]);
                streamsRef.current.set(track.id, stream);

                next.push({
                    id: `${socketId}:${slot}`,
                    socketId,
                    userId: getUserIdRef.current(socketId) ?? null,
                    slot,
                    stream,
                });
            });
        });

        streamsRef.current.forEach((_stream, trackId) => {
            if (!usedTrackIds.has(trackId)) streamsRef.current.delete(trackId);
        });

        setRemoteVideos((previous) =>
            areRemoteVideosEqual(previous, next) ? previous : next
        );
    }, []);

    const getPeer = useCallback((socketId: string): PeerMedia => {
        const existing = peersRef.current.get(socketId);
        if (existing) return existing;

        const created: PeerMedia = {
            tracksByStreamId: new Map(),
            state: NO_REMOTE_MEDIA_STATE,
        };
        peersRef.current.set(socketId, created);
        return created;
    }, []);

    const addTrack = useCallback(
        (socketId: string, { track, streamId }: RemoteTrack) => {
            if (track.kind !== "video" || !streamId) return;

            const peer = getPeer(socketId);
            peer.tracksByStreamId.set(streamId, track);
            track.addEventListener(
                "ended",
                () => {
                    if (peer.tracksByStreamId.get(streamId) === track) {
                        peer.tracksByStreamId.delete(streamId);
                    }
                    sync();
                },
                { once: true }
            );
            sync();
        },
        [getPeer, sync]
    );

    const setState = useCallback(
        (socketId: string, state: RemoteMediaState) => {
            getPeer(socketId).state = state;
            sync();
        },
        [getPeer, sync]
    );

    const removePeer = useCallback(
        (socketId: string) => {
            if (!peersRef.current.delete(socketId)) return;
            sync();
        },
        [sync]
    );

    const clear = useCallback(() => {
        peersRef.current.clear();
        sync();
    }, [sync]);

    return { remoteVideos, addTrack, setState, removePeer, clear };
}

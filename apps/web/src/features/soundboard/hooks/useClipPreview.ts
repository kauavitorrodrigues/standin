import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import { SOUNDBOARD_MESSAGES } from "../consts/messages";
import { getClipBuffer } from "../lib/clipBufferCache";
import { playLocalBuffer } from "../lib/playLocalBuffer";
import type { ClipPlayback, ClipPreview } from "../types/playback";
import { useLazyAudioContext } from "./useLazyAudioContext";

/**
 * Plays clips to the person's own speakers, one at a time, shaped like the
 * playback of the call so the same tiles can use either, and it can be
 * stopped, which the call cannot.
 */
export const useClipPreview = (): ClipPreview => {
    const getContext = useLazyAudioContext();
    const [playingClipId, setPlayingClipId] = useState<string | null>(null);
    const stopRef = useRef<(() => void) | null>(null);

    const stop = useCallback(() => {
        stopRef.current?.();
        stopRef.current = null;
        setPlayingClipId(null);
    }, []);

    useEffect(() => stop, [stop]);

    const play = useCallback<ClipPlayback["play"]>(
        async (clip) => {
            try {
                const buffer = await getClipBuffer(clip);
                stopRef.current?.();
                setPlayingClipId(clip.id);
                stopRef.current = playLocalBuffer(getContext(), {
                    buffer,
                    volume: clip.volume,
                    onEnded: () => {
                        stopRef.current = null;
                        setPlayingClipId(null);
                    },
                });
            } catch {
                toast.add({
                    title: SOUNDBOARD_MESSAGES.PLAY_FAILED,
                    type: "error",
                });
            }
        },
        [getContext]
    );

    // One preview at a time, so the set holds at most that clip.
    const playingClipIds = useMemo<ReadonlySet<string>>(
        () => new Set(playingClipId === null ? [] : [playingClipId]),
        [playingClipId]
    );

    return useMemo(
        () => ({
            disabledReason: null,
            isAtLimit: false,
            playingClipIds,
            play,
            stop,
        }),
        [playingClipIds, play, stop]
    );
};

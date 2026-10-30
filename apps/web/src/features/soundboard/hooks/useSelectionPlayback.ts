import { useCallback, useEffect, useRef, useState } from "react";
import { SOUNDBOARD_VOLUME_DEFAULT } from "@standin/contracts";
import type { TrimRange } from "../types/trim";
import { clampVolume } from "../utils/clampVolume";

type Options = {
    getContext: () => AudioContext;
    buffer: AudioBuffer | null;
    range: TrimRange;
};

/**
 * Plays the selected range to the speakers, with a playhead. The volume is the
 * one the clip will have, and a change is heard at once while it plays.
 */
export const useSelectionPlayback = ({
    getContext,
    buffer,
    range,
}: Options) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playheadMs, setPlayheadMs] = useState<number | null>(null);
    const [volume, setVolumeState] = useState(SOUNDBOARD_VOLUME_DEFAULT);

    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const frameRef = useRef(0);

    const stop = useCallback(() => {
        cancelAnimationFrame(frameRef.current);
        const playing = sourceRef.current;
        sourceRef.current = null;
        if (playing) {
            playing.onended = null;
            playing.stop();
            playing.disconnect();
        }
        gainRef.current?.disconnect();
        gainRef.current = null;
        setIsPlaying(false);
        setPlayheadMs(null);
    }, []);

    useEffect(() => stop, [stop]);

    const toggle = useCallback(() => {
        if (isPlaying) return stop();
        if (!buffer || range.endMs <= range.startMs) return;

        const context = getContext();
        void context.resume();
        const node = context.createBufferSource();
        node.buffer = buffer;
        // The same gain the clip gets when it plays, so the preview is honest.
        const gain = context.createGain();
        gain.gain.value = volume;
        node.connect(gain);
        gain.connect(context.destination);
        gainRef.current = gain;
        const startedAt = context.currentTime;
        node.onended = stop;
        node.start(
            0,
            range.startMs / 1000,
            (range.endMs - range.startMs) / 1000
        );
        sourceRef.current = node;
        setIsPlaying(true);

        const tick = () => {
            const elapsedMs = (context.currentTime - startedAt) * 1000;
            setPlayheadMs(Math.min(range.startMs + elapsedMs, range.endMs));
            frameRef.current = requestAnimationFrame(tick);
        };
        tick();
    }, [buffer, getContext, isPlaying, range, stop, volume]);

    const setVolume = useCallback((next: number) => {
        const clamped = clampVolume(next);
        setVolumeState(clamped);
        if (gainRef.current) gainRef.current.gain.value = clamped;
    }, []);

    return { isPlaying, playheadMs, toggle, stop, setVolume };
};

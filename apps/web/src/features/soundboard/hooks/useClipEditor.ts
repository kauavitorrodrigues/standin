import { useCallback } from "react";
import { cutAudioRange } from "../lib/cutAudioRange";
import { checkClipLimits } from "../lib/checkClipLimits";
import { encodeClipInWorker } from "../lib/encodeInWorker";
import { SoundboardSourceUndecodableError } from "../types/errors";
import type { TrimRange } from "../types/trim";
import { useClipSource } from "./useClipSource";
import { useLazyAudioContext } from "./useLazyAudioContext";
import { useSelectionPlayback } from "./useSelectionPlayback";

/**
 * The audio editor of the upload step: the loaded file, the trimmed range, the
 * playback of the selection and the encode. The name, icon and volume are not
 * here, they belong to the form.
 */
export const useClipEditor = () => {
    const getContext = useLazyAudioContext();
    const clip = useClipSource(getContext);
    const {
        source,
        range,
        loadFile: loadSource,
        setRange: setSourceRange,
    } = clip;
    const playback = useSelectionPlayback({
        getContext,
        buffer: clip.buffer,
        range,
    });
    const { stop } = playback;

    const loadFile = useCallback(
        async (file: File) => {
            stop();
            return loadSource(file);
        },
        [loadSource, stop]
    );

    const setRange = useCallback(
        (next: TrimRange) => {
            stop();
            setSourceRange(next);
        },
        [setSourceRange, stop]
    );

    /** Cuts, encodes and returns the bytes to upload. */
    const exportClip = useCallback(async () => {
        if (!source) throw new SoundboardSourceUndecodableError();
        const samples = cutAudioRange(source, range);
        return encodeClipInWorker(samples, source.sampleRate);
    }, [source, range]);

    const durationMs = Math.max(0, Math.round(range.endMs - range.startMs));

    return {
        status: clip.status,
        errorMessage: clip.errorMessage,
        source,
        range,
        report: checkClipLimits(durationMs),
        isPlaying: playback.isPlaying,
        playheadMs: playback.playheadMs,
        setPlaybackVolume: playback.setVolume,
        togglePlayback: playback.toggle,
        loadFile,
        setRange,
        exportClip,
    };
};

export type ClipEditorState = ReturnType<typeof useClipEditor>;

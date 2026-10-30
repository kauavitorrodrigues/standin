import { useCallback, useState } from "react";
import { BaseError, SOUNDBOARD_MAX_DURATION_MS } from "@standin/contracts";
import { SoundboardSourceUndecodableError } from "../types/errors";
import { decodeSourceFile } from "../lib/decodeSource";
import { toAudioBuffer } from "../lib/toAudioBuffer";
import type { ClipEditorStatus } from "../types/editor";
import type { DecodedSource } from "../types/audio";
import type { TrimRange } from "../types/trim";
import { clampRange } from "../utils/clampRange";

const EMPTY_RANGE: TrimRange = { startMs: 0, endMs: 0 };

/**
 * The file the person loaded into the editor: its decoded channels, the range
 * they chose to keep, and whether the file could be read. The file never
 * leaves the browser.
 */
export const useClipSource = (getContext: () => AudioContext) => {
    const [status, setStatus] = useState<ClipEditorStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [source, setSource] = useState<DecodedSource | null>(null);
    const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
    const [range, setRangeState] = useState<TrimRange>(EMPTY_RANGE);

    const loadFile = useCallback(
        async (file: File): Promise<boolean> => {
            setStatus("decoding");
            setErrorMessage(null);
            try {
                const context = getContext();
                const decoded = await decodeSourceFile(file, context);
                setBuffer(toAudioBuffer(context, decoded));
                setSource(decoded);
                setRangeState({
                    startMs: 0,
                    endMs: Math.min(
                        decoded.durationMs,
                        SOUNDBOARD_MAX_DURATION_MS
                    ),
                });
                setStatus("ready");
                return true;
            } catch (error) {
                setSource(null);
                setBuffer(null);
                setStatus("error");
                setErrorMessage(
                    error instanceof BaseError
                        ? error.message
                        : new SoundboardSourceUndecodableError().message
                );
                return false;
            }
        },
        [getContext]
    );

    const setRange = useCallback(
        (next: TrimRange) => {
            if (!source) return;
            setRangeState(clampRange(next, source.durationMs));
        },
        [source]
    );

    return { status, errorMessage, source, buffer, range, setRange, loadFile };
};

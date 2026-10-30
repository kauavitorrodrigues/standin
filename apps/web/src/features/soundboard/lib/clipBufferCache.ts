import { API_BASE_URL } from "@/lib/api/url";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import {
    CLIP_CACHE_MAX_ENTRIES,
    DECODE_CONTEXT_SAMPLE_RATE,
} from "../consts/cache";
import { SoundboardClipLoadError } from "../types/errors";
import type { ClipSource } from "../types/audio";

// An offline context only decodes: it opens no audio device and never needs a
// gesture to resume, and an AudioBuffer it makes plays on any context.
let decodeContext: OfflineAudioContext | null = null;
const getDecodeContext = (): OfflineAudioContext => {
    decodeContext ??= new OfflineAudioContext(1, 1, DECODE_CONTEXT_SAMPLE_RATE);
    return decodeContext;
};

// Promises, not buffers, so two plays of the same clip share one download.
// A Map keeps insertion order, which makes it the recency list of the LRU.
const buffers = new Map<string, Promise<AudioBuffer>>();

const load = async (clip: ClipSource): Promise<AudioBuffer> => {
    const response = await fetch(resolveFileUrl(clip.fileUrl, API_BASE_URL));
    if (!response.ok) throw new SoundboardClipLoadError();
    return getDecodeContext()
        .decodeAudioData(await response.arrayBuffer())
        .catch(() => {
            throw new SoundboardClipLoadError();
        });
};

/** The decoded clip, fetched once while it stays among the most recent. */
export const getClipBuffer = (clip: ClipSource): Promise<AudioBuffer> => {
    const cached = buffers.get(clip.id);
    if (cached) {
        buffers.delete(clip.id);
        buffers.set(clip.id, cached);
        return cached;
    }

    const pending = load(clip).catch((error: unknown) => {
        // A failure is not cached, the next play tries again.
        buffers.delete(clip.id);
        throw error;
    });
    buffers.set(clip.id, pending);
    if (buffers.size > CLIP_CACHE_MAX_ENTRIES) {
        const oldest = buffers.keys().next().value;
        if (oldest !== undefined) buffers.delete(oldest);
    }
    return pending;
};

export const clearClipBufferCache = (): void => buffers.clear();

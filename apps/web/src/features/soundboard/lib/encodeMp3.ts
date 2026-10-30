import { Mp3Encoder } from "@breezystack/lamejs";
import {
    SOUNDBOARD_ENCODE_BLOCK_SAMPLES,
    SOUNDBOARD_ENCODE_CHANNELS,
    SOUNDBOARD_ENCODE_KBPS,
} from "../consts/encoding";

const toInt16 = (sample: number): number => {
    const clamped = Math.max(-1, Math.min(1, sample));
    if (clamped < 0) return clamped * 0x8000;
    return clamped * 0x7fff;
};

/** Encodes mono samples as an mp3. Runs in the worker, but has no worker API. */
export const encodeMp3Samples = (
    samples: Float32Array,
    sampleRate: number
): Uint8Array<ArrayBuffer> => {
    const encoder = new Mp3Encoder(
        SOUNDBOARD_ENCODE_CHANNELS,
        sampleRate,
        SOUNDBOARD_ENCODE_KBPS
    );
    const pcm = Int16Array.from(samples, toInt16);
    const chunks: Uint8Array[] = [];

    for (
        let from = 0;
        from < pcm.length;
        from += SOUNDBOARD_ENCODE_BLOCK_SAMPLES
    ) {
        const chunk = encoder.encodeBuffer(
            pcm.subarray(from, from + SOUNDBOARD_ENCODE_BLOCK_SAMPLES)
        );
        if (chunk.length > 0) chunks.push(chunk);
    }
    chunks.push(encoder.flush());

    const bytes = new Uint8Array(
        chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    );
    let offset = 0;
    chunks.forEach((chunk) => {
        bytes.set(chunk, offset);
        offset += chunk.length;
    });
    return bytes;
};

import {
    FRAME_HEADER_BYTES,
    MAX_TRAILING_BYTES,
    ID3V2_HEADER_BYTES,
    MPEG1_LAYER3_BITRATES,
    MPEG1_SAMPLES_PER_FRAME,
    MPEG2_LAYER3_BITRATES,
    MPEG2_SAMPLES_PER_FRAME,
    SAMPLE_RATES_BY_VERSION,
    VBR_TAGS,
    VBR_TAG_SEARCH_BYTES,
} from "../consts/mp3";
import type { Frame, Mp3Info } from "../types";

// Version field of the header: 0 is MPEG 2.5, 2 is MPEG 2, 3 is MPEG 1.
const VERSION_MPEG1 = 3;
const LAYER_III = 1;

// The size of the ID3v2 tag at the start, which is not sound. Four synchsafe
// bytes: 7 bits each.
const skipId3v2 = (buffer: Buffer): number => {
    if (buffer.length < ID3V2_HEADER_BYTES) return 0;
    if (buffer.toString("latin1", 0, 3) !== "ID3") return 0;

    const size =
        ((buffer[6]! & 0x7f) << 21) |
        ((buffer[7]! & 0x7f) << 14) |
        ((buffer[8]! & 0x7f) << 7) |
        (buffer[9]! & 0x7f);
    return ID3V2_HEADER_BYTES + size;
};

// Reads the header at `offset`. Null when it is not a Layer III frame.
const readFrame = (buffer: Buffer, offset: number): Frame | null => {
    if (offset + FRAME_HEADER_BYTES > buffer.length) return null;

    const b1 = buffer[offset]!;
    const b2 = buffer[offset + 1]!;
    const b3 = buffer[offset + 2]!;
    // 11 bits of sync.
    if (b1 !== 0xff || (b2 & 0xe0) !== 0xe0) return null;

    const version = (b2 >> 3) & 0x3;
    const layer = (b2 >> 1) & 0x3;
    // Version 1 is reserved.
    if (version === 1 || layer !== LAYER_III) return null;

    const isMpeg1 = version === VERSION_MPEG1;
    const bitrateIndex = b3 >> 4;
    const rateIndex = (b3 >> 2) & 0x3;
    const padding = (b3 >> 1) & 0x1;
    if (bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) {
        return null;
    }

    const bitrates = isMpeg1 ? MPEG1_LAYER3_BITRATES : MPEG2_LAYER3_BITRATES;
    const rates = SAMPLE_RATES_BY_VERSION[version]!;
    const bitrate = bitrates[bitrateIndex]! * 1000;
    const sampleRate = rates[rateIndex]!;
    const samples = isMpeg1 ? MPEG1_SAMPLES_PER_FRAME : MPEG2_SAMPLES_PER_FRAME;

    return {
        length: Math.floor((samples / 8) * (bitrate / sampleRate)) + padding,
        samples,
        sampleRate,
    };
};

// The first frame of a VBR file carries the encoder tag instead of sound.
const isEncoderTag = (buffer: Buffer, offset: number, length: number) => {
    const end = Math.min(offset + length, offset + VBR_TAG_SEARCH_BYTES + 8);
    const head = buffer.toString("latin1", offset, end);
    return VBR_TAGS.some((tag) => head.includes(tag));
};

/**
 * Walks the MPEG frames of an mp3 and sums their length. It reads the bytes,
 * so a file only named .mp3 or sent as audio/mpeg is not enough. Null when the
 * file does not start with a Layer III frame (after an ID3v2 tag), when the
 * frames are not contiguous, or when the sample rate changes along the file.
 */
export const readMp3Info = (buffer: Buffer): Mp3Info | null => {
    let offset = skipId3v2(buffer);
    let samples = 0;
    let sampleRate = 0;
    let frames = 0;

    while (offset < buffer.length) {
        const frame = readFrame(buffer, offset);
        // Trailing bytes (an ID3v1 tag, padding) end the sound.
        if (!frame) break;
        if (offset + frame.length > buffer.length) break;

        if (sampleRate !== 0 && frame.sampleRate !== sampleRate) return null;
        sampleRate = frame.sampleRate;

        const isTag =
            frames === 0 && isEncoderTag(buffer, offset, frame.length);
        if (!isTag) samples += frame.samples;
        frames += 1;
        offset += frame.length;
    }

    if (frames === 0 || samples === 0 || sampleRate === 0) return null;
    if (buffer.length - offset > MAX_TRAILING_BYTES) return null;
    return { durationMs: Math.round((samples / sampleRate) * 1000) };
};

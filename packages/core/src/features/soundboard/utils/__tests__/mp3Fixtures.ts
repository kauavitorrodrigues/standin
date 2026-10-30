// MPEG 1 Layer III, 128 kbps, 44.1 kHz, no padding: 417 bytes and 1152 samples
// (26.12 ms) per frame. The body is zeros, which the reader never decodes.
const FRAME_HEADER = [0xff, 0xfb, 0x90, 0x00];
export const FRAME_BYTES = 417;
export const FRAME_MS = (1152 / 44100) * 1000;

export const buildFrame = (header: number[] = FRAME_HEADER): Buffer => {
    const frame = Buffer.alloc(FRAME_BYTES);
    Buffer.from(header).copy(frame);
    return frame;
};

export const buildMp3 = (frames: number, prefix?: Buffer): Buffer =>
    Buffer.concat([
        ...(prefix ? [prefix] : []),
        ...Array.from({ length: frames }, () => buildFrame()),
    ]);

// An ID3v2 tag with `size` bytes of body (synchsafe size field).
export const buildId3v2 = (size: number): Buffer => {
    const header = Buffer.from([
        0x49,
        0x44,
        0x33,
        0x03,
        0x00,
        0x00,
        (size >> 21) & 0x7f,
        (size >> 14) & 0x7f,
        (size >> 7) & 0x7f,
        size & 0x7f,
    ]);
    return Buffer.concat([header, Buffer.alloc(size)]);
};

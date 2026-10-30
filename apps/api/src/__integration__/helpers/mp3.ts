// MPEG 1 Layer III, 128 kbps, 44.1 kHz: 417 bytes and 26.12 ms per frame. The
// body is zeros, which the server never decodes, it only walks the headers.
export const buildMp3 = (frames: number): Buffer =>
    Buffer.concat(
        Array.from({ length: frames }, () => {
            const frame = Buffer.alloc(417);
            Buffer.from([0xff, 0xfb, 0x90, 0x00]).copy(frame);
            return frame;
        })
    );

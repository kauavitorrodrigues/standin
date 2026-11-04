const SAMPLE_RATE = 22050;
const HEADER_BYTES = 44;
const PEAK = 0.6;

export const WAV_SAMPLE_RATE = SAMPLE_RATE;

// Writes mono 16 bit WAV samples, between -1 and 1, and returns a blob URL.
// Gives the catalog a sound without shipping a file.
export const encodeWavUrl = (samples: ArrayLike<number>): string => {
    const view = new DataView(
        new ArrayBuffer(HEADER_BYTES + samples.length * 2)
    );
    const writeText = (offset: number, text: string) =>
        [...text].forEach((char, index) =>
            view.setUint8(offset + index, char.charCodeAt(0))
        );

    writeText(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeText(8, "WAVE");
    writeText(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, SAMPLE_RATE, true);
    view.setUint32(28, SAMPLE_RATE * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeText(36, "data");
    view.setUint32(40, samples.length * 2, true);

    for (let index = 0; index < samples.length; index++) {
        const clipped = Math.max(-1, Math.min(1, samples[index] ?? 0));
        view.setInt16(
            HEADER_BYTES + index * 2,
            Math.round(clipped * PEAK * 0x7fff),
            true
        );
    }

    return URL.createObjectURL(new Blob([view], { type: "audio/wav" }));
};

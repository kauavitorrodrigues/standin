const SAMPLE_RATE = 22050;
const PEAK = 0.6;
const HEADER_BYTES = 44;

// A short fading sine tone as a mono 16 bit WAV, returned as a blob URL.
// Gives the catalog a sound without shipping a file.
export const createToneUrl = (
    frequencyHz: number,
    durationSeconds: number
): string => {
    const sampleCount = Math.round(SAMPLE_RATE * durationSeconds);
    const view = new DataView(new ArrayBuffer(HEADER_BYTES + sampleCount * 2));
    const writeText = (offset: number, text: string) =>
        [...text].forEach((char, index) =>
            view.setUint8(offset + index, char.charCodeAt(0))
        );

    writeText(0, "RIFF");
    view.setUint32(4, 36 + sampleCount * 2, true);
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
    view.setUint32(40, sampleCount * 2, true);

    for (let index = 0; index < sampleCount; index++) {
        const progress = index / sampleCount;
        const fade = (1 - progress) ** 2;
        const wave = Math.sin(
            (2 * Math.PI * frequencyHz * index) / SAMPLE_RATE
        );
        view.setInt16(
            HEADER_BYTES + index * 2,
            Math.round(wave * fade * PEAK * 0x7fff),
            true
        );
    }

    return URL.createObjectURL(new Blob([view], { type: "audio/wav" }));
};

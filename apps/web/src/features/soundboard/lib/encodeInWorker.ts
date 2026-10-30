import { SoundboardEncodeError } from "../types/errors";
import type { EncodeResponse } from "../types/audio";

/** Encodes in a short lived worker, which also keeps lamejs out of the main bundle. */
export const encodeClipInWorker = (
    samples: Float32Array<ArrayBuffer>,
    sampleRate: number
): Promise<Uint8Array<ArrayBuffer>> =>
    new Promise((resolve, reject) => {
        const worker = new Worker(
            new URL("./encodeMp3.worker.ts", import.meta.url),
            { type: "module" }
        );
        const finish = () => worker.terminate();

        worker.onmessage = (event: MessageEvent<EncodeResponse>) => {
            finish();
            if (!event.data.ok) return reject(new SoundboardEncodeError());
            resolve(event.data.bytes);
        };
        worker.onerror = () => {
            finish();
            reject(new SoundboardEncodeError());
        };
        worker.postMessage({ samples, sampleRate }, [samples.buffer]);
    });

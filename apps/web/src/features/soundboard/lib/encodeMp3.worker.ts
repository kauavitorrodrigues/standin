import { encodeMp3Samples } from "./encodeMp3";
import type { EncodeRequest, EncodeResponse } from "../types/audio";

// Encoding a few seconds takes long enough to freeze the editor, so it runs
// here instead of the main thread.
self.onmessage = (event: MessageEvent<EncodeRequest>) => {
    try {
        const { samples, sampleRate } = event.data;
        const bytes = encodeMp3Samples(samples, sampleRate);
        const response: EncodeResponse = { ok: true, bytes };
        self.postMessage(response, { transfer: [bytes.buffer] });
    } catch {
        const response: EncodeResponse = { ok: false };
        self.postMessage(response);
    }
};

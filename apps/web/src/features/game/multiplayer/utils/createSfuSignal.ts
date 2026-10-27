import { SFU_REQUEST_TIMEOUT_MS } from "../consts/sfu";
import type { SfuAnswer, SfuSignal, SfuSocket } from "../types/sfuSignal";
import { readSfuAnswer } from "./readSfuAnswer";

/**
 * Wraps the socket in the request and answer shape the media client uses.
 * `request` waits for the answer of the server and rejects with the error
 * {@link readSfuAnswer} throws. `send` is for messages that have no answer.
 */
export const createSfuSignal = (socket: SfuSocket): SfuSignal => ({
    request: <T extends { ok: true }>(event: string, payload?: unknown) =>
        new Promise<T>((resolve, reject) => {
            const onAnswer = (error: Error | null, answer?: SfuAnswer) => {
                try {
                    resolve(readSfuAnswer<T>(error, answer));
                } catch (failure) {
                    reject(failure);
                }
            };
            const emitter = socket.timeout(SFU_REQUEST_TIMEOUT_MS);
            if (payload === undefined) emitter.emit(event, onAnswer);
            else emitter.emit(event, payload, onAnswer);
        }),
    send: (event, payload) => {
        socket.emit(event, payload);
    },
});

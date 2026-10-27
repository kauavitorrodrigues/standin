import {
    SfuEmptyAnswerError,
    SfuRequestRejectedError,
    SfuRequestTimeoutError,
} from "../errors";
import type { SfuAnswer } from "../types/sfuSignal";

/**
 * Turns what the socket gives back for a request into the answer, or throws
 * the error that says what went wrong: a timeout (the socket gives an error),
 * an empty answer, or a failure answered by the server.
 */
export const readSfuAnswer = <T extends { ok: true }>(
    error: Error | null,
    answer: SfuAnswer | undefined
): T => {
    if (error) throw new SfuRequestTimeoutError();
    if (!answer) throw new SfuEmptyAnswerError();
    if (!answer.ok) throw new SfuRequestRejectedError(answer.code ?? "UNKNOWN");
    return answer as T;
};

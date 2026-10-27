import {
    BaseError,
    MediaInvalidRequestError,
    MediaUnavailableError,
} from "@standin/contracts";
import { replyAck } from "@/lib/socket/utils/replyAck";
import { MediaLogMessages } from "../consts/messages";
import type { MediaFailure } from "../types";

/**
 * The answer for an error. A refusal the server knows (a BaseError) is logged
 * in one line with the request it answered, so a media session that stops half
 * way can be traced in the terminal. Anything else is logged in full.
 */
export const failureOf = (error: unknown, event?: string): MediaFailure => {
    if (error instanceof BaseError) {
        console.warn(MediaLogMessages.requestRefused, event ?? "", error.code);
        return { ok: false, code: error.code };
    }
    console.error(error);
    return { ok: false, code: new MediaUnavailableError().code };
};

/**
 * Runs a request that answers with an ack. A malformed payload or any error
 * becomes a failed ack with the code of the error, and never reaches the
 * process.
 */
export const answerMediaRequest = async <T extends { ok: true }>(
    event: string,
    ack: unknown,
    run: () => Promise<T>
): Promise<void> => {
    try {
        replyAck(ack, await run());
    } catch (error) {
        replyAck(ack, failureOf(error, event));
    }
};

/** Runs a message that has no ack. A failure is logged and nothing else. */
export const handleMediaMessage = (run: () => void): void => {
    try {
        run();
    } catch (error) {
        failureOf(error);
    }
};

export const parseOrThrow = <T>(
    schema: {
        safeParse: (
            value: unknown
        ) => { success: true; data: T } | { success: false };
    },
    payload: unknown
): T => {
    const parsed = schema.safeParse(payload);
    if (!parsed.success) throw new MediaInvalidRequestError();
    return parsed.data;
};

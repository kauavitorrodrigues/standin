import { SpotifyMessages } from "../consts/messages";
import type { SpotifyResultKey } from "../types/result";

const isResultKey = (value: string): value is SpotifyResultKey =>
    Object.hasOwn(SpotifyMessages.result, value);

/** The message for a result code, or the generic failure for an unknown one. */
export const getSpotifyResultMessage = (code: string): string => {
    if (!isResultKey(code)) return SpotifyMessages.result.failed;
    return SpotifyMessages.result[code];
};

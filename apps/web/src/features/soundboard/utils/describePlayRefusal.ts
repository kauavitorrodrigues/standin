import { SOUNDBOARD_MESSAGES } from "../consts/messages";
import type { PlayRefusal } from "../types/playback";

/**
 * What to tell the person about a play the server refused, null for nothing.
 * The short wait between plays is applied here too, so when the server still
 * refuses for it that is a race, and nothing is said.
 */
export const describePlayRefusal = ({ code }: PlayRefusal): string | null => {
    if (code === "SOUNDBOARD_COOLDOWN") return null;
    // The limit is shown by disabling the buttons, never by a message, so a
    // server that still refuses for it (a race) is ignored.
    if (code === "SOUNDBOARD_TOO_MANY_CLIPS") return null;
    if (code === "SOUNDBOARD_NOT_IN_SPACE") {
        return SOUNDBOARD_MESSAGES.NOT_IN_SPACE;
    }
    return SOUNDBOARD_MESSAGES.PLAY_FAILED;
};

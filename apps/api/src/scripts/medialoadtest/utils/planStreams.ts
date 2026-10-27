import type { MediaRunOptions, PersonStreams } from "../types";

/**
 * Which streams the person at `index` sends: the first people have a
 * microphone, the first people have a camera and the next ones share a screen.
 * Each stream takes the next SSRC.
 */
export const planStreams = (
    index: number,
    options: Pick<
        MediaRunOptions,
        "speakers" | "cameras" | "screens" | "layers"
    >,
    nextSsrc: () => number
): PersonStreams => {
    const sharesScreen =
        index >= options.cameras && index < options.cameras + options.screens;
    return {
        mic: index < options.speakers ? nextSsrc() : null,
        camera:
            index < options.cameras
                ? Array.from({ length: options.layers }, nextSsrc)
                : null,
        screen: sharesScreen ? nextSsrc() : null,
    };
};

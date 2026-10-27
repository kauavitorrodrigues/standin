import type { SpaceMedia } from "@standin/media";

/** The media of the space a socket joined. */
export type MediaContext = {
    spaceId: string;
    room: SpaceMedia;
};

/** The answer to a request that failed, with the code of the error. */
export type MediaFailure = { ok: false; code: string };

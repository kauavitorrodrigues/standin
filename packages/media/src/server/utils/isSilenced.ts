import type { Peer } from "../spaceTypes";

/**
 * Whether the planner and the speaker ranking should treat the person as
 * silent. A muted person is, unless a soundboard clip is playing: the clip
 * rides the same audio track, and the client already silences the voice.
 */
export const isSilenced = (peer: Pick<Peer, "muted" | "soundboardActive">) =>
    peer.muted && !peer.soundboardActive;

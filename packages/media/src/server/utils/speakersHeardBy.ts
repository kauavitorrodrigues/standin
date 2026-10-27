import type { Peer } from "../spaceTypes";

// Speakers a receiver may know about: itself and the ones it consumes audio
// from. Keeps the speaking indicator from leaking who talks in another room.
export const speakersHeardBy = (
    peer: Peer,
    speakerIds: readonly string[]
): string[] => {
    const heard = new Set<string>();
    peer.consumers.forEach((entry) => {
        if (entry.kind === "audio") heard.add(entry.ownerId);
    });
    return speakerIds.filter((id) => id === peer.id || heard.has(id));
};

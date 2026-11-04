import type { PersonState } from "../types";

type Side = Pick<PersonState, "announcing" | "sharingVideoWithAnnouncer">;

// An announcer does not get the camera of the people listening unless they
// opted in, so the connection of the announcer is not flooded. Another
// announcer is a listener too.
export const withholdsCamera = (receiver: Side, person: Side): boolean =>
    receiver.announcing && !person.sharingVideoWithAnnouncer;

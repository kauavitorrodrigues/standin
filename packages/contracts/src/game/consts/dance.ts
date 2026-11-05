// The longest a person keeps dancing without letting go of the key. The client
// stops at this mark, and the server stops it again a little later in case the
// client never does.
export const DANCE_MAX_MS = 60_000;

// How long the server waits past the cap, so a client that stops on time is
// never overtaken by the server.
export const DANCE_SERVER_GRACE_MS = 2_000;

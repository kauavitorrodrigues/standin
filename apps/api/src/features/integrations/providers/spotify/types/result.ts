import type { SpotifyConnectResult } from "@standin/contracts";

// An error class of the connection and the code the web shows for it.
export type SpotifyResultRule = [new () => Error, SpotifyConnectResult];

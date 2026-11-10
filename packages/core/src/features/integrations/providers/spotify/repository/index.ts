import { countSpotifyConnections } from "./countConnections";
import { deleteSpotifyApp } from "./deleteApp";
import { deleteSpotifyConnection } from "./deleteConnection";
import { deleteSpotifyConnections } from "./deleteConnections";
import { findSpotifyApp } from "./findApp";
import { findSpotifyConnection } from "./findConnection";
import { listSpotifyConnections } from "./listConnections";
import { upsertSpotifyApp } from "./upsertApp";
import { upsertSpotifyConnection } from "./upsertConnection";

// The generic tables of the integrations, seen as Spotify's: every call has the
// provider and the service filled in.
export const SpotifyRepository = {
    findApp: findSpotifyApp,
    upsertApp: upsertSpotifyApp,
    deleteApp: deleteSpotifyApp,
    deleteConnections: deleteSpotifyConnections,
    findConnection: findSpotifyConnection,
    listConnections: listSpotifyConnections,
    countConnections: countSpotifyConnections,
    upsertConnection: upsertSpotifyConnection,
    deleteConnection: deleteSpotifyConnection,
};

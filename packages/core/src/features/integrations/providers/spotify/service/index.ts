import { completeSpotifyConnection } from "./completeConnection";
import { disconnectSpotify } from "./disconnect";
import { getSpotifyMemberStatus } from "./getMemberStatus";
import { getSpotifyOwnerStatus } from "./getOwnerStatus";
import { removeSpotifyApp } from "./removeApp";
import { saveSpotifyApp } from "./saveApp";
import { startSpotifyConnection } from "./startConnection";

export const SpotifyService = {
    getOwnerStatus: getSpotifyOwnerStatus,
    getMemberStatus: getSpotifyMemberStatus,
    saveApp: saveSpotifyApp,
    removeApp: removeSpotifyApp,
    startConnection: startSpotifyConnection,
    completeConnection: completeSpotifyConnection,
    disconnect: disconnectSpotify,
};

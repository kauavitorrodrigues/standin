import { spotifyCallback } from "./callback";
import { disconnectSpotify } from "./disconnect";
import { getSpotifyApp } from "./getApp";
import { getSpotifyStatus } from "./getStatus";
import { removeSpotifyApp } from "./removeApp";
import { removeSpotifyConnection } from "./removeConnection";
import { saveSpotifyApp } from "./saveApp";
import { startSpotifyConnection } from "./start";

export const SpotifyController = {
    getApp: getSpotifyApp,
    saveApp: saveSpotifyApp,
    removeApp: removeSpotifyApp,
    removeConnection: removeSpotifyConnection,
    getStatus: getSpotifyStatus,
    start: startSpotifyConnection,
    disconnect: disconnectSpotify,
    callback: spotifyCallback,
};

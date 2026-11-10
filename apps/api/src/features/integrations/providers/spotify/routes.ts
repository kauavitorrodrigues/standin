import { Router } from "express";
import { RateLimit } from "@/middlewares/rateLimit";
import { RequiresOrgOwner } from "@/middlewares/requiresOrgOwner";
import { SpotifyController } from "./controllers";
import {
    SPOTIFY_CALLBACK_RATE_LIMIT,
    SPOTIFY_CONNECT_RATE_LIMIT,
    SPOTIFY_RATE_LIMIT_WINDOW_MS,
    SPOTIFY_SAVE_RATE_LIMIT,
} from "./consts";

// Mounted at `/organizations/:organizationId/spotify`, after `RequiresOrgMember`.
// Any member connects their own account; only the owner touches the app.
const organizationRouter = Router({ mergeParams: true });

organizationRouter.get("/status", SpotifyController.getStatus);
// The browser navigates here, then Spotify sends it to the callback below.
organizationRouter.get(
    "/connect",
    RateLimit({
        windowMs: SPOTIFY_RATE_LIMIT_WINDOW_MS,
        max: SPOTIFY_CONNECT_RATE_LIMIT,
    }),
    SpotifyController.start
);
organizationRouter.delete("/connection", SpotifyController.disconnect);

organizationRouter.get("/app", RequiresOrgOwner, SpotifyController.getApp);
organizationRouter.put(
    "/app",
    RequiresOrgOwner,
    RateLimit({
        windowMs: SPOTIFY_RATE_LIMIT_WINDOW_MS,
        max: SPOTIFY_SAVE_RATE_LIMIT,
    }),
    SpotifyController.saveApp
);
organizationRouter.delete(
    "/app",
    RequiresOrgOwner,
    SpotifyController.removeApp
);
organizationRouter.delete(
    "/connections/:userId",
    RequiresOrgOwner,
    SpotifyController.removeConnection
);

export const organizationSpotifyRouter = organizationRouter;

// Mounted at `/integrations/spotify`. One address for the whole instance, the
// one the owners register in their Spotify apps. The organization is in the
// cookie of the attempt, not in the path. It has no `RequiresAuth`: the person
// comes back from Spotify, so the controller reads the session itself and
// answers with a redirect, never a bare 401.
const callbackRouter = Router();

callbackRouter.get(
    "/callback",
    RateLimit({
        windowMs: SPOTIFY_RATE_LIMIT_WINDOW_MS,
        max: SPOTIFY_CALLBACK_RATE_LIMIT,
    }),
    SpotifyController.callback
);

export const spotifyCallbackRouter = callbackRouter;

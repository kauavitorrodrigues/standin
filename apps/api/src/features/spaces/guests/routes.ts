import { Router } from "express";
import { RateLimit } from "@/middlewares/rateLimit";
import {
    RequiresSpaceHost,
    RequiresSpaceOwner,
} from "@/middlewares/requiresSpaceHost";
import { RequiresSpaceView } from "@/middlewares/requiresSpaceView";
import { SpaceGuestController } from "./controllers";

const ONE_MINUTE_MS = 60 * 1000;

// Everything about a space addressed by its id alone, outside the organization
// path, because a guest has no organization of their own to put in the URL.
// Mounted at `/spaces` after `RequiresAuth`.
const spaceRouter = Router();

// The space for a member or an admitted guest.
spaceRouter.get("/:spaceId", RequiresSpaceView, SpaceGuestController.view);

// The links: only the owner of the organization makes or closes them.
spaceRouter.post(
    "/:spaceId/invite-links",
    RequiresSpaceOwner,
    SpaceGuestController.inviteLinks.create
);
spaceRouter.get(
    "/:spaceId/invite-links",
    RequiresSpaceOwner,
    SpaceGuestController.inviteLinks.list
);
spaceRouter.delete(
    "/:spaceId/invite-links/:linkId",
    RequiresSpaceOwner,
    SpaceGuestController.inviteLinks.revoke
);
spaceRouter.put(
    "/:spaceId/guest-access",
    RequiresSpaceOwner,
    SpaceGuestController.setAccess
);

// The guest asks about their own request. Declared before `/guests/:guestId`
// so "me" is never read as an id.
spaceRouter.get("/:spaceId/guests/me", SpaceGuestController.me);

// The hosts, owner or member, answer the requests and send guests out.
spaceRouter.get(
    "/:spaceId/guests",
    RequiresSpaceHost,
    SpaceGuestController.list
);
spaceRouter.post(
    "/:spaceId/guests/:guestId/admit",
    RequiresSpaceHost,
    SpaceGuestController.admit
);
spaceRouter.post(
    "/:spaceId/guests/:guestId/deny",
    RequiresSpaceHost,
    SpaceGuestController.deny
);
spaceRouter.post(
    "/:spaceId/guests/:guestId/reset",
    RequiresSpaceHost,
    SpaceGuestController.reset
);
spaceRouter.delete(
    "/:spaceId/guests/:guestId",
    RequiresSpaceHost,
    SpaceGuestController.remove
);

export const spaceAccessRouter = spaceRouter;

// The page of an invite. Both calls are rate limited per person: the token is
// the secret, and each request spends a use of the link.
const invitesRouter = Router();

invitesRouter.get(
    "/:token",
    RateLimit({ windowMs: ONE_MINUTE_MS, max: 30 }),
    SpaceGuestController.invites.preview
);
invitesRouter.post(
    "/:token/request",
    RateLimit({ windowMs: ONE_MINUTE_MS, max: 10 }),
    SpaceGuestController.invites.request
);

export const invitesAccessRouter = invitesRouter;

// The spaces the signed in person entered as a guest, for their home.
const guestSpacesRouter = Router();
guestSpacesRouter.get("/", SpaceGuestController.spaces);

export const guestSpacesAccessRouter = guestSpacesRouter;

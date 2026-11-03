import { Router } from "express";
import { RateLimit } from "@/middlewares/rateLimit";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { RequiresInviteManager } from "@/middlewares/requiresInviteManager";
import { OrganizationInviteController } from "./controllers";

const ONE_MINUTE_MS = 60 * 1000;

// Mounted at `/organizations/:organizationId/invite-links`, after
// `RequiresAuth`.
const manageRouter = Router({ mergeParams: true });

manageRouter.use(RequiresInviteManager);
// The fixed link.
manageRouter.get("/fixed", OrganizationInviteController.getFixed);
manageRouter.post("/fixed/reset", OrganizationInviteController.resetFixed);

export const organizationInviteLinksRouter = manageRouter;

// The page of a link, open to anyone: the person has no account yet. Rate
// limited because the token is the secret.
const previewRouter = Router();

previewRouter.get(
    "/:token",
    RateLimit({ windowMs: ONE_MINUTE_MS, max: 30 }),
    OrganizationInviteController.preview
);

export const organizationInvitePreviewRouter = previewRouter;

// The person who is signed in takes an invitation made for their e-mail.
previewRouter.post(
    "/:token/accept",
    RequiresAuth,
    RateLimit({ windowMs: ONE_MINUTE_MS, max: 10 }),
    OrganizationInviteController.accept
);

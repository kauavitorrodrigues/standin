import { Router } from "express";
import { RateLimit } from "@/middlewares/rateLimit";
import { RequiresInviteManager } from "@/middlewares/requiresInviteManager";
import { OrganizationInvitationController } from "./controllers";

const ONE_MINUTE_MS = 60 * 1000;

// Mounted at `/organizations/:organizationId/invitations`, after
// `RequiresAuth`. Same people as the links: the owner and the instance admin.
const router = Router({ mergeParams: true });

router.use(RequiresInviteManager);
// Each send can carry up to 50 e-mails, so sends are rationed per person.
router.post(
    "/",
    RateLimit({ windowMs: ONE_MINUTE_MS, max: 10 }),
    OrganizationInvitationController.create
);
router.get("/", OrganizationInvitationController.list);
router.get("/free-desks/:spaceId", OrganizationInvitationController.freeDesks);
router.delete("/:invitationId", OrganizationInvitationController.cancel);

export const organizationInvitationsRouter = router;

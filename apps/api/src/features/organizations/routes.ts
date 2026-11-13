import { Router } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { RequiresOrgMember } from "@/middlewares/requiresOrgMember";
import { RequiresCreationAllowed } from "@/middlewares/requiresCreationAllowed";
import { RequiresOrgOwner } from "@/middlewares/requiresOrgOwner";
import { RequiresPermission } from "@/middlewares/requiresPermission";
import { OrganizationController } from "./controllers";
import { spacesRouter } from "../spaces/routes";
import { conversationsRouter } from "../chat/routes";
import { organizationInviteLinksRouter } from "./invite-links/routes";
import { organizationInvitationsRouter } from "./invitations/routes";
import { RequiresInviteManager } from "@/middlewares/requiresInviteManager";
import { libraryRouter } from "../library/routes";
import { RequiresLibraryOwner } from "../library/middleware/requiresLibraryOwner";
import { organizationSoundboardRouter } from "../soundboard/routes";
import { organizationSpotifyRouter } from "../integrations/providers/spotify/routes";

const router = Router();

router.use(RequiresAuth);

router.post(
    "/",
    RequiresPermission("create", "organization"),
    RequiresCreationAllowed("organization"),
    OrganizationController.create
);

router.get("/", OrganizationController.list);

// The links that bring people in. The owner or the instance admin, so it comes
// before the routes that only accept members.
router.use("/:organizationId/invite-links", organizationInviteLinksRouter);
router.use("/:organizationId/invitations", organizationInvitationsRouter);
router.get(
    "/:organizationId/member-entries",
    RequiresInviteManager,
    OrganizationController.members.entries
);

// Only the owner removes someone, and the instance admin has no say inside an
// organization it is not a member of. The service checks it again.
router.delete(
    "/:organizationId/members/:userId",
    RequiresOrgMember,
    RequiresOrgOwner,
    OrganizationController.members.remove
);

router.post(
    "/:organizationId/leave",
    RequiresOrgMember,
    OrganizationController.members.leave
);

router.put(
    "/:organizationId",
    RequiresOrgMember,
    RequiresPermission("update", "organization"),
    OrganizationController.update
);

router.delete(
    "/:organizationId",
    RequiresOrgMember,
    RequiresPermission("delete", "organization"),
    OrganizationController.delete
);

router.get(
    "/:organizationId/members",
    RequiresOrgMember,
    RequiresPermission("read", "organization"),
    OrganizationController.members.list
);

router.use("/:organizationId/spaces", RequiresOrgMember, spacesRouter);

// The library of the organization, built by its owner.
router.use(
    "/:organizationId/library",
    RequiresOrgMember,
    RequiresLibraryOwner,
    libraryRouter
);

// The soundboard: every member uses the clips of the organization.
router.use(
    "/:organizationId/soundboard",
    RequiresOrgMember,
    organizationSoundboardRouter
);

// The Spotify app of the organization (owner) and the account of each member.
router.use(
    "/:organizationId/spotify",
    RequiresOrgMember,
    organizationSpotifyRouter
);

router.use(
    "/:organizationId/conversations",
    RequiresOrgMember,
    conversationsRouter
);

export const organizationsRouter = router;

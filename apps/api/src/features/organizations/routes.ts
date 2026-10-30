import { Router } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { RequiresOrgMember } from "@/middlewares/requiresOrgMember";
import { RequiresCreationAllowed } from "@/middlewares/requiresCreationAllowed";
import { RequiresPermission } from "@/middlewares/requiresPermission";
import { OrganizationController } from "./controllers";
import { spacesRouter } from "../spaces/routes";
import { conversationsRouter } from "../chat/routes";
import { organizationInviteLinksRouter } from "./invite-links/routes";
import { libraryRouter } from "../library/routes";
import { RequiresLibraryOwner } from "../library/middleware/requiresLibraryOwner";

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

router.use(
    "/:organizationId/conversations",
    RequiresOrgMember,
    conversationsRouter
);

export const organizationsRouter = router;

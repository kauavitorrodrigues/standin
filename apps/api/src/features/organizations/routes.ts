import { Router } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { RequiresOrgMember } from "@/middlewares/requiresOrgMember";
import { RequiresPermission } from "@/middlewares/requiresPermission";
import { OrganizationController } from "./controllers";
import { spacesRouter } from "../spaces/routes";
import { conversationsRouter } from "../chat/routes";

const router = Router();

router.use(RequiresAuth);

router.post(
    "/",
    RequiresPermission("create", "organization"),
    OrganizationController.create
);

router.get("/", OrganizationController.list);

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

router.use(
    "/:organizationId/conversations",
    RequiresOrgMember,
    conversationsRouter
);

export const organizationsRouter = router;

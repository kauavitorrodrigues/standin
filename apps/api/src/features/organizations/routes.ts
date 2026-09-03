import { Router } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { RequiresOrgMember, RequiresOrgOwner } from "@/middlewares/requiresOrgMember";
import { OrganizationController } from "./controllers";
import { spacesRouter } from "../spaces/routes";
import { mapsRouter } from "../maps/routes";
import { conversationsRouter } from "../chat/routes";

const router = Router();

router.use(RequiresAuth);

router.post("/", OrganizationController.create);
router.get("/", OrganizationController.list);
router.put(
    "/:organizationId",
    RequiresOrgMember,
    RequiresOrgOwner,
    OrganizationController.update,
);
router.delete(
    "/:organizationId",
    RequiresOrgMember,
    RequiresOrgOwner,
    OrganizationController.delete,
);

router.use("/:organizationId/spaces", RequiresOrgMember, spacesRouter);
router.use("/:organizationId/maps", RequiresOrgMember, mapsRouter);
router.use("/:organizationId/conversations", RequiresOrgMember, conversationsRouter);

export const organizationsRouter = router;

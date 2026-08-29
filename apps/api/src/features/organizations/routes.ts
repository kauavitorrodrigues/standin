import { Router } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { RequiresOrgMember, RequiresOrgOwner } from "@/middlewares/requiresOrgMember";
import { OrganizationController } from "./controllers";
import { spacesRouter } from "../spaces/routes";

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

export const organizationsRouter = router;

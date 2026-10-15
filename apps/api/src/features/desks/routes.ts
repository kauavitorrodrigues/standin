import { Router } from "express";
import { RequiresMapOwner } from "@/middlewares/requiresMapOwner";
import { RequiresSpaceAccess } from "@/middlewares/requiresSpaceAccess";
import { DeskController } from "./controllers";

const router = Router({ mergeParams: true });

router.use(RequiresSpaceAccess);

router.get("/", DeskController.list);
router.post("/:mapAssetId/claim", DeskController.claim);
router.delete("/:mapAssetId/claim", DeskController.release);
// Only the owner of the organization hands desks out.
router.post("/:mapAssetId/assign", RequiresMapOwner, DeskController.assign);

export const desksRouter = router;

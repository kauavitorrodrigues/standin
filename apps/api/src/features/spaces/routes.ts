import { Router } from "express";
import { SpaceController } from "./controllers";

const router = Router({ mergeParams: true });

router.post("/", SpaceController.create);
router.get("/", SpaceController.list);
router.get("/:spaceId", SpaceController.details);
router.put("/:spaceId", SpaceController.update);
router.delete("/:spaceId", SpaceController.delete);

export const spacesRouter = router;

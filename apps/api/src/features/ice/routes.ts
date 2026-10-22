import { Router } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { RequiresSpaceViewFromQuery } from "@/middlewares/requiresSpaceView";
import { IceController } from "./controllers";

const router = Router();

// Credentials for the TURN relay go only to who may be in the space: a member
// or an admitted guest, never a pending one.
router.get("/", RequiresAuth, RequiresSpaceViewFromQuery, IceController.get);

export const iceRouter = router;

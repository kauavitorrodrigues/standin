import { Router } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { IceController } from "./controllers";

const router = Router();

router.get("/", RequiresAuth, IceController.get);

export const iceRouter = router;

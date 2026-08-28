import { Router } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { AuthController } from "./controllers";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/signin", AuthController.signin);
router.get("/validate", RequiresAuth, AuthController.validate);

export const authRouter = router;

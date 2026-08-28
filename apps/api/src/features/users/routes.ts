import { Router } from "express";
import { RequiresAuth } from "@/middlewares/requiresAuth";
import { UserController } from "./controllers";

const router = Router();

router.put("/me", RequiresAuth, UserController.update);
router.delete("/me", RequiresAuth, UserController.delete);

export const usersRouter = router;

import express from "express";
import { authRouter } from "./features/auth/routes";
import { usersRouter } from "./features/users/routes";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);

export default router;

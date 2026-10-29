import { Router } from "express";
import { ROLES } from "@standin/contracts";
import { RequiresRole } from "@/middlewares/requiresRole";
import { ServiceTokenController } from "./controllers";

const router = Router();

// Mounted behind the plain `RequiresAuth`, which only takes a session, so a
// service token can never manage service tokens.
router.use(RequiresRole([ROLES.ADMIN]));

router.post("/", ServiceTokenController.create);
router.get("/", ServiceTokenController.list);
router.delete("/:id", ServiceTokenController.revoke);

export const serviceTokensRouter = router;

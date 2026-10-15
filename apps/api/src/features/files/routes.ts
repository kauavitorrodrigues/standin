import { Router } from "express";
import { serveFile } from "./controllers/serve";

// Files are served by id and carry no secret: the id is a uuid that is only
// known to whoever received the payload that mentions it.
const router = Router();

router.get("/:id", serveFile);

export const filesRouter = router;

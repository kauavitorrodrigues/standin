import type { z } from "zod/v4";
import type { UserSchema } from "../schemas/user.schema";

export type User = z.infer<typeof UserSchema>;

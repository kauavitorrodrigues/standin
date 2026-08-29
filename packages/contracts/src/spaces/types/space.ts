import type { z } from "zod/v4";
import type { SpaceSchema } from "../schemas/space.schema";

export type Space = z.infer<typeof SpaceSchema>;

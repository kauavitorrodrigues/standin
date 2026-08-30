import type { z } from "zod/v4";
import type { SpaceDetailsSchema } from "../schemas/space-details.schema";

export type SpaceDetails = z.infer<typeof SpaceDetailsSchema>;

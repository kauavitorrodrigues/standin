import type { z } from "zod/v4";
import type { MapSizeTierSchema } from "../schemas/map-size-tier.schema";

export type MapSizeTier = z.infer<typeof MapSizeTierSchema>;

import type { z } from "zod/v4";
import type { MapSchema } from "../schemas/map.schema";

export type MapEntity = z.infer<typeof MapSchema>;

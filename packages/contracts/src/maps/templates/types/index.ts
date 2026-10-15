import type { z } from "zod/v4";
import type { MapTemplateSchema } from "../schemas/map-template.schema";

export type MapTemplate = z.infer<typeof MapTemplateSchema>;

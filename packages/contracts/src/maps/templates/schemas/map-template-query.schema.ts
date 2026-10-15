import { z } from "zod/v4";
import { MapSizeTierSchema } from "../../schemas/map-size-tier.schema";

export const MapTemplatesQuerySchema = z.object({
    sizeTier: MapSizeTierSchema.optional(),
});

export type MapTemplatesQuerySchemaType = z.infer<
    typeof MapTemplatesQuerySchema
>;

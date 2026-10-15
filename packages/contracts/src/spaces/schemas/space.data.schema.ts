import { z } from "zod/v4";
import { MapSizeTierSchema } from "../../maps/schemas/map-size-tier.schema";
import { SpaceErrorMessages } from "./consts/error-messages";
import { SpaceUpdateSchema } from "./space.update.schema";

// A space starts either from a published template or from a blank map of the
// chosen size tier, never both.
export const SpaceDataSchema = SpaceUpdateSchema.extend({
    templateId: z
        .string({ error: SpaceErrorMessages.templateId.invalid })
        .min(1, { error: SpaceErrorMessages.templateId.invalid })
        .optional(),
    sizeTier: MapSizeTierSchema.optional(),
}).refine((data) => Boolean(data.templateId) !== Boolean(data.sizeTier), {
    error: SpaceErrorMessages.source.required,
    path: ["templateId"],
});

export type SpaceDataSchemaType = z.infer<typeof SpaceDataSchema>;

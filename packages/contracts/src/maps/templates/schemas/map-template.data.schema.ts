import { z } from "zod/v4";
import { MapSizeTierSchema } from "../../schemas/map-size-tier.schema";
import { MapTemplateErrorMessages } from "./consts/error-messages";
import {
    MAX_MAP_TEMPLATE_DESCRIPTION_LENGTH,
    MAX_MAP_TEMPLATE_NAME_LENGTH,
} from "./consts/fields";

export const MapTemplateUpdateSchema = z.object({
    name: z
        .string({ error: MapTemplateErrorMessages.name.required })
        .min(2, { error: MapTemplateErrorMessages.name.required })
        .max(MAX_MAP_TEMPLATE_NAME_LENGTH, {
            error: MapTemplateErrorMessages.name.max,
        }),
    description: z
        .string({ error: MapTemplateErrorMessages.description.invalid })
        .max(MAX_MAP_TEMPLATE_DESCRIPTION_LENGTH, {
            error: MapTemplateErrorMessages.description.max,
        })
        .nullish(),
});

export const MapTemplateDataSchema = MapTemplateUpdateSchema.extend({
    sizeTier: MapSizeTierSchema,
});

export type MapTemplateDataSchemaType = z.infer<typeof MapTemplateDataSchema>;
export type MapTemplateUpdateSchemaType = z.infer<
    typeof MapTemplateUpdateSchema
>;

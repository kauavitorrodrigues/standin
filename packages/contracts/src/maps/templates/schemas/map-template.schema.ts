import { z } from "zod/v4";
import { MapSizeTierSchema } from "../../schemas/map-size-tier.schema";
import { MAP_TEMPLATE_STATUSES } from "../enums/map-template-status";
import { MapTemplateErrorMessages } from "./consts/error-messages";

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

export const MapTemplateSchema = z.object({
    id: z.string({ error: MapTemplateErrorMessages.id.invalid }),
    name: z.string({ error: MapTemplateErrorMessages.name.required }),
    description: z
        .string({ error: MapTemplateErrorMessages.description.invalid })
        .nullable(),
    status: z.enum(MAP_TEMPLATE_STATUSES, {
        error: MapTemplateErrorMessages.status.invalid,
    }),
    // Null for a global template, the only kind that exists for now.
    organizationId: z
        .string({ error: MapTemplateErrorMessages.organizationId.invalid })
        .nullable(),
    mapId: z.string({ error: MapTemplateErrorMessages.mapId.invalid }),
    sizeTier: MapSizeTierSchema,
    width: int(MapTemplateErrorMessages.width.invalid),
    height: int(MapTemplateErrorMessages.height.invalid),
    thumbnailUrl: z
        .string({ error: MapTemplateErrorMessages.thumbnailUrl.invalid })
        .nullable(),
    createdAt: z.iso.datetime({
        error: MapTemplateErrorMessages.createdAt.invalid,
    }),
});

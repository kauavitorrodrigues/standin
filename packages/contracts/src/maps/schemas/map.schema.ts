import { z } from "zod/v4";
import { MapErrorMessages } from "./consts/error-messages";

export const MapSchema = z.object({
    id: z.string({ error: MapErrorMessages.id.invalid }),
    name: z.string({ error: MapErrorMessages.name.invalid }),
    width: z.number({ error: MapErrorMessages.width.invalid }),
    height: z.number({ error: MapErrorMessages.height.invalid }),
    tileSize: z.number({ error: MapErrorMessages.tileSize.invalid }),
    mapJsonFileId: z.string({ error: MapErrorMessages.mapJsonFileId.invalid }),
    thumbnailFileId: z
        .string({ error: MapErrorMessages.thumbnailFileId.invalid })
        .nullable(),
    organizationId: z.string().nullable(),
});

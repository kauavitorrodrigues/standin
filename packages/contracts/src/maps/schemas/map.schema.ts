import { z } from "zod/v4";
import { MapErrorMessages } from "./consts/error-messages";
import { MapSizeTierSchema } from "./map-size-tier.schema";

export const MapSchema = z.object({
    id: z.string({ error: MapErrorMessages.id.invalid }),
    width: z.number({ error: MapErrorMessages.width.invalid }),
    height: z.number({ error: MapErrorMessages.height.invalid }),
    tileSize: z.number({ error: MapErrorMessages.tileSize.invalid }),
    sizeTier: MapSizeTierSchema,
    layoutVersion: z.number({
        error: MapErrorMessages.layoutVersion.invalid,
    }),
});

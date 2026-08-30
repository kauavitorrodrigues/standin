import { z } from "zod/v4";
import { MapErrorMessages } from "./consts/error-messages";
import { MAX_MAP_NAME_LENGTH } from "./consts/fields";

export const MapDataSchema = z.object({
    name: z
        .string({ error: MapErrorMessages.name.required })
        .min(2, { error: MapErrorMessages.name.required })
        .max(MAX_MAP_NAME_LENGTH, { error: MapErrorMessages.name.max }),
    width: z
        .number({ error: MapErrorMessages.width.required })
        .int({ error: MapErrorMessages.width.invalid })
        .positive({ error: MapErrorMessages.width.positive }),
    height: z
        .number({ error: MapErrorMessages.height.required })
        .int({ error: MapErrorMessages.height.invalid })
        .positive({ error: MapErrorMessages.height.positive }),
    tileSize: z
        .number({ error: MapErrorMessages.tileSize.required })
        .int({ error: MapErrorMessages.tileSize.invalid })
        .positive({ error: MapErrorMessages.tileSize.positive }),
});

export type MapDataSchemaType = z.infer<typeof MapDataSchema>;

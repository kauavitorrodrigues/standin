import { z } from "zod/v4";
import { SpaceErrorMessages } from "./consts/error-messages";
import { MAX_SPACE_NAME_LENGTH } from "./consts/fields";
import { MapWithUrlsSchema } from "../../maps/schemas/map-with-urls.schema";

export const SpaceDetailsSchema = z.object({
    id: z.string({ error: SpaceErrorMessages.id.invalid }),
    conversationId: z.string({
        error: SpaceErrorMessages.conversationId.invalid,
    }),
    name: z
        .string({ error: SpaceErrorMessages.name.required })
        .min(2, { error: SpaceErrorMessages.name.required })
        .max(MAX_SPACE_NAME_LENGTH, { error: SpaceErrorMessages.name.max }),
    map: MapWithUrlsSchema,
});

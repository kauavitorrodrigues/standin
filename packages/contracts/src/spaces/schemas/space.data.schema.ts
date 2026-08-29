import { z } from "zod/v4";
import { SpaceErrorMessages } from "./consts/error-messages";
import { MAX_SPACE_NAME_LENGTH } from "./consts/fields";

export const SpaceDataSchema = z.object({
    name: z
        .string({ error: SpaceErrorMessages.name.required })
        .min(2, { error: SpaceErrorMessages.name.required })
        .max(MAX_SPACE_NAME_LENGTH, { error: SpaceErrorMessages.name.max }),
});

export type SpaceDataSchemaType = z.infer<typeof SpaceDataSchema>;

import { z } from "zod/v4";
import { SpaceErrorMessages } from "./consts/error-messages";
import { SpaceDataSchema } from "./space.data.schema";

export const SpaceSchema = SpaceDataSchema.extend({
    id: z.string({ error: SpaceErrorMessages.id.invalid }),
    organizationId: z.string(),
});

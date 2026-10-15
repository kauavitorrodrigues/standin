import { z } from "zod/v4";
import { SpaceErrorMessages } from "./consts/error-messages";
import { SpaceUpdateSchema } from "./space.update.schema";

export const SpaceSchema = SpaceUpdateSchema.extend({
    id: z.string({ error: SpaceErrorMessages.id.invalid }),
    organizationId: z.string({
        error: SpaceErrorMessages.organizationId.invalid,
    }),
    mapId: z.string({ error: SpaceErrorMessages.mapId.invalid }),
    createdAt: z.iso.datetime({ error: SpaceErrorMessages.createdAt.invalid }),
});

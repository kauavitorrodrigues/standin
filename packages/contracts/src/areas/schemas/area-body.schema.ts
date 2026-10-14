import { z } from "zod/v4";
import { StampSchema } from "../../maps/editor/schemas/stamp.schema";
import { AREA_NAME_MAX } from "../consts/limits";
import { AreaErrorMessages as Messages } from "./consts/error-messages";

// The `data` part of POST and PUT /library/areas.
export const AreaBodySchema = z.object({
    name: z
        .string({ error: Messages.name.invalid })
        .trim()
        .min(1, { error: Messages.name.invalid })
        .max(AREA_NAME_MAX, { error: Messages.name.invalid }),
    stamp: StampSchema,
});

// The body of PATCH /library/areas/:areaId.
export const AreaRenameBodySchema = AreaBodySchema.pick({ name: true });

export type AreaBody = z.infer<typeof AreaBodySchema>;
export type AreaRenameBody = z.infer<typeof AreaRenameBodySchema>;

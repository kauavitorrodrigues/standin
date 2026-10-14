import { z } from "zod/v4";
import { AREA_NAME_MAX } from "@standin/contracts";
import { AREA_VALIDATION_MESSAGES as Messages } from "../consts/messages";

export const AreaComposerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { error: Messages.NAME_REQUIRED })
        .max(AREA_NAME_MAX, { error: Messages.NAME_TOO_LONG }),
    createZone: z.boolean(),
});

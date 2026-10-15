import { z } from "zod/v4";
import {
    STAMP_MAX_HEIGHT,
    STAMP_MAX_WIDTH,
    STAMP_MIN_SIZE,
} from "@standin/contracts";
import { AREA_VALIDATION_MESSAGES as Messages } from "../consts/messages";

// The size of a new area: whole tiles, within what a stamp can hold.
export const NewAreaSchema = z.object({
    width: z
        .number({ error: Messages.WIDTH_RANGE })
        .int({ error: Messages.WIDTH_RANGE })
        .min(STAMP_MIN_SIZE, { error: Messages.WIDTH_RANGE })
        .max(STAMP_MAX_WIDTH, { error: Messages.WIDTH_RANGE }),
    height: z
        .number({ error: Messages.HEIGHT_RANGE })
        .int({ error: Messages.HEIGHT_RANGE })
        .min(STAMP_MIN_SIZE, { error: Messages.HEIGHT_RANGE })
        .max(STAMP_MAX_HEIGHT, { error: Messages.HEIGHT_RANGE }),
});

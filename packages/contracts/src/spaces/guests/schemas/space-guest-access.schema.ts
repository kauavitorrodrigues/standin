import { z } from "zod/v4";
import { SpaceGuestErrorMessages } from "./consts/error-messages";
import { SPACE_GUEST_ACCESS } from "../consts";

export const SpaceGuestAccessSchema = z.object({
    guestAccess: z.enum(SPACE_GUEST_ACCESS, {
        error: SpaceGuestErrorMessages.guestAccess.invalid,
    }),
});

export type SpaceGuestAccessSchemaType = z.infer<typeof SpaceGuestAccessSchema>;

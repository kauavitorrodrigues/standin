import { z } from "zod/v4";
import { SpaceGuestErrorMessages } from "./consts/error-messages";
import { GUEST_VALIDITY_OPTIONS_HOURS } from "../consts";

// The one link of the space, with its token: the hosts copy it any time.
export const SpaceFixedLinkSchema = z.object({
    id: z.string(),
    spaceId: z.string(),
    token: z.string(),
    guestValidityHours: z.number().int().nullable(),
    createdAt: z.iso.datetime(),
});

// How long an admitted guest keeps the access. Null: until a host ends it.
export const SpaceGuestValidityUpdateSchema = z.object({
    guestValidityHours: z
        .number({ error: SpaceGuestErrorMessages.validity.invalid })
        .int({ error: SpaceGuestErrorMessages.validity.invalid })
        .refine(
            (hours) =>
                (GUEST_VALIDITY_OPTIONS_HOURS as readonly number[]).includes(
                    hours
                ),
            { error: SpaceGuestErrorMessages.validity.invalid }
        )
        .nullable(),
});

export type SpaceGuestValidityUpdateInput = z.infer<
    typeof SpaceGuestValidityUpdateSchema
>;

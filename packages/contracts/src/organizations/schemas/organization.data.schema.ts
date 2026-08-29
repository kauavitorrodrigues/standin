import { z } from "zod/v4";
import { OrganizationErrorMessages } from "./consts/error-messages";
import { MAX_ORGANIZATION_NAME_LENGTH } from "./consts/fields";

export const OrganizationDataSchema = z.object({
    name: z
        .string({ error: OrganizationErrorMessages.name.required })
        .min(2, { error: OrganizationErrorMessages.name.required })
        .max(MAX_ORGANIZATION_NAME_LENGTH, {
            error: OrganizationErrorMessages.name.max,
        }),
});

export type OrganizationDataSchemaType = z.infer<typeof OrganizationDataSchema>;

import { z } from "zod/v4";
import { OrganizationErrorMessages } from "./consts/error-messages";
import { OrganizationDataSchema } from "./organization.data.schema";

export const OrganizationSchema = OrganizationDataSchema.extend({
    id: z.string({ error: OrganizationErrorMessages.id.invalid }),
    slug: z.string(),
    ownerId: z.string(),
});
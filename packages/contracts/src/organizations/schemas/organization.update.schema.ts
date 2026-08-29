import { z } from "zod/v4";
import { OrganizationDataSchema } from "./organization.data.schema";

export const OrganizationUpdateSchema = OrganizationDataSchema.pick({
    name: true,
});

export type OrganizationUpdateSchemaType = z.infer<
    typeof OrganizationUpdateSchema
>;
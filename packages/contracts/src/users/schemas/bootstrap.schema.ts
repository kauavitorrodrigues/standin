import { z } from "zod/v4";
import { normalizeEmail } from "../../__shared__";
import { OrganizationDataSchema } from "../../organizations/schemas/organization.data.schema";
import { UserDataSchema } from "./user.data.schema";

export const DEFAULT_BOOTSTRAP_ADMIN_NAME = "Admin";
export const DEFAULT_BOOTSTRAP_ORGANIZATION_NAME = "Standin";

// What the first install takes. Same rules as the sign up for the email, name
// and password, and the defaults live here so every caller gets the same ones.
// Without a password the service generates one.
export const BootstrapInputSchema = z.object({
    email: z
        .string()
        .transform(normalizeEmail)
        .pipe(UserDataSchema.shape.email),
    password: UserDataSchema.shape.password.optional(),
    name: UserDataSchema.shape.name.default(DEFAULT_BOOTSTRAP_ADMIN_NAME),
    organizationName: OrganizationDataSchema.shape.name.default(
        DEFAULT_BOOTSTRAP_ORGANIZATION_NAME
    ),
});

export type BootstrapInput = z.input<typeof BootstrapInputSchema>;
export type BootstrapData = z.output<typeof BootstrapInputSchema>;

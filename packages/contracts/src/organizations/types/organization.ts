import type { z } from "zod/v4";
import type { OrganizationSchema } from "../schemas/organization.schema";

export type Organization = z.infer<typeof OrganizationSchema>;

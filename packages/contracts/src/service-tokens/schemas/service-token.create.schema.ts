import { z } from "zod/v4";
import { SERVICE_TOKEN_SCOPES } from "../consts/scopes";
import { SERVICE_TOKEN_NAME_MAX_LENGTH } from "../consts/token";

export const ServiceTokenCreateSchema = z.object({
    name: z.string().trim().min(1).max(SERVICE_TOKEN_NAME_MAX_LENGTH),
    scopes: z.array(z.enum(SERVICE_TOKEN_SCOPES)).min(1),
    expiresAt: z.iso
        .datetime()
        .transform((value) => new Date(value))
        .refine((date) => date.getTime() > Date.now(), {
            message: "The expiry must be in the future.",
        })
        .optional(),
});

export type ServiceTokenCreateInput = z.infer<typeof ServiceTokenCreateSchema>;

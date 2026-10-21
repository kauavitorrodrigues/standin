import { z } from "zod/v4";

export const EmailListSchema = z.array(
    z.object({
        email: z.string(),
        primary: z.boolean(),
        verified: z.boolean(),
    })
);

export type EmailListResponse = z.infer<typeof EmailListSchema>;

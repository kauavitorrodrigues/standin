import { z } from "zod/v4";

// GitHub answers 200 with an `error` field when the code is wrong, so only a
// body with a token counts as success.
export const TokenResponseSchema = z.object({
    access_token: z.string().min(1),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;

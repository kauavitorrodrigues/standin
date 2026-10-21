import { z } from "zod";

// The login page reads `?error=` after a failed sign in with a provider. A
// value of another shape is dropped instead of failing the route, since the
// URL can be hand-typed.
export const authSearchSchema = z.object({
    error: z.string().optional().catch(undefined),
});

export type AuthSearch = z.infer<typeof authSearchSchema>;

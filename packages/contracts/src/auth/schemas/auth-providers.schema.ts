import { z } from "zod/v4";

// Which login providers the instance has turned on.
export const AuthProvidersSchema = z.object({
    github: z.boolean(),
});

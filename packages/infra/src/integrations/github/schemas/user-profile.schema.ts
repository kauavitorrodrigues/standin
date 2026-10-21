import { z } from "zod/v4";

// The part of `GET /user` the sign in reads. The `email` of that endpoint is
// left out on purpose, it can be empty or not verified.
export const UserProfileSchema = z.object({
    id: z.number().int().positive(),
    login: z.string().min(1),
    name: z.string().nullish(),
    avatar_url: z.string().nullish(),
});

export type UserProfileResponse = z.infer<typeof UserProfileSchema>;

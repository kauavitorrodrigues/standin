import { z } from "zod";
import { AVATAR_NEW_KINDS } from "../consts/avatarNew";

// Anything unrecognised is dropped instead of failing the route, since the URL
// can be hand-typed or come from an old link. Without a kind the page asks
// what to create. `partId` only matters for a new color.
export const avatarNewSearchSchema = z.object({
    kind: z.enum(Object.values(AVATAR_NEW_KINDS)).optional().catch(undefined),
    partId: z.string().min(1).optional().catch(undefined),
});

export type AvatarNewSearch = z.infer<typeof avatarNewSearchSchema>;

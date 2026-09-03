import { z } from "zod/v4";
import { UserErrorMessages } from "./consts/error-messages";

export const UserSummarySchema = z.object({
    id: z.string({ error: UserErrorMessages.id.invalid }),
    name: z.string(),
    avatarUrl: z.string().nullable(),
});

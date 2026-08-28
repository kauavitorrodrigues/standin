import { z } from "zod/v4";
import { UserErrorMessages } from "./consts/error-messages";
import { UserDataSchema } from "./user.data.schema";

export const UserSchema = UserDataSchema.omit({ password: true }).extend({
    id: z.string({ error: UserErrorMessages.id.invalid }),
});

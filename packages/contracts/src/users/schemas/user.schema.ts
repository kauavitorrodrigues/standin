import { z } from "zod/v4";
import { UserErrorMessages } from "./consts/error-messages";
import { USER_ROLES } from "../enums/user-role";
import { UserDataSchema } from "./user.data.schema";

export const UserSchema = UserDataSchema.omit({ password: true }).extend({
    id: z.string({ error: UserErrorMessages.id.invalid }),
    role: z.enum(USER_ROLES),
    profilePictureUrl: z.string().nullable(),
});

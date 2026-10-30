import { z } from "zod/v4";
import { UserErrorMessages } from "./consts/error-messages";
import { MAX_USER_EMAIL_LENGTH, MAX_USER_NAME_LENGTH } from "./consts/fields";
import { PasswordSchema } from "../../auth/schemas/password.schema";

export const UserDataSchema = z.object({
    name: z
        .string({ error: UserErrorMessages.name.required })
        .min(2, { error: UserErrorMessages.name.required })
        .max(MAX_USER_NAME_LENGTH, { error: UserErrorMessages.name.max }),
    email: z
        .email({ error: UserErrorMessages.email.invalid })
        .max(MAX_USER_EMAIL_LENGTH, { error: UserErrorMessages.email.max }),
    password: PasswordSchema,
});

export type UserDataSchemaType = z.infer<typeof UserDataSchema>;

// Sign up through the link of an organization. Kept apart from `UserDataSchema`
// because the rest of the code creates users without a link.
export const SignUpSchema = UserDataSchema.extend({
    inviteToken: z.string().min(1).max(200).optional(),
});

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

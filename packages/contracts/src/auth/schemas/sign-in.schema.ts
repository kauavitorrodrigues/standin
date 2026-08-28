import { z } from "zod/v4";
import { AuthErrorMessages } from "./consts/error-messages";

export const SignInSchema = z.object({
    email: z
        .email({ error: AuthErrorMessages.email.required })
        .nonempty({ message: AuthErrorMessages.email.required }),
    password: z
        .string({ message: AuthErrorMessages.password.required })
        .nonempty({ message: AuthErrorMessages.password.required }),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;

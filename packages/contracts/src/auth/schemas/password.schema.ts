import { z } from "zod/v4";
import { AuthErrorMessages } from "./consts/error-messages";
import {
    COMMON_SEQUENCES,
    MAX_PASSWORD_LENGTH,
    MIN_PASSWORD_LENGTH,
    SEQUENTIAL_PATTERNS,
    countCharacterTypes,
} from "./consts/fields";

export const PasswordSchema = z
    .string({ error: AuthErrorMessages.password.required })
    .min(MIN_PASSWORD_LENGTH, AuthErrorMessages.password.min)
    .max(MAX_PASSWORD_LENGTH, AuthErrorMessages.password.max)
    .refine((pass) => {
        const lowerPass = pass.toLowerCase();
        return (
            !SEQUENTIAL_PATTERNS.some((pattern) => lowerPass.includes(pattern)) &&
            !COMMON_SEQUENCES.some((seq) => lowerPass.includes(seq))
        );
    }, AuthErrorMessages.password.sequential)
    .refine((pass) => countCharacterTypes(pass) >= 3, {
        error: AuthErrorMessages.password.invalid,
    });

import { randomBytes } from "node:crypto";
import { PasswordSchema } from "@standin/contracts";

const GENERATED_PASSWORD_LENGTH = 24;

// URL-safe random characters. A draw that trips the sign up rules (a
// sequence like "abc" or too few kinds of character) is thrown away, which
// is rare at this length.
export const generatePassword = (): string => {
    for (;;) {
        const candidate = randomBytes(GENERATED_PASSWORD_LENGTH)
            .toString("base64url")
            .slice(0, GENERATED_PASSWORD_LENGTH);
        if (PasswordSchema.safeParse(candidate).success) return candidate;
    }
};

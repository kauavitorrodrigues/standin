import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./fields";

export const AuthErrorMessages = {
    email: {
        required: "The email is required.",
    },
    password: {
        required: "The password is required.",
        invalid:
            "The password must contain at least 3 types: lowercase letters, uppercase letters, numbers and symbols.",
        min: `The password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        max: `The password cannot be longer than ${MAX_PASSWORD_LENGTH} characters.`,
        sequential: "The password cannot contain obvious sequences.",
    },
    credentials: {
        invalid: "Invalid email or password.",
    },
};

import { MAX_USER_EMAIL_LENGTH, MAX_USER_NAME_LENGTH } from "./fields";

export const UserErrorMessages = {
    id: {
        invalid: "The user ID is invalid.",
    },
    name: {
        required: "The user name is required.",
        max: `The user name cannot be longer than ${MAX_USER_NAME_LENGTH} characters.`,
    },
    email: {
        invalid: "The user email is invalid.",
        max: `The email cannot be longer than ${MAX_USER_EMAIL_LENGTH} characters.`,
    },
};

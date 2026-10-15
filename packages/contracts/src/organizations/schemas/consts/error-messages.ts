import { MAX_ORGANIZATION_NAME_LENGTH } from "./fields";

export const OrganizationErrorMessages = {
    id: {
        invalid: "The organization ID is invalid.",
    },
    name: {
        required: "The organization name is required.",
        max: `The organization name cannot be longer than ${MAX_ORGANIZATION_NAME_LENGTH} characters.`,
    },
};

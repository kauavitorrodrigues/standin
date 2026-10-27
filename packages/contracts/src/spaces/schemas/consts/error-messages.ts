import { MAX_SPACE_NAME_LENGTH } from "./fields";

export const SpaceErrorMessages = {
    id: {
        invalid: "The space ID is invalid.",
    },
    conversationId: {
        invalid: "The space conversation ID is invalid.",
    },
    name: {
        required: "The space name is required.",
        max: `The space name cannot be longer than ${MAX_SPACE_NAME_LENGTH} characters.`,
    },
    organizationId: {
        invalid: "The space organization ID is invalid.",
    },
    settings: {
        invalid: "A space setting must be true or false.",
    },
    mapId: {
        invalid: "The space map ID is invalid.",
    },
    templateId: {
        invalid: "The space template ID is invalid.",
    },
    createdAt: {
        invalid: "The space creation date is invalid.",
    },
    source: {
        required: "Choose a template or a size for the space.",
    },
};

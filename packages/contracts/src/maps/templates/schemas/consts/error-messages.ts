import {
    MAX_MAP_TEMPLATE_DESCRIPTION_LENGTH,
    MAX_MAP_TEMPLATE_NAME_LENGTH,
} from "./fields";

export const MapTemplateErrorMessages = {
    id: {
        invalid: "The template ID is invalid.",
    },
    name: {
        required: "The template name is required.",
        max: `The template name cannot be longer than ${MAX_MAP_TEMPLATE_NAME_LENGTH} characters.`,
    },
    description: {
        invalid: "The template description is invalid.",
        max: `The template description cannot be longer than ${MAX_MAP_TEMPLATE_DESCRIPTION_LENGTH} characters.`,
    },
    status: {
        invalid: "The template status is invalid.",
    },
    organizationId: {
        invalid: "The template organization ID is invalid.",
    },
    mapId: {
        invalid: "The template map ID is invalid.",
    },
    width: {
        invalid: "The template width is invalid.",
    },
    height: {
        invalid: "The template height is invalid.",
    },
    thumbnailUrl: {
        invalid: "The template thumbnail URL is invalid.",
    },
    createdAt: {
        invalid: "The template creation date is invalid.",
    },
};

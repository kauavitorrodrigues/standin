import { MAX_ORGANIZATION_NAME_LENGTH } from "./fields";

export const OrganizationErrorMessages = {
    id: {
        invalid: "O ID da organização é inválido.",
    },
    name: {
        required: "O nome da organização é obrigatório.",
        max: `O nome da organização não pode ter mais de ${MAX_ORGANIZATION_NAME_LENGTH} caracteres.`,
    },
};

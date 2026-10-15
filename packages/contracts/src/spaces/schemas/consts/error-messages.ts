import { MAX_SPACE_NAME_LENGTH } from "./fields";

export const SpaceErrorMessages = {
    id: {
        invalid: "O ID do espaço é inválido.",
    },
    conversationId: {
        invalid: "O ID da conversa do espaço é inválido.",
    },
    name: {
        required: "O nome do espaço é obrigatório.",
        max: `O nome do espaço não pode ter mais de ${MAX_SPACE_NAME_LENGTH} caracteres.`,
    },
    organizationId: {
        invalid: "O ID da organização do espaço é inválido.",
    },
    mapId: {
        invalid: "O ID do mapa do espaço é inválido.",
    },
    templateId: {
        invalid: "O ID do template do espaço é inválido.",
    },
    createdAt: {
        invalid: "A data de criação do espaço é inválida.",
    },
    source: {
        required: "Escolha um template ou um tamanho para o espaço.",
    },
};

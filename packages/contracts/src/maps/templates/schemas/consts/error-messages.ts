import {
    MAX_MAP_TEMPLATE_DESCRIPTION_LENGTH,
    MAX_MAP_TEMPLATE_NAME_LENGTH,
} from "./fields";

export const MapTemplateErrorMessages = {
    id: {
        invalid: "O ID do template é inválido.",
    },
    name: {
        required: "O nome do template é obrigatório.",
        max: `O nome do template não pode ter mais de ${MAX_MAP_TEMPLATE_NAME_LENGTH} caracteres.`,
    },
    description: {
        invalid: "A descrição do template é inválida.",
        max: `A descrição do template não pode ter mais de ${MAX_MAP_TEMPLATE_DESCRIPTION_LENGTH} caracteres.`,
    },
    status: {
        invalid: "O status do template é inválido.",
    },
    organizationId: {
        invalid: "O ID da organização do template é inválido.",
    },
    mapId: {
        invalid: "O ID do mapa do template é inválido.",
    },
    width: {
        invalid: "A largura do template é inválida.",
    },
    height: {
        invalid: "A altura do template é inválida.",
    },
    thumbnailUrl: {
        invalid: "A URL da miniatura do template é inválida.",
    },
    createdAt: {
        invalid: "A data de criação do template é inválida.",
    },
};

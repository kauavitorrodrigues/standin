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
    mapId: {
        required: "Selecione um mapa para o espaço.",
    },
};

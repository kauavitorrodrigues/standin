import { MAX_USER_EMAIL_LENGTH, MAX_USER_NAME_LENGTH } from "./fields";

export const UserErrorMessages = {
    id: {
        invalid: "O ID do usuário é inválido.",
    },
    name: {
        required: "O nome do usuário é obrigatório.",
        max: `O nome do usuário não pode ter mais de ${MAX_USER_NAME_LENGTH} caracteres.`,
    },
    email: {
        invalid: "O e-mail do usuário é inválido.",
        max: `O e-mail não pode ter mais de ${MAX_USER_EMAIL_LENGTH} caracteres.`,
    },
};

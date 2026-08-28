import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./fields";

export const AuthErrorMessages = {
    email: {
        required: "O e-mail é obrigatório.",
    },
    password: {
        required: "A senha é obrigatória.",
        invalid: "A senha deve conter ao menos 3 tipos: letras minúsculas, maiúsculas, números e símbolos.",
        min: `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
        max: `A senha não pode ter mais de ${MAX_PASSWORD_LENGTH} caracteres.`,
        sequential: "A senha não pode conter sequências óbvias.",
    },
    credentials: {
        invalid: "E-mail ou senha inválidos.",
    },
};

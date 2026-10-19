import {
    AVATAR_COLOR_KEY_MAX_LENGTH,
    AVATAR_PART_MAX_BYTES,
    AVATAR_SHEET_PX,
} from "@standin/contracts";

const BYTES_IN_KB = 1024;

// What the user is told when something goes wrong with an avatar part. The
// success of an action is not announced, the list just changes.
export const AVATAR_PART_MESSAGES = {
    CREATE_FAILED: "Não foi possível criar a peça.",
    UPDATE_FAILED: "Não foi possível atualizar a peça.",
    REPLACE_FRONT_FAILED: "Não foi possível trocar o sprite.",
    CREATE_VARIATION_FAILED: "Não foi possível criar a variação de cor.",
    REPLACE_PREVIEW_FAILED:
        "Não foi possível salvar a imagem de pré-visualização.",
    DELETE_FAILED: "Não foi possível excluir a peça.",
} as const;

export const AVATAR_CATEGORY_MESSAGES = {
    UPDATE_FAILED: "Não foi possível atualizar a categoria.",
    REPLACE_PREVIEW_FAILED: "Não foi possível salvar a imagem da categoria.",
    REMOVE_PREVIEW_FAILED: "Não foi possível remover a imagem da categoria.",
} as const;

export const AVATAR_BASE_MESSAGES = {
    CREATE_FAILED: "Não foi possível criar a base.",
    UPDATE_FAILED: "Não foi possível atualizar a base.",
    SET_DEFAULT_FAILED: "Não foi possível tornar a base a padrão.",
    REPLACE_IMAGE_FAILED: "Não foi possível trocar o sprite da base.",
    REPLACE_PREVIEW_FAILED: "Não foi possível salvar a imagem da base.",
    REMOVE_PREVIEW_FAILED: "Não foi possível remover a imagem da base.",
    DELETE_FAILED: "Não foi possível excluir a base.",
} as const;

// What the forms of a part tell the user about their own fields.
export const AVATAR_PART_VALIDATION_MESSAGES = {
    NAME_REQUIRED: "Informe o nome da peça.",
    CATEGORY_NAME_REQUIRED: "Informe o nome da categoria.",
    BASE_NAME_REQUIRED: "Informe o nome da base.",
    SORT_ORDER_INVALID: "Informe um número inteiro, a partir de 0.",
    COLOR_KEY_REQUIRED: "Informe o nome da cor.",
    COLOR_KEY_TOO_LONG: `O nome da cor aceita até ${AVATAR_COLOR_KEY_MAX_LENGTH} caracteres.`,
    COLOR_HEX_REQUIRED: "Escolha a cor.",
    COLOR_HEX_INVALID: "A cor precisa estar no formato #RRGGBB.",
    PREVIEW_REQUIRED: "Escolha a imagem.",
    PREVIEW_NOT_PNG: "O arquivo não é um PNG válido.",
    PREVIEW_TOO_LARGE: `A imagem passa do limite de ${AVATAR_PART_MAX_BYTES / BYTES_IN_KB} KB.`,
    FRONT_REQUIRED: "Escolha o PNG da frente.",
    SHEET_REQUIRED: "Escolha o PNG.",
    NOT_PNG: "O arquivo não é um PNG válido.",
    NOT_RGBA: "O PNG precisa ter transparência (RGBA de 8 bits).",
    TOO_LARGE: `O arquivo passa do limite de ${AVATAR_PART_MAX_BYTES / BYTES_IN_KB} KB.`,
    WRONG_SIZE: `O PNG precisa ter exatamente ${AVATAR_SHEET_PX.w} x ${AVATAR_SHEET_PX.h} px.`,
} as const;

// What the API answers, by error code, in the words of the page.
export const AVATAR_PART_ERROR_MESSAGES = {
    AVATAR_PART_NOT_FOUND: "A peça não existe mais.",
    AVATAR_PART_KEY_TAKEN: "Já existe uma peça com esta chave.",
    AVATAR_VARIATION_COLOR_TAKEN: "Esta peça já tem uma variação com esta cor.",
    AVATAR_VARIATION_INVALID:
        "Só uma peça base, que já tenha cor, recebe variações.",
    AVATAR_PREVIEW_INVALID: "A imagem precisa ser um PNG.",
    AVATAR_CATEGORY_NOT_FOUND: "A categoria não existe mais.",
    AVATAR_BASE_NOT_FOUND: "A base não existe mais.",
    AVATAR_BASE_INVALID: "A base é inválida.",
    AVATAR_BASE_KEY_TAKEN: "Já existe uma base com esta chave.",
    AVATAR_BASE_DEFAULT_DELETE:
        "A base padrão não pode ser excluída. Torne outra a padrão antes.",
    AVATAR_SHEET_INVALID_SIZE: `O PNG precisa ter exatamente ${AVATAR_SHEET_PX.w} x ${AVATAR_SHEET_PX.h} px.`,
    AVATAR_SHEET_INVALID_FORMAT:
        "O arquivo precisa ser um PNG com transparência (RGBA).",
    AVATAR_SHEET_TOO_LARGE: `O arquivo passa do limite de ${AVATAR_PART_MAX_BYTES / BYTES_IN_KB} KB.`,
} as const;

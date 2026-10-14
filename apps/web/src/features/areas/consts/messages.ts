// What the user is told after something happens to an area.
export const AREA_MESSAGES = {
    CREATED: "Área criada.",
    CREATE_FAILED: "Não foi possível criar a área.",
    LIST_FAILED: "Não foi possível carregar as áreas.",
    LOAD_FAILED: "Não foi possível carregar a área.",
    RENAMED: "Área renomeada.",
    RENAME_FAILED: "Não foi possível renomear a área.",
    DELETED: "Área apagada.",
    DELETE_FAILED: "Não foi possível apagar a área.",
} as const;

// What a field of a form says when its value is not accepted.
export const AREA_VALIDATION_MESSAGES = {
    NAME_REQUIRED: "Informe o nome da área.",
} as const;

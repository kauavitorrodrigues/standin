import {
    AREA_NAME_MAX,
    STAMP_MAX_HEIGHT,
    STAMP_MAX_OBJECTS,
    STAMP_MAX_WIDTH,
    STAMP_MIN_SIZE,
} from "@standin/contracts";

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
    SAVED: "Área salva.",
    SAVE_FAILED: "Não foi possível salvar a área.",
    THUMBNAIL_FAILED: "Não foi possível gerar a miniatura da área.",
    STAMP_UNAVAILABLE:
        "A área usa itens que não estão mais disponíveis na biblioteca.",
} as const;

// What a field of a form says when its value is not accepted.
export const AREA_VALIDATION_MESSAGES = {
    NAME_REQUIRED: "Informe o nome da área.",
    NAME_TOO_LONG: `O nome pode ter até ${AREA_NAME_MAX} caracteres.`,
} as const;

// What the list of problems of the frame says for each code the capture can
// answer. A code that is not here shows the message the contracts carry.
export const AREA_ISSUE_MESSAGES = {
    STAMP_TOO_SMALL: `O quadro precisa ter pelo menos ${STAMP_MIN_SIZE} x ${STAMP_MIN_SIZE} tiles.`,
    STAMP_TOO_LARGE: `O quadro pode ter no máximo ${STAMP_MAX_WIDTH} x ${STAMP_MAX_HEIGHT} tiles.`,
    STAMP_EMPTY: "O quadro está vazio. Pinte tiles ou coloque objetos nele.",
    STAMP_TOO_MANY_OBJECTS: `O quadro pode ter no máximo ${STAMP_MAX_OBJECTS} objetos.`,
    STAMP_OBJECT_CROSSES_EDGE:
        "Um objeto está cortado pela borda do quadro. Ele aparece em vermelho.",
    STAMP_PARENT_OUTSIDE:
        "Um objeto sobre uma superfície ficou sem a superfície dentro do quadro.",
    STAMP_ASSET_UNAVAILABLE:
        "Um objeto do quadro não está mais disponível na biblioteca.",
    STAMP_TILESET_UNAVAILABLE:
        "Um tile do quadro não está mais disponível na biblioteca.",
} as const;

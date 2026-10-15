// What the form of a tileset says when a field is wrong, before anything is
// sent.
export const TILESET_VALIDATION_MESSAGES = {
    REQUIRED: "Campo obrigatório.",
    IMAGE_REQUIRED: "Envie o PNG do tileset.",
    GRID_MISMATCH:
        "A imagem não divide em células de 32 px com essa margem e esse espaçamento.",
} as const;

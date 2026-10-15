// What the user is told after something happens to an asset.
export const ASSET_MESSAGES = {
    VARIANT_CREATED: "Variação criada.",
    VARIANT_CREATE_FAILED: "Não foi possível criar a variação.",
    ASSET_DELETED: "Asset apagado.",
    FAMILY_DELETED: "Família apagada.",
    DELETE_FAILED: "Não foi possível apagar o asset.",
} as const;

// What the forms of an asset tell the user once they were sent.
export const ASSET_FORM_MESSAGES = {
    CREATED: "Asset criado.",
    CREATE_FAILED: "Não foi possível criar o asset.",
    UPDATED: "Asset atualizado.",
    UPDATE_FAILED: "Não foi possível atualizar o asset.",
    IMAGE_REPLACED: "Imagem trocada.",
    IMAGE_REPLACE_FAILED: "Não foi possível trocar a imagem.",
    COLOR_UPDATED: "Cor atualizada.",
    COLOR_UPDATE_FAILED: "Não foi possível atualizar a cor.",
} as const;

// What the collision painter tells the user when it reads the drawing.
export const SOLID_DETECT_MESSAGES = {
    EMPTY: "Nenhuma célula do desenho ficou sólida. A colisão anterior foi mantida.",
    FAILED: "Não foi possível ler o desenho para detectar a colisão.",
} as const;

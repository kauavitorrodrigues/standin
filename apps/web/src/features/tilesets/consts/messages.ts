// What the user is told after something happens to a tileset.
export const TILESET_MESSAGES = {
    CREATED: "Tileset criado.",
    CREATE_FAILED: "Não foi possível criar o tileset.",
    RENAMED: "Tileset renomeado.",
    RENAME_FAILED: "Não foi possível renomear o tileset.",
    DELETED: "Tileset apagado.",
    DELETE_FAILED: "Não foi possível apagar o tileset.",
    TILE_META_SAVED: "Categorias salvas.",
    TILE_META_SAVE_FAILED: "Não foi possível salvar as categorias.",
    GRID_AND_TILE_META_SAVED: "Grade e categorias salvas.",
    GRID_SAVED: "Grade atualizada.",
    GRID_SAVE_FAILED: "Não foi possível atualizar a grade.",
    WALL_STYLE_INCOMPLETE: "Estilo de parede incompleto",
    WALL_STYLE_MISSING: "faltam as peças",
    WALL_STYLE_NAME_REQUIRED: "Dê um nome ao estilo.",
    WALL_STYLE_FILES_REQUIRED: "Suba as 8 peças ou a tira com todas.",
    WALL_STYLE_STRIP_SIZE:
        "A tira precisa ter 256 x 64 px: 8 colunas e 2 linhas de tiles de 32 px.",
    WALL_STYLE_READ_FAILED: "Não foi possível ler as imagens.",
    WALL_STYLE_PIECE_REQUIRED: (names: readonly string[]) =>
        `Escolha a peça de: ${names.join(", ")}.`,
} as const;

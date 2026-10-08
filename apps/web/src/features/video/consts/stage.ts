export const VIDEO_STAGE_LABELS = {
    self: "Você",
    unknownPerson: "Alguém",
    screenSuffix: "(tela)",
} as const;

export const SCREEN_SHARE_BUTTON_LABELS = {
    start: "Compartilhar tela",
    stop: "Parar de compartilhar",
    needsSomeoneNearby: "Chegue perto de alguém para compartilhar a tela",
} as const;

export const SELF_PREVIEW_LABELS = {
    open: "Ver prévia da câmera",
    title: "Prévia da câmera",
} as const;

export const MAX_VISIBLE_STAGE_TILES = 4;

export const STAGE_OVERFLOW_LABELS = {
    open: "Ver todos",
    // Only the dialog's accessible name: it shows cameras, avatars and
    // screen shares, so no visible heading tries to name them all.
    title: "Participantes e transmissões",
    close: "Fechar",
    expand: "Ampliar",
} as const;

export const TILE_GRID_ASPECT_RATIO = 16 / 9;
export const TILE_GRID_GAP_PX = 12;
export const TILE_GRID_WIDTH_TOLERANCE = 0.85;

import { ZONE_AREA_MIN_TILES } from "@standin/contracts";

export const DRAFT_DB_MESSAGES = {
    UNAVAILABLE: "Map draft storage is unavailable",
} as const;

export const EDITOR_MESSAGES = {
    PUBLISHED: "Publicado",
    PUBLISH_FAILED: "Não foi possível publicar o mapa",
    MAP_CHANGED:
        "O mapa foi alterado por outra pessoa. Recarregue para continuar",
    LOCK_LOST: "Você perdeu a edição deste mapa",
    LOCK_GRANTED:
        "Ninguém mais pode editar nem usar as mesas até você sair do editor",
    LOCK_GRANTED_CONFIRM: "Entendi",
    LOCK_HOLDER_FALLBACK: "outra pessoa",
    LOCK_RESUMED: "Edição retomada, seu rascunho está intacto",
    LOCK_RECOVERY_FAILED:
        "Não foi possível retomar a edição. Seu rascunho continua salvo",
    RESUME_FAILED: "Não foi possível retomar o rascunho, ele foi descartado",
    RELOAD_FAILED: "Não foi possível recarregar o mapa",
    INVALID_CHANGES:
        "Algumas alterações são inválidas e não puderam ser publicadas",
} as const;

// Diagnostics of the map photo. They go to the console, never to the user,
// because a failed photo must not get in the way of editing.
export const THUMBNAIL_MESSAGES = {
    CAPTURE_FAILED: "Map thumbnail could not be captured",
    ENCODE_FAILED: "Map thumbnail could not be encoded",
    SAVE_FAILED: "Map thumbnail could not be saved",
} as const;

// Diagnostics of the link between the draft and the scene. They go to the
// console, because a failed redraw must not stop the next one.
export const SCENE_SYNC_MESSAGES = {
    OBJECTS_FAILED: "Scene could not sync the placed objects",
    TILES_FAILED: "Scene could not sync the tiles",
    ZONES_FAILED: "Scene could not sync the zones",
    ZONES_VISIBLE_FAILED: "Scene could not change the zones visibility",
} as const;

// The footer hint of the tile tools. pt-BR, because the user reads it.
export const TILE_HINTS = {
    NO_BRUSH: "Escolha um tile na aba Tiles para pintar",
    NO_LAYER: "Este tile não tem categoria, não dá para pintar com ele",
    GESTURE_FAILED: "Não foi possível aplicar a alteração no mapa",
    CONFLICT_OBJECT: "há um objeto sobre a célula",
    CONFLICT_MOUNTED: "há um objeto montado na parede",
    CONFLICT_OTHER: "a célula não aceita a alteração",
    CELL_SINGULAR: "célula ignorada",
    CELL_PLURAL: "células ignoradas",
    TILESET_LIMIT_PREFIX: "Este mapa usa mais de",
    TILESET_LIMIT_SUFFIX: "tilesets, o que pode deixá-lo pesado",
} as const;

// Hints and failures of the zone tool.
export const ZONE_MESSAGES = {
    AREA_TOO_SMALL: `A área precisa ter pelo menos ${ZONE_AREA_MIN_TILES} x ${ZONE_AREA_MIN_TILES} células`,
    NAME_REQUIRED: "Dê um nome à área",
    CREATE_FAILED: "Não foi possível criar a zona",
    EDIT_FAILED: "Não foi possível alterar a zona",
    REMOVE_FAILED: "Não foi possível apagar a zona",
    LAST_SPAWN: "O mapa precisa de pelo menos um ponto de entrada",
    DROP_READY: "Solte para aplicar",
} as const;

// What the footer hint says while an object is being placed: the reason a
// spot is refused, and the nudge when it is fine.
export const PLACEMENT_MESSAGES = {
    READY: "Clique para colocar. Esc para sair",
    OUT_OF_BOUNDS: "Fora do mapa",
    LIMIT_REACHED: "Limite de objetos do mapa atingido",
    OVERLAP: "Já existe um objeto neste lugar",
    NOT_ON_SURFACE: "Este item só pode ser colocado sobre uma mesa",
    NOT_ON_WALL: "Este item só pode ser colocado na parede",
    BLOCKED_BY_WALL: "Há uma parede neste lugar",
    NOT_IN_LIBRARY: "Este objeto não está disponível neste mapa",
    GENERIC: "Não é possível colocar aqui",
} as const;

// Hints and failures of the select tool and of the eraser on objects.
export const SELECTION_MESSAGES = {
    DROP_READY: "Solte para mover",
    MOVE_FAILED: "Não foi possível mover o objeto",
    ERASE_FAILED: "Não foi possível apagar o objeto",
} as const;

// Used by the confirmation of removing a claimed desk.
export const DESK_MESSAGES = {
    OWNER_FALLBACK: "outra pessoa",
} as const;

// What the footer says while an area is being placed: the nudge when the spot
// is fine and the reason when it is refused. pt-BR, because the user reads it.
export const AREA_PLACEMENT_MESSAGES = {
    READY: "Clique para colocar a área. Esc para sair",
    OUT_OF_BOUNDS: "A área não cabe no mapa neste lugar",
    NOT_EMPTY: "Há objetos neste lugar, a área só substitui tiles",
    COVERS_SPAWN: "A área cobriria o ponto de entrada do mapa",
    LIMIT_REACHED: "Esta área passaria do limite de objetos do mapa",
    TILESET_UNAVAILABLE: "Esta área usa um tileset que não está disponível",
    ASSET_UNAVAILABLE: "Esta área usa um objeto que não está disponível",
    PLACE_FAILED: "Não foi possível colocar a área neste lugar",
    LOAD_FAILED: "Não foi possível carregar a área",
} as const;

// The hint under the canvas while the frame of an area is dragged.
export const FRAME_MESSAGES = {
    size: (width: number, height: number): string =>
        `${width} x ${height} tiles`,
} as const;

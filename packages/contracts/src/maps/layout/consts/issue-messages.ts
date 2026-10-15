import {
    MAX_MAP_TILES,
    MAX_OBJECTS_PER_MAP,
    MAX_TILESETS_PER_MAP,
    MAX_ZONES_PER_MAP,
    MIN_MAP_TILES,
    TILE_SIZE,
} from "../../consts/constants";
import { SPAWN_MIN_DISTANCE_TILES } from "./thresholds";

// Every message a layout issue can carry. Callers pick one by name and never
// write a message inline, so the wording lives in one place.
export const LAYOUT_ISSUE_MESSAGES = {
    notOrthogonal: "O mapa deve ser ortogonal.",
    infinite: "O mapa não pode ser infinito.",
    tileSizeMismatch: `O tile do mapa deve ter ${TILE_SIZE} x ${TILE_SIZE} pixels.`,
    tooLargeGlobal: `O mapa não pode passar de ${MAX_MAP_TILES} x ${MAX_MAP_TILES} tiles.`,
    tooSmall: `O mapa precisa ter ao menos ${MIN_MAP_TILES.width} x ${MIN_MAP_TILES.height} tiles.`,
    tierDimensionExceeded: (tier: string, width: number, height: number) =>
        `O mapa passa do tamanho máximo do tier ${tier} (${width} x ${height}).`,
    layoutInvalid: "O layout do mapa é inválido.",
    staleLayout:
        "O mapa foi alterado por outra pessoa. Recarregue para continuar.",
    tierDisabled: "Esse tamanho de mapa ainda não está disponível.",
    missingGroundLayer: 'O mapa precisa ter a camada "ground".',
    layerDimensionMismatch: (layer: string) =>
        `A camada "${layer}" tem dimensão diferente da do mapa.`,
    layerDataLength: (layer: string) =>
        `Os dados da camada "${layer}" não batem com a largura vezes a altura do mapa.`,
    gidOutOfRange: (layer: string) =>
        `A camada "${layer}" usa um tile que não existe nos tilesets do mapa.`,
    tilesetNotInLibrary:
        "O tileset do mapa não existe na biblioteca de recursos.",
    tooManyTilesets: `O mapa usa mais de ${MAX_TILESETS_PER_MAP} tilesets.`,
    tooManyObjects: `O mapa não pode ter mais de ${MAX_OBJECTS_PER_MAP} objetos.`,
    zoneKindInvalid: "O tipo da zona é inválido.",
    zoneLabelRequired: "A zona precisa de um nome.",
    zoneKeyRequired: "A área privada precisa de uma chave.",
    zoneKeyDuplicated: "Já existe uma zona com essa chave no mapa.",
    zonePolygonInvalid: "O polígono da zona precisa de ao menos 3 pontos.",
    zoneRotated: "A zona não pode ser rotacionada.",
    tooManyZones: `O mapa não pode ter mais de ${MAX_ZONES_PER_MAP} zonas.`,
    spawnMissing: "O mapa precisa de ao menos um ponto de entrada.",
    spawnTooClose: `Há pontos de entrada a menos de ${SPAWN_MIN_DISTANCE_TILES} tiles um do outro.`,
    cellOutOfBounds: "A célula está fora do mapa.",
    tileNotInLibrary: "O tile não existe na biblioteca de recursos.",
    categoryLayerMismatch:
        "A categoria do tile não combina com a camada escolhida.",
    layoutTooLarge: "O layout do mapa passou do tamanho máximo permitido.",
    blankDefaultFloorMissing:
        "A biblioteca não tem um tile de chão padrão para o mapa em branco.",
    blankDefaultDuplicated:
        "Só pode haver um tile de chão e um de parede padrão.",
    thumbnailAspectMismatch:
        "A proporção da miniatura difere da proporção do mapa em mais de 2%.",
    invalidPng: (key: string) => `A imagem "${key}" não é um PNG válido.`,
    gridMismatch: (key: string) =>
        `A grade do tileset "${key}" não bate com o tamanho da imagem (tiles de ${TILE_SIZE} px).`,
    tileOutsideTileset: (index: string, key: string) =>
        `O tile ${index} da imagem "${key}" está fora do tileset.`,
} as const;

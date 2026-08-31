export const MapErrorMessages = {
    id: {
        invalid: "O ID do mapa é inválido.",
    },
    name: {
        required: "O nome do mapa é obrigatório.",
        max: "O nome do mapa deve ter no máximo 255 caracteres.",
        invalid: "O nome do mapa é inválido.",
    },
    width: {
        required: "A largura do mapa é obrigatória.",
        positive: "A largura do mapa deve ser maior que zero.",
        invalid: "A largura do mapa é inválida.",
    },
    height: {
        required: "A altura do mapa é obrigatória.",
        positive: "A altura do mapa deve ser maior que zero.",
        invalid: "A altura do mapa é inválida.",
    },
    tileSize: {
        required: "O tamanho do tile do mapa é obrigatório.",
        positive: "O tamanho do tile do mapa deve ser maior que zero.",
        invalid: "O tamanho do tile do mapa é inválido.",
    },
    mapJsonFileId: {
        invalid: "O ID do arquivo JSON do mapa é inválido.",
    },
    thumbnailFileId: {
        invalid: "O ID do arquivo de miniatura do mapa é inválido.",
    },
};

export const MapObjectErrorMessages = {
    missingAction: (identifier: string) =>
        `Objeto "${identifier}" é interactable mas "action" está ausente ou inválido.`,
    missingSitTarget: (identifier: string) =>
        `Objeto "${identifier}" tem action="sit" mas falta seatX/seatY.`,
    missingTeleportTarget: (identifier: string) =>
        `Objeto "${identifier}" tem action="teleport" mas falta targetX/targetY.`,
};

export const TiledObjectPropertyErrorMessages = {
    name: {
        required: "O nome da property é obrigatório.",
        invalid: "O nome da property é inválido.",
    },
    type: {
        required: "O tipo da property é obrigatório.",
        invalid: "O tipo da property é inválido.",
    },
};

export const TiledObjectErrorMessages = {
    id: {
        required: "O ID do objeto é obrigatório.",
        invalid: "O ID do objeto é inválido.",
    },
    name: {
        required: "O nome do objeto é obrigatório.",
        invalid: "O nome do objeto é inválido.",
    },
    type: {
        required: "O tipo do objeto é obrigatório.",
        invalid: "O tipo do objeto é inválido.",
    },
    gid: {
        invalid: "O GID do objeto é inválido.",
    },
    x: {
        required: "A posição X do objeto é obrigatória.",
        invalid: "A posição X do objeto é inválida.",
    },
    y: {
        required: "A posição Y do objeto é obrigatória.",
        invalid: "A posição Y do objeto é inválida.",
    },
    width: {
        required: "A largura do objeto é obrigatória.",
        invalid: "A largura do objeto é inválida.",
    },
    height: {
        required: "A altura do objeto é obrigatória.",
        invalid: "A altura do objeto é inválida.",
    },
    properties: {
        invalid: "As properties do objeto são inválidas.",
    },
};

export const MapObjectPropertiesErrorMessages = {
    solid: {
        invalid: 'O campo "solid" do objeto é inválido.',
    },
    interactable: {
        invalid: 'O campo "interactable" do objeto é inválido.',
    },
    action: {
        invalid: "A action do objeto é inválida.",
    },
    seatX: {
        required: 'O seatX é obrigatório para action="sit".',
        invalid: "O seatX é inválido.",
    },
    seatY: {
        required: 'O seatY é obrigatório para action="sit".',
        invalid: "O seatY é inválido.",
    },
    targetX: {
        required: 'O targetX é obrigatório para action="teleport".',
        invalid: "O targetX é inválido.",
    },
    targetY: {
        required: 'O targetY é obrigatório para action="teleport".',
        invalid: "O targetY é inválido.",
    },
};

export const TiledLayerErrorMessages = {
    type: {
        invalid: "O tipo da camada é inválido.",
    },
    name: {
        required: "O nome da camada é obrigatório.",
        invalid: "O nome da camada é inválido.",
    },
    objects: {
        invalid: "Os objetos da camada são inválidos.",
    },
};

export const TiledMapJsonErrorMessages = {
    layers: {
        invalid: "As camadas do mapa são inválidas.",
    },
    tilesets: {
        invalid: "Os tilesets do mapa são inválidos.",
    },
    name: {
        required: "O nome do tileset é obrigatório.",
        invalid: "O nome do tileset é inválido.",
    },
};

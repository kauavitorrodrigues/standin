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
    sizeTier: {
        invalid: "O tamanho do mapa é inválido.",
        disabled: "Esse tamanho de mapa ainda não está disponível.",
    },
    layoutVersion: {
        invalid: "A versão do layout do mapa é inválida.",
    },
    layout: {
        invalid: "O layout do mapa é inválido.",
    },
    tilesets: {
        invalid: "Os tilesets do mapa são inválidos.",
    },
};

export const MapLayoutErrorMessages = {
    orientation: {
        invalid: "O mapa deve ser ortogonal.",
    },
    infinite: {
        invalid: "O mapa não pode ser infinito.",
    },
    tileSize: {
        invalid: "O tamanho do tile do mapa deve ser de 32 pixels.",
    },
    width: {
        invalid: "A largura do layout é inválida.",
    },
    height: {
        invalid: "A altura do layout é inválida.",
    },
    backgroundColor: {
        invalid: "A cor de fundo do layout é inválida.",
    },
    tilesets: {
        invalid: "Os tilesets do layout são inválidos.",
    },
    layers: {
        invalid: "As camadas do layout são inválidas.",
    },
    renderOrder: {
        invalid: "A ordem de renderização do layout é inválida.",
    },
    nextId: {
        invalid: "O próximo ID do layout é inválido.",
    },
    tileset: {
        name: {
            invalid: "O nome do tileset do layout é inválido.",
        },
        firstGid: {
            invalid: "O primeiro GID do tileset do layout é inválido.",
        },
    },
    object: {
        id: { invalid: "O ID do objeto da camada é inválido." },
        name: { invalid: "O nome do objeto da camada é inválido." },
        type: { invalid: "O tipo do objeto da camada é inválido." },
        x: { invalid: "A posição X do objeto da camada é inválida." },
        y: { invalid: "A posição Y do objeto da camada é inválida." },
        width: { invalid: "A largura do objeto da camada é inválida." },
        height: { invalid: "A altura do objeto da camada é inválida." },
        rotation: { invalid: "A rotação do objeto da camada é inválida." },
        visible: { invalid: "A visibilidade do objeto da camada é inválida." },
        polygon: { invalid: "O polígono do objeto da camada é inválido." },
        point: { invalid: "Os pontos do polígono devem ser números." },
        properties: {
            invalid: "As propriedades do objeto da camada são inválidas.",
        },
        objects: { invalid: "Os objetos da camada são inválidos." },
    },
    layer: {
        id: { invalid: "O ID da camada do layout é inválido." },
        visible: { invalid: "A visibilidade da camada do layout é inválida." },
        opacity: { invalid: "A opacidade da camada do layout é inválida." },
        type: {
            invalid: "O tipo da camada do layout é inválido.",
        },
        name: {
            invalid: "O nome da camada do layout é inválido.",
        },
        width: {
            invalid: "A largura da camada do layout é inválida.",
        },
        height: {
            invalid: "A altura da camada do layout é inválida.",
        },
        data: {
            invalid: "Os dados da camada do layout são inválidos.",
            tile: "Os tiles da camada do layout devem ser números inteiros.",
        },
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

export const LayoutOpErrorMessages = {
    baseVersion: { invalid: "A versão base do layout é inválida." },
    ops: {
        invalid: "As operações do layout são inválidas.",
        required: "Envie ao menos uma operação.",
    },
    op: { invalid: "A operação do layout é inválida." },
    layer: { invalid: "A camada da operação é inválida." },
    tilesetId: { invalid: "O tileset do tile é inválido." },
    tileIndex: { invalid: "O índice do tile é inválido." },
    cells: { invalid: "As células da operação são inválidas." },
    cell: { invalid: "Cada célula deve ser um par de números inteiros." },
    zoneId: { invalid: "O ID da zona é inválido." },
    color: { invalid: "A cor de fundo deve estar no formato #RRGGBB." },
    zone: {
        invalid: "A zona é inválida.",
        kind: { invalid: "O tipo da zona é inválido." },
        position: { invalid: "A posição da zona é inválida." },
        size: { invalid: "O tamanho da zona é inválido." },
        rotation: { invalid: "A rotação da zona é inválida." },
        polygon: { invalid: "O polígono da zona é inválido." },
        label: { invalid: "O nome da zona é inválido." },
        key: { invalid: "A chave da zona é inválida." },
        target: { invalid: "O destino da zona é inválido." },
    },
};

export const MapRenderErrorMessages = {
    map: { invalid: "Os dados do mapa são inválidos." },
    layoutVersion: { invalid: "A versão do layout é inválida." },
    tilesets: { invalid: "Os tilesets do mapa são inválidos." },
    assets: { invalid: "Os recursos do mapa são inválidos." },
    placed: { invalid: "Os objetos posicionados são inválidos." },
    desks: { invalid: "As mesas do mapa são inválidas." },
    access: { invalid: "As permissões do mapa são inválidas." },
    id: { invalid: "O ID do objeto posicionado é inválido." },
    assetId: { invalid: "O ID do recurso posicionado é inválido." },
    tile: { invalid: "A posição do objeto no mapa é inválida." },
    parentId: { invalid: "O ID do objeto pai é inválido." },
    userId: { invalid: "O ID do usuário da mesa é inválido." },
    canEdit: { invalid: "A permissão de edição é inválida." },
    ownDesk: { invalid: "A mesa do usuário é inválida." },
};

export const MapAssetErrorMessages = {
    assetId: { invalid: "Escolha um recurso para posicionar." },
    tile: { invalid: "A posição do objeto deve ser um número inteiro." },
    parentId: { invalid: "O ID do objeto pai é inválido." },
    changes: { required: "Informe ao menos uma alteração." },
    userId: { invalid: "Escolha a pessoa que vai receber a mesa." },
    releaseDesk: { invalid: 'O campo "releaseDesk" é inválido.' },
    swap: { invalid: 'O campo "swap" é inválido.' },
};

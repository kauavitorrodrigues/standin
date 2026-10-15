import { MAX_OBJECTS_PER_MAP } from "../consts/constants";
import { BaseError } from "../../errors/base";

const PLACEMENT_INVALID_CODE = "MAP_ASSET_PLACEMENT_INVALID";
const PLACEMENT_INVALID_STATUS = 422;

// Every way an object can be refused a position. Callers throw one of the
// subclasses below and never write the reason themselves; the base only
// carries the shared code and status, so tests and clients can match on it.
export abstract class MapAssetPlacementError extends BaseError {
    protected constructor(message: string) {
        super(message, PLACEMENT_INVALID_CODE, PLACEMENT_INVALID_STATUS);
    }
}

export class MapAssetOutOfBoundsError extends MapAssetPlacementError {
    constructor() {
        super("O objeto não cabe dentro do mapa.");
    }
}

export class MapAssetPositionOccupiedError extends MapAssetPlacementError {
    constructor() {
        super("Já existe um objeto nessa posição.");
    }
}

export class MapAssetNotOnWallError extends MapAssetPlacementError {
    constructor() {
        super("Este objeto só pode ser colocado sobre uma parede.");
    }
}

export class MapAssetSurfaceRequiredError extends MapAssetPlacementError {
    constructor() {
        super("Este objeto só pode ser colocado sobre uma mesa.");
    }
}

export class MapAssetNotOnDeskTopError extends MapAssetPlacementError {
    constructor() {
        super("O objeto precisa ficar dentro do tampo da mesa.");
    }
}

export class MapAssetSurfaceOccupiedError extends MapAssetPlacementError {
    constructor() {
        super("Esse lugar da mesa já está ocupado.");
    }
}

export class MapAssetParentNotAllowedError extends MapAssetPlacementError {
    constructor() {
        super("Só objetos de superfície podem ser colocados sobre uma mesa.");
    }
}

export class MapAssetFloorNotAllowedError extends MapAssetPlacementError {
    constructor() {
        super("Este objeto não pode ir para o chão.");
    }
}

export class MapAssetTargetDeskNotFoundError extends MapAssetPlacementError {
    constructor() {
        super("A mesa de destino não existe.");
    }
}

export class MapAssetLimitExceededError extends MapAssetPlacementError {
    constructor() {
        super(`O mapa não pode ter mais de ${MAX_OBJECTS_PER_MAP} objetos.`);
    }
}

export class MapAssetUnavailableError extends MapAssetPlacementError {
    constructor() {
        super("O recurso não está disponível para este mapa.");
    }
}

export class MapAssetModelMismatchError extends MapAssetPlacementError {
    constructor() {
        super("O novo modelo precisa ter o mesmo tipo de posicionamento.");
    }
}

export class MapAssetClaimedDeskModelError extends MapAssetPlacementError {
    constructor() {
        super("Uma mesa com dono só pode ser trocada por outra mesa.");
    }
}

export class MapAssetModelTooSmallError extends MapAssetPlacementError {
    constructor() {
        super("O novo modelo não comporta os itens que estão sobre a mesa.");
    }
}

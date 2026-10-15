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
        super("The object does not fit inside the map.");
    }
}

export class MapAssetPositionOccupiedError extends MapAssetPlacementError {
    constructor() {
        super("There is already an object at this position.");
    }
}

export class MapAssetNotOnWallError extends MapAssetPlacementError {
    constructor() {
        super("This object can only be placed on a wall.");
    }
}

export class MapAssetSurfaceRequiredError extends MapAssetPlacementError {
    constructor() {
        super("This object can only be placed on a desk.");
    }
}

export class MapAssetNotOnDeskTopError extends MapAssetPlacementError {
    constructor() {
        super("The object must stay within the desk top.");
    }
}

export class MapAssetSurfaceOccupiedError extends MapAssetPlacementError {
    constructor() {
        super("This spot on the desk is already taken.");
    }
}

export class MapAssetParentNotAllowedError extends MapAssetPlacementError {
    constructor() {
        super("Only surface objects can be placed on a desk.");
    }
}

export class MapAssetFloorNotAllowedError extends MapAssetPlacementError {
    constructor() {
        super("This object cannot be placed on the floor.");
    }
}

export class MapAssetTargetDeskNotFoundError extends MapAssetPlacementError {
    constructor() {
        super("The target desk does not exist.");
    }
}

export class MapAssetLimitExceededError extends MapAssetPlacementError {
    constructor() {
        super(`The map cannot have more than ${MAX_OBJECTS_PER_MAP} objects.`);
    }
}

export class MapAssetUnavailableError extends MapAssetPlacementError {
    constructor() {
        super("The asset is not available for this map.");
    }
}

export class MapAssetModelMismatchError extends MapAssetPlacementError {
    constructor() {
        super("The new model must have the same placement type.");
    }
}

export class MapAssetClaimedDeskModelError extends MapAssetPlacementError {
    constructor() {
        super("A desk with an owner can only be swapped for another desk.");
    }
}

export class MapAssetModelTooSmallError extends MapAssetPlacementError {
    constructor() {
        super("The new model cannot hold the items on the desk.");
    }
}

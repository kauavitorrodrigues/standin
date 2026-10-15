import { BaseError } from "../../errors/base";

export class MapNotFoundError extends BaseError {
    constructor() {
        super("Map not found.", "MAP_NOT_FOUND", 404);
    }
}

export class MapAssetNotFoundError extends BaseError {
    constructor() {
        super("Object not found on the map.", "MAP_ASSET_NOT_FOUND", 404);
    }
}

export class MapAssetForbiddenError extends BaseError {
    constructor() {
        super(
            "You do not have permission to change this object.",
            "MAP_ASSET_FORBIDDEN",
            403
        );
    }
}

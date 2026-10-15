import { BaseError } from "../../errors/base";

// 403: the draft has an operation the edit scope does not allow, for example
// painting a tile from the decorator.
export class OutOfScopeError extends BaseError {
    constructor() {
        super(
            "The draft has an operation outside the edit scope.",
            "OUT_OF_SCOPE",
            403
        );
    }
}

// 409: the objects of the map changed after the draft was created.
export class StaleObjectsError extends BaseError {
    constructor() {
        super(
            "The map objects changed after the draft was created.",
            "STALE_OBJECTS",
            409
        );
    }
}

import { BaseError } from "../errors/base";

export class SpaceNotFoundError extends BaseError {
    constructor() {
        super("Space not found.", "SPACE_NOT_FOUND", 404);
    }
}

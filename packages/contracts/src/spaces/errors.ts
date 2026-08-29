import { BaseError } from "../errors/base";

export class SpaceNotFoundError extends BaseError {
    constructor() {
        super("Espaço não encontrado.", "SPACE_NOT_FOUND", 404);
    }
}

import { BaseError } from "../../errors/base";

export class MapNotFoundError extends BaseError {
    constructor() {
        super("Mapa não encontrado.", "MAP_NOT_FOUND", 404);
    }
}

export class MapAssetNotFoundError extends BaseError {
    constructor() {
        super("Objeto não encontrado no mapa.", "MAP_ASSET_NOT_FOUND", 404);
    }
}

export class MapAssetForbiddenError extends BaseError {
    constructor() {
        super(
            "Você não tem permissão para alterar este objeto.",
            "MAP_ASSET_FORBIDDEN",
            403
        );
    }
}

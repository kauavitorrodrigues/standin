import { BaseError } from "../errors/base";

export class MapNotFoundError extends BaseError {
    constructor() {
        super("Mapa não encontrado.", "MAP_NOT_FOUND", 404);
    }
}

export class MissingMapJsonFileError extends BaseError {
    constructor() {
        super(
            "É necessário enviar o arquivo JSON do mapa.",
            "MAP_JSON_FILE_MISSING",
            400
        );
    }
}

export class MissingTilesetImageError extends BaseError {
    constructor() {
        super(
            "É necessário enviar ao menos uma imagem de tileset.",
            "MAP_TILESET_IMAGE_MISSING",
            400
        );
    }
}

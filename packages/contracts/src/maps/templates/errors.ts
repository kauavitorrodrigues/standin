import { BaseError } from "../../errors/base";

export class MapTemplateNotFoundError extends BaseError {
    constructor() {
        super("Template não encontrado.", "TEMPLATE_NOT_FOUND", 404);
    }
}

export class MapTemplateNotDraftError extends BaseError {
    constructor() {
        super(
            "Só é possível publicar um template em rascunho.",
            "TEMPLATE_NOT_DRAFT",
            409
        );
    }
}

export class MapTemplateMissingThumbnailError extends BaseError {
    constructor() {
        super(
            "Envie uma miniatura antes de publicar o template.",
            "TEMPLATE_THUMBNAIL_REQUIRED",
            422
        );
    }
}

export class MapTemplateUsesPrivateAssetsError extends BaseError {
    constructor() {
        super(
            "O template usa recursos privados de uma organização e não pode ser publicado.",
            "TEMPLATE_USES_NON_GLOBAL_ASSET",
            422
        );
    }
}

export class MapTemplateNotPublishedError extends BaseError {
    constructor() {
        super(
            "Este template não está publicado.",
            "TEMPLATE_NOT_PUBLISHED",
            409
        );
    }
}

export class MapTemplateUnavailableError extends BaseError {
    constructor() {
        super(
            "Este template não está disponível.",
            "TEMPLATE_UNAVAILABLE",
            422
        );
    }
}

export class MapTemplateNotDeletableError extends BaseError {
    constructor() {
        super(
            "Só é possível excluir um template em rascunho ou aposentado.",
            "TEMPLATE_NOT_DELETABLE",
            409
        );
    }
}

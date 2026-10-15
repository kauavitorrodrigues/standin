import { BaseError } from "../../errors/base";

export class MapTemplateNotFoundError extends BaseError {
    constructor() {
        super("Template not found.", "TEMPLATE_NOT_FOUND", 404);
    }
}

export class MapTemplateNotDraftError extends BaseError {
    constructor() {
        super(
            "Only a draft template can be published.",
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
            "The template uses private organization assets and cannot be published.",
            "TEMPLATE_USES_NON_GLOBAL_ASSET",
            422
        );
    }
}

export class MapTemplateNotPublishedError extends BaseError {
    constructor() {
        super(
            "This template is not published.",
            "TEMPLATE_NOT_PUBLISHED",
            409
        );
    }
}

export class MapTemplateUnavailableError extends BaseError {
    constructor() {
        super(
            "This template is not available.",
            "TEMPLATE_UNAVAILABLE",
            422
        );
    }
}

export class MapTemplateNotDeletableError extends BaseError {
    constructor() {
        super(
            "Only a draft or retired template can be deleted.",
            "TEMPLATE_NOT_DELETABLE",
            409
        );
    }
}

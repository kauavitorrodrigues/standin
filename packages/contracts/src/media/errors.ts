import { BaseError } from "../errors/base";

export class MediaNotJoinedError extends BaseError {
    constructor() {
        super(
            "You must join a space before using media.",
            "MEDIA_NOT_JOINED",
            400
        );
    }
}

export class MediaInvalidRequestError extends BaseError {
    constructor() {
        super("The media request is invalid.", "MEDIA_INVALID_REQUEST", 400);
    }
}

export class MediaTransportNotFoundError extends BaseError {
    constructor() {
        super(
            "The media transport was not found.",
            "MEDIA_TRANSPORT_NOT_FOUND",
            404
        );
    }
}

export class MediaTransportNotRestartableError extends BaseError {
    constructor() {
        super(
            "The media transport does not support an ICE restart.",
            "MEDIA_TRANSPORT_NOT_RESTARTABLE",
            422
        );
    }
}

export class MediaTransportExistsError extends BaseError {
    constructor() {
        super(
            "The media transport already exists for this direction.",
            "MEDIA_TRANSPORT_EXISTS",
            409
        );
    }
}

export class MediaProducerNotFoundError extends BaseError {
    constructor() {
        super(
            "The media producer was not found.",
            "MEDIA_PRODUCER_NOT_FOUND",
            404
        );
    }
}

export class MediaProducerExistsError extends BaseError {
    constructor() {
        super(
            "You already produce this media source.",
            "MEDIA_PRODUCER_EXISTS",
            409
        );
    }
}

export class MediaConsumerNotFoundError extends BaseError {
    constructor() {
        super(
            "The media consumer was not found.",
            "MEDIA_CONSUMER_NOT_FOUND",
            404
        );
    }
}

export class MediaCannotProduceError extends BaseError {
    constructor() {
        super(
            "The media server cannot accept this stream.",
            "MEDIA_CANNOT_PRODUCE",
            422
        );
    }
}

export class MediaUnavailableError extends BaseError {
    constructor() {
        super("The media server is not available.", "MEDIA_UNAVAILABLE", 503);
    }
}

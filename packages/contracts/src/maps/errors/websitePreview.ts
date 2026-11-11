import { BaseError } from "../../errors/base";

export class MapAssetWithoutWebsiteError extends BaseError {
    constructor() {
        super(
            "This object does not embed a website.",
            "MAP_ASSET_WITHOUT_WEBSITE",
            404
        );
    }
}

export class WebsitePreviewBlockedAddressError extends BaseError {
    constructor() {
        super(
            "The address points to a private or reserved network.",
            "WEBSITE_PREVIEW_BLOCKED_ADDRESS",
            422
        );
    }
}

export class WebsitePreviewTooManyRedirectsError extends BaseError {
    constructor() {
        super(
            "The address redirected too many times.",
            "WEBSITE_PREVIEW_TOO_MANY_REDIRECTS",
            422
        );
    }
}

export class WebsitePreviewTooLargeError extends BaseError {
    constructor() {
        super(
            "The answer is larger than the limit.",
            "WEBSITE_PREVIEW_TOO_LARGE",
            422
        );
    }
}

export class WebsitePreviewUnsupportedContentError extends BaseError {
    constructor() {
        super(
            "The answer is not a kind the preview reads.",
            "WEBSITE_PREVIEW_UNSUPPORTED_CONTENT",
            422
        );
    }
}

export class WebsitePreviewTimeoutError extends BaseError {
    constructor() {
        super(
            "The website took too long to answer.",
            "WEBSITE_PREVIEW_TIMEOUT",
            504
        );
    }
}

export class WebsitePreviewRequestError extends BaseError {
    constructor() {
        super(
            "The website could not be read.",
            "WEBSITE_PREVIEW_REQUEST_FAILED",
            502
        );
    }
}

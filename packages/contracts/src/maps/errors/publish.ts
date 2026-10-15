import { BaseError } from "../../errors/base";
import type { PublishIssue } from "../editor/types/publish-issue";

const PUBLISH_INVALID_STATUS = 422;
const PUBLISH_TOO_LARGE_STATUS = 413;

// 422: an operation of the draft cannot be applied. Carries the issues so the
// client can point at the operation. The replay stops at the first failure,
// so today the list holds the issues of a single operation.
export class PublishValidationError extends BaseError {
    public readonly errors: PublishIssue[];

    constructor(errors: PublishIssue[]) {
        super(
            "The draft has an operation that cannot be applied.",
            "PUBLISH_INVALID",
            PUBLISH_INVALID_STATUS
        );
        this.errors = errors;
    }
}

// 413: the draft has more operations than one publish accepts.
export class PublishTooManyOpsError extends BaseError {
    constructor() {
        super(
            "The draft has too many operations to publish at once.",
            "OP_TOO_LARGE",
            PUBLISH_TOO_LARGE_STATUS
        );
    }
}

// 403: the person cannot edit this map.
export class PublishForbiddenError extends BaseError {
    constructor() {
        super(
            "You do not have permission to publish this map.",
            "PUBLISH_FORBIDDEN",
            403
        );
    }
}

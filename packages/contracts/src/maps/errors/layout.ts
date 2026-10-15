import { BaseError } from "../../errors/base";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../layout/consts/issue-messages";
import { LAYOUT_ISSUE_CODES, type LayoutIssue } from "../layout/issues";

const LAYOUT_INVALID_CODE = "LAYOUT_INVALID";
const LAYOUT_INVALID_STATUS = 422;
const STALE_LAYOUT_STATUS = 409;

// 422 carrying every error and warning, so the client can show them all.
export class LayoutValidationError extends BaseError {
    public readonly errors: LayoutIssue[];
    public readonly warnings: LayoutIssue[];

    constructor(errors: LayoutIssue[], warnings: LayoutIssue[] = []) {
        super(
            errors[0]?.message ?? Messages.layoutInvalid,
            errors[0]?.code ?? LAYOUT_INVALID_CODE,
            LAYOUT_INVALID_STATUS
        );
        this.errors = errors;
        this.warnings = warnings;
    }
}

// 409: someone else changed the layout since the client loaded it.
export class StaleLayoutVersionError extends BaseError {
    public readonly currentVersion: number;

    constructor(currentVersion: number) {
        super(
            Messages.staleLayout,
            LAYOUT_ISSUE_CODES.STALE_LAYOUT_VERSION,
            STALE_LAYOUT_STATUS
        );
        this.currentVersion = currentVersion;
    }
}

import { LibraryError } from "../assets/errors";
import type { LibraryIssue } from "../assets/errors";
import { BaseError } from "../errors/base";
import { LAYOUT_ISSUE_CODES } from "../maps/layout/issues";
import type { LayoutIssue } from "../maps/layout/issues";
import { TILE_SIZE } from "../maps/consts/constants";
import { AREA_NAME_MAX } from "./consts/limits";

export const AREA_ISSUE_CODES = {
    THUMBNAIL_SIZE_MISMATCH: "THUMBNAIL_SIZE_MISMATCH",
} as const;

export type AreaIssueCode =
    (typeof AREA_ISSUE_CODES)[keyof typeof AREA_ISSUE_CODES];

// Same `{ code, path, message }` shape as a library or a layout issue.
export type AreaIssue =
    | LibraryIssue
    | LayoutIssue
    | { code: AreaIssueCode; path: string; message: string };

// One class per validation problem of an area upload, like the library issues.
export class AreaNameInvalidIssue implements LayoutIssue {
    public readonly code = LAYOUT_ISSUE_CODES.AREA_NAME_INVALID;
    public readonly path = "name";
    public readonly message = `The area name must have 1 to ${AREA_NAME_MAX} characters.`;
}

export class ThumbnailSizeMismatchIssue {
    public readonly code = AREA_ISSUE_CODES.THUMBNAIL_SIZE_MISMATCH;
    public readonly path = "image";
    public readonly message = `The image must measure the stamp size times ${TILE_SIZE} px.`;
}

const AREA_INVALID_STATUS = 422;

// 422 carrying every problem of the upload, in the same shape as the library:
// `{ errors: [{ code, path, message }], warnings: [] }`.
export class AreaValidationError extends BaseError {
    public readonly errors: AreaIssue[];
    public readonly warnings: AreaIssue[] = [];

    constructor(errors: AreaIssue[]) {
        super(
            errors[0]?.message ?? "The area is invalid.",
            errors[0]?.code ?? LAYOUT_ISSUE_CODES.STAMP_INVALID,
            AREA_INVALID_STATUS
        );
        this.errors = errors;
    }
}

export class AreaNotFoundError extends LibraryError {
    constructor() {
        super("Area not found.", "AREA_NOT_FOUND", 404);
    }
}

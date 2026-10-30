import { BaseError } from "../errors/base";
import type {
    LibrarySeedIssue,
    LibrarySeedReference,
} from "./types/library-seed";

export class AssetNotFoundError extends BaseError {
    constructor() {
        super("Asset not found.", "ASSET_NOT_FOUND", 404);
    }
}

export class TilesetNotFoundError extends BaseError {
    constructor() {
        super("Tileset not found.", "TILESET_NOT_FOUND", 404);
    }
}

export class AssetFamilyNotFoundError extends BaseError {
    constructor() {
        super("Asset family not found.", "ASSET_FAMILY_NOT_FOUND", 404);
    }
}

const COLOR_CHANGE_INVALID_TARGET_CODE = "COLOR_CHANGE_INVALID_TARGET";
const COLOR_CHANGE_INVALID_TARGET_STATUS = 422;

// The target of a color change must be a colored sibling of the same family
// and rotation, with a different color.
export class AssetColorChangeInvalidTargetError extends BaseError {
    constructor() {
        super(
            "The new color must be another variant of the same model and rotation.",
            COLOR_CHANGE_INVALID_TARGET_CODE,
            COLOR_CHANGE_INVALID_TARGET_STATUS
        );
    }
}

// Problems found while validating an upload or a family. Several can come
// together in one 422 (see `LibraryValidationError`).
export const LIBRARY_ISSUE_CODES = {
    DATA_INVALID: "DATA_INVALID",
    IMAGE_FILE_REQUIRED: "IMAGE_FILE_REQUIRED",
    PREVIEW_FILE_REQUIRED: "PREVIEW_FILE_REQUIRED",
    PNG_INVALID: "PNG_INVALID",
    PNG_DIMENSIONS_EXCEEDED: "PNG_DIMENSIONS_EXCEEDED",
    SPRITE_SIZE_NOT_MULTIPLE_OF_TILE: "SPRITE_SIZE_NOT_MULTIPLE_OF_TILE",
    ANIMATION_FRAME_WIDTH_INVALID: "ANIMATION_FRAME_WIDTH_INVALID",
    GRID_MISMATCH: "GRID_MISMATCH",
    TILE_META_OUT_OF_RANGE: "TILE_META_OUT_OF_RANGE",
    BLANK_DEFAULT_DUPLICATED: "BLANK_DEFAULT_DUPLICATED",
    CATEGORY_REQUIRED: "CATEGORY_REQUIRED",
    CATEGORY_INVALID: "CATEGORY_INVALID",
    ASSET_FOOTPRINT_INVALID: "ASSET_FOOTPRINT_INVALID",
    ASSET_FOOTPRINT_MASK_ANIMATED: "ASSET_FOOTPRINT_MASK_ANIMATED",
    ASSET_ACTION_PARAMS_INVALID: "ASSET_ACTION_PARAMS_INVALID",
    VARIANT_BASE_INVALID: "VARIANT_BASE_INVALID",
    BASE_COLOR_REQUIRED: "BASE_COLOR_REQUIRED",
    COLOR_MISSING: "COLOR_MISSING",
    VARIANT_DUPLICATED: "VARIANT_DUPLICATED",
    VARIANT_SIZE_MISMATCH: "VARIANT_SIZE_MISMATCH",
    VARIANT_OVERRIDE_NOT_ALLOWED: "VARIANT_OVERRIDE_NOT_ALLOWED",
    FOOTPRINT_REQUIRED_FOR_NEW_ROTATION: "FOOTPRINT_REQUIRED_FOR_NEW_ROTATION",
    ANIMATION_IMMUTABLE: "ANIMATION_IMMUTABLE",
    COLOR_FIELDS_INCONSISTENT: "COLOR_FIELDS_INCONSISTENT",
    COLOR_KEY_INVALID: "COLOR_KEY_INVALID",
    COLOR_HEX_INVALID: "COLOR_HEX_INVALID",
    FAMILY_BASE_MISSING: "FAMILY_BASE_MISSING",
    FAMILY_FIELD_DIVERGES: "FAMILY_FIELD_DIVERGES",
    ROTATION_FIELD_DIVERGES: "ROTATION_FIELD_DIVERGES",
} as const;

export type LibraryIssueCode =
    (typeof LIBRARY_ISSUE_CODES)[keyof typeof LIBRARY_ISSUE_CODES];

export type LibraryIssue = {
    code: LibraryIssueCode;
    // Where the problem is: a data field, an asset key or an image part.
    path: string;
    message: string;
};

// What `validateFamily` returns.
export type FamilyIssue = LibraryIssue;

const LIBRARY_INVALID_STATUS = 422;

// 422 carrying every error and warning, in the same shape as a layout
// validation: `{ errors: [{ code, path, message }], warnings: [] }`.
export class LibraryValidationError extends BaseError {
    public readonly errors: LibraryIssue[];
    public readonly warnings: LibraryIssue[];

    constructor(errors: LibraryIssue[], warnings: LibraryIssue[] = []) {
        super(
            errors[0]?.message ?? "The library upload is invalid.",
            errors[0]?.code ?? LIBRARY_ISSUE_CODES.DATA_INVALID,
            LIBRARY_INVALID_STATUS
        );
        this.errors = errors;
        this.warnings = warnings;
    }
}

// A library error that answers with its code (and extra details) in the
// body, so a client can tell the cases apart.
export class LibraryError extends BaseError {
    public readonly details: Record<string, unknown>;

    constructor(
        message: string,
        code: string,
        status: number,
        details: Record<string, unknown> = {}
    ) {
        super(message, code, status);
        this.details = details;
    }
}

// An `organizationId` was sent before the organization library exists.
export class ScopeForbiddenError extends LibraryError {
    constructor() {
        super(
            "Only the global library is available for now.",
            "SCOPE_FORBIDDEN",
            403
        );
    }
}

export class AssetKeyTakenError extends LibraryError {
    constructor() {
        super("This asset key already exists.", "ASSET_KEY_TAKEN", 409);
    }
}

export class TilesetKeyTakenError extends LibraryError {
    constructor() {
        super("This tileset key already exists.", "TILESET_KEY_TAKEN", 409);
    }
}

// Maps already painted with the tileset, so its tileMeta can only grow.
export class TilesetInUseError extends LibraryError {
    constructor() {
        super(
            "The tileset is used by maps: tileMeta only accepts new entries or a blankDefault change.",
            "TILESET_IN_USE",
            409
        );
    }
}

// Structural fields of an asset in use cannot change: maps already point at it.
export class AssetInUseImmutableError extends LibraryError {
    constructor(fields: string[]) {
        super(
            `The asset is used by maps and only accepts a change of name, promptText and category (fields: ${fields.join(", ")}).`,
            "ASSET_IN_USE_IMMUTABLE",
            409,
            { fields }
        );
    }
}

// The fields of a family are edited on its base asset. A variation only
// changes its own rotation and the action params of its rotation.
export class VariationFamilyFieldError extends LibraryError {
    constructor(fields: string[]) {
        super(
            `A variation cannot change the fields of its family, edit the base asset instead (fields: ${fields.join(", ")}).`,
            "VARIATION_FAMILY_FIELD",
            422,
            { fields }
        );
    }
}

// The image of an asset in use cannot be replaced.
export class AssetImageInUseError extends LibraryError {
    constructor() {
        super(
            "The asset is used by maps and its image cannot be replaced.",
            "ASSET_IN_USE_IMMUTABLE",
            409
        );
    }
}

export class BaseHasVariantsError extends LibraryError {
    constructor() {
        super(
            "The asset has variations. Delete the whole family with ?family=true.",
            "BASE_HAS_VARIANTS",
            422
        );
    }
}

const ASSET_PART_INVALID_CODE = "ASSET_PART_INVALID";
const ASSET_PART_INVALID_STATUS = 422;

export class AssetPartSelfReferenceError extends LibraryError {
    constructor() {
        super(
            "An asset cannot be a part of itself.",
            ASSET_PART_INVALID_CODE,
            ASSET_PART_INVALID_STATUS
        );
    }
}

export class AssetPartOutOfScopeError extends LibraryError {
    constructor() {
        super(
            "Every part must be an asset visible in the same scope as the bundle.",
            ASSET_PART_INVALID_CODE,
            ASSET_PART_INVALID_STATUS
        );
    }
}

export class AssetPartNotGroundError extends LibraryError {
    constructor() {
        super(
            "The parts of a bundle are placed on the ground (GROUND).",
            ASSET_PART_INVALID_CODE,
            ASSET_PART_INVALID_STATUS
        );
    }
}

export class AssetPartIsBundleError extends LibraryError {
    constructor() {
        super(
            "A part cannot be a bundle itself.",
            ASSET_PART_INVALID_CODE,
            ASSET_PART_INVALID_STATUS
        );
    }
}

// 413: the PNG is over `MAX_UPLOAD_BYTES`.
export class PngTooLargeError extends LibraryError {
    constructor() {
        super(
            "The uploaded file exceeds the allowed size.",
            "PNG_TOO_LARGE",
            413
        );
    }
}

export class LibraryUnsupportedMediaError extends LibraryError {
    constructor() {
        super(
            "File type or form part not accepted.",
            "UNSUPPORTED_MEDIA_TYPE",
            415
        );
    }
}

// The library seed script has no admin to own what it creates.
export class LibrarySeedAdminNotFoundError extends BaseError {
    constructor() {
        super(
            "No admin user found. Run `pnpm --filter api bootstrap` first.",
            "LIBRARY_SEED_ADMIN_NOT_FOUND",
            500
        );
    }
}

const MAX_LISTED_SEED_ITEMS = 20;

// The first items of a list for a message, with how many were left out.
const summarizeSeedList = (items: string[], separator: string) => {
    const listed = items.slice(0, MAX_LISTED_SEED_ITEMS).join(separator);
    const rest = items.length - MAX_LISTED_SEED_ITEMS;
    return rest > 0 ? `${listed} and ${rest} more` : listed;
};

// 400: the `library` part of a seed upload is missing, is not JSON or does not
// match the schema. The whole list is in `issues`.
export class LibrarySeedFileInvalidError extends LibraryError {
    constructor(issues: string[]) {
        super(
            `library.json is invalid: ${summarizeSeedList(issues, " ")}`,
            "LIBRARY_SEED_FILE_INVALID",
            400,
            { issues }
        );
    }
}

// 400: files that library.json points to were not part of the upload. The
// whole list is in `paths`.
export class LibrarySeedFilesMissingError extends LibraryError {
    constructor(paths: string[]) {
        super(
            `library.json points to files that were not uploaded: ${summarizeSeedList(paths, ", ")}.`,
            "LIBRARY_SEED_FILES_MISSING",
            400,
            { paths }
        );
    }
}

// 400: two file parts of a seed upload have the same name (path).
export class LibrarySeedDuplicateFileError extends LibraryError {
    constructor(path: string) {
        super(
            `The file "${path}" was uploaded twice.`,
            "LIBRARY_SEED_DUPLICATE_FILE",
            400,
            { path }
        );
    }
}

// 413: the seed request is over `MAX_SEED_TOTAL_BYTES`.
export class LibrarySeedTooLargeError extends BaseError {
    constructor() {
        super(
            "The library upload exceeds the allowed total size.",
            "LIBRARY_SEED_TOO_LARGE",
            413
        );
    }
}

// 400: more file parts than `MAX_SEED_FILES`.
export class LibrarySeedTooManyFilesError extends BaseError {
    constructor() {
        super(
            "The library upload has too many files.",
            "LIBRARY_SEED_TOO_MANY_FILES",
            400
        );
    }
}

// 400: a form field other than a single `library` text field, or a part name
// that is too long.
export class LibrarySeedFieldsInvalidError extends BaseError {
    constructor() {
        super(
            "Send library.json once, as the text field \"library\"; every other part must be a file named by its path.",
            "LIBRARY_SEED_FIELDS_INVALID",
            400
        );
    }
}

// 413: the `library` field is over `MAX_SEED_LIBRARY_BYTES`.
export class LibrarySeedLibraryTooLargeError extends BaseError {
    constructor() {
        super(
            "library.json exceeds the allowed size.",
            "LIBRARY_SEED_LIBRARY_TOO_LARGE",
            413
        );
    }
}

// 413: an uploaded PNG is over `MAX_UPLOAD_BYTES`.
export class LibrarySeedFileTooLargeError extends BaseError {
    constructor() {
        super(
            "A file of the library upload exceeds the allowed size.",
            "LIBRARY_SEED_FILE_TOO_LARGE",
            413
        );
    }
}

// A key written in a library file (an area stamp or a bundle) that matches no
// tileset or asset. Every unknown key of the entry is listed with its field.
export class LibrarySeedReferenceNotFoundError extends BaseError {
    public readonly entry: string;
    public readonly references: LibrarySeedReference[];

    constructor(entry: string, references: LibrarySeedReference[]) {
        const listed = references
            .map(({ field, key }) => `${field} "${key}"`)
            .join(", ");
        super(
            `${entry}: no tileset or asset matches ${listed}.`,
            "LIBRARY_SEED_REFERENCE_NOT_FOUND",
            422
        );
        this.entry = entry;
        this.references = references;
    }
}

// An entry of an avatar, area or bundle section that a service refused. It
// keeps the code and the status of the refusal and says which entry it was.
export class LibrarySeedEntryError extends BaseError {
    public readonly entry: string;
    public readonly issues: LibrarySeedIssue[];

    constructor(
        entry: string,
        cause: BaseError,
        issues: LibrarySeedIssue[] = []
    ) {
        const detail = issues.map(({ path, message }) => `${path}: ${message}`);
        super(
            `${entry}: ${detail.length > 0 ? detail.join(" ") : cause.message}`,
            cause.code,
            cause.status
        );
        this.entry = entry;
        this.issues = issues;
        this.cause = cause;
    }
}

// The key of an avatar part already belongs to a part of another slot. The
// slot never changes, so the file and the library disagree.
export class LibrarySeedAvatarSlotChangedError extends BaseError {
    constructor(key: string, current: string, wanted: string) {
        super(
            `The avatar part "${key}" is in the slot ${current} and cannot move to ${wanted}.`,
            "LIBRARY_SEED_AVATAR_SLOT_CHANGED",
            409
        );
    }
}

// The key of an avatar part in the file belongs to a color variation, or the
// other way around.
export class LibrarySeedAvatarPartKindError extends BaseError {
    constructor(key: string) {
        super(
            `The avatar part "${key}" exists as a color variation of another part.`,
            "LIBRARY_SEED_AVATAR_PART_KIND",
            409
        );
    }
}

// The kind of an avatar base never changes.
export class LibrarySeedAvatarKindChangedError extends BaseError {
    constructor(key: string, current: string, wanted: string) {
        super(
            `The avatar base "${key}" is a ${current} and cannot become a ${wanted}.`,
            "LIBRARY_SEED_AVATAR_KIND_CHANGED",
            409
        );
    }
}

// A color variation that the avatar service reported as created but that is
// not in the family it returned.
export class LibrarySeedAvatarVariationMissingError extends BaseError {
    constructor(key: string, colorKey: string) {
        super(
            `The color "${colorKey}" of the avatar part "${key}" was created but is not in the family.`,
            "LIBRARY_SEED_AVATAR_VARIATION_MISSING",
            500
        );
    }
}

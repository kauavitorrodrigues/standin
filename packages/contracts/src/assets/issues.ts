import {
    LIBRARY_ISSUE_CODES as CODES,
    type LibraryIssue,
    type LibraryIssueCode,
} from "./errors";
import { TILE_SIZE } from "../maps/consts/constants";
import { MAX_TILESET_IMAGE_PX } from "./consts/library";

// One class per validation problem of an upload. Each one carries its own
// code and message, so a call site only says what went wrong and where.
class LibraryIssueItem implements LibraryIssue {
    public readonly code: LibraryIssueCode;
    public readonly path: string;
    public readonly message: string;

    constructor(code: LibraryIssueCode, path: string, message: string) {
        this.code = code;
        this.path = path;
        this.message = message;
    }
}

// The message of a schema failure comes from the schema itself.
export class DataInvalidIssue extends LibraryIssueItem {
    constructor(path: string, message: string) {
        super(CODES.DATA_INVALID, path, message);
    }
}

export class JsonPartInvalidIssue extends LibraryIssueItem {
    constructor(part: string) {
        super(CODES.DATA_INVALID, part, `The ${part} part is not valid JSON.`);
    }
}

export class DataRequiredIssue extends LibraryIssueItem {
    constructor() {
        super(CODES.DATA_INVALID, "data", "The data part is required.");
    }
}

export class ImageFileRequiredIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.IMAGE_FILE_REQUIRED,
            "image",
            "The image part with the PNG file is required."
        );
    }
}

export class PngInvalidIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.PNG_INVALID,
            "image",
            "The image part is not a valid PNG file."
        );
    }
}

export class PngDimensionsExceededIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.PNG_DIMENSIONS_EXCEEDED,
            "image",
            `Each side of the image can be at most ${MAX_TILESET_IMAGE_PX} px.`
        );
    }
}

export class SpriteSizeNotMultipleOfTileIssue extends LibraryIssueItem {
    constructor(size: { w: number; h: number }) {
        super(
            CODES.SPRITE_SIZE_NOT_MULTIPLE_OF_TILE,
            "image",
            `The frame size (${size.w} x ${size.h}) must be a multiple of ${TILE_SIZE} px on both sides.`
        );
    }
}

export class AnimationFrameWidthInvalidIssue extends LibraryIssueItem {
    constructor(widthPx: number, frameCount: number) {
        super(
            CODES.ANIMATION_FRAME_WIDTH_INVALID,
            "image",
            `The image width (${widthPx} px) must be divisible by the frame count (${frameCount}).`
        );
    }
}

export class GridMismatchIssue extends LibraryIssueItem {
    constructor(
        size: { widthPx: number; heightPx: number },
        grid: { margin: number; spacing: number }
    ) {
        super(
            CODES.GRID_MISMATCH,
            "image",
            `The image (${size.widthPx} x ${size.heightPx}) does not make a ${TILE_SIZE} px grid with margin ${grid.margin} and spacing ${grid.spacing}.`
        );
    }
}

export class TileOutOfRangeIssue extends LibraryIssueItem {
    constructor(index: string, tileCount: number) {
        super(
            CODES.TILE_META_OUT_OF_RANGE,
            `tileMeta.${index}`,
            `Tile ${index} is outside the tileset (${tileCount} tiles).`
        );
    }
}

export class TileTopOutOfRangeIssue extends LibraryIssueItem {
    constructor(index: string, top: number, tileCount: number) {
        super(
            CODES.TILE_META_OUT_OF_RANGE,
            `tileMeta.${index}.top`,
            `Top tile ${top} of tile ${index} is outside the tileset (${tileCount} tiles).`
        );
    }
}

export class BlankDefaultDuplicatedIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.BLANK_DEFAULT_DUPLICATED,
            "blankDefault",
            "There is more than one blankDefault tile of the same category across the global tilesets."
        );
    }
}

export class CategoryRequiredIssue extends LibraryIssueItem {
    constructor(type: string) {
        super(
            CODES.CATEGORY_REQUIRED,
            "category",
            `Type ${type} has no default category, so the category is required.`
        );
    }
}

export class CategoryInvalidIssue extends LibraryIssueItem {
    constructor(value: string) {
        super(
            CODES.CATEGORY_INVALID,
            "category",
            `Category ${value} is not a valid asset category.`
        );
    }
}

export class FootprintInvalidIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.ASSET_FOOTPRINT_INVALID,
            "footprint",
            "The footprint does not fit the frame of the sprite."
        );
    }
}

export class FootprintMaskAnimatedIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.ASSET_FOOTPRINT_MASK_ANIMATED,
            "footprint.mask",
            "An animated asset cannot have a footprint mask."
        );
    }
}

export class ActionParamsWithoutActionIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.ASSET_ACTION_PARAMS_INVALID,
            "actionParams",
            "The asset has actionParams but no action."
        );
    }
}

// The detail comes from the schema of the action.
export class ActionParamsInvalidIssue extends LibraryIssueItem {
    constructor(detail: string | undefined) {
        super(
            CODES.ASSET_ACTION_PARAMS_INVALID,
            "actionParams",
            detail ?? "The actionParams are invalid."
        );
    }
}

export class VariantBaseInvalidIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.VARIANT_BASE_INVALID,
            "baseId",
            "The target of a variation must be a base asset."
        );
    }
}

export class BaseColorRequiredIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.BASE_COLOR_REQUIRED,
            "color",
            "A color can only be added when the base asset has a color."
        );
    }
}

export class ColorMissingIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.COLOR_MISSING,
            "color",
            "The asset has no color to change."
        );
    }
}

export class VariantDuplicatedIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.VARIANT_DUPLICATED,
            "color",
            "The family already has a variation with this color and rotation."
        );
    }
}

export class VariantSizeMismatchIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.VARIANT_SIZE_MISMATCH,
            "image",
            "The frame size must match the other variations of the same rotation."
        );
    }
}

export class VariantOverrideNotAllowedIssue extends LibraryIssueItem {
    constructor(field: string) {
        super(
            CODES.VARIANT_OVERRIDE_NOT_ALLOWED,
            field,
            `A new color on an existing rotation copies the sibling and does not accept ${field}.`
        );
    }
}

export class FootprintRequiredForNewRotationIssue extends LibraryIssueItem {
    constructor(field: string) {
        super(
            CODES.FOOTPRINT_REQUIRED_FOR_NEW_ROTATION,
            field,
            `A new rotation requires ${field}.`
        );
    }
}

export class AnimationImmutableIssue extends LibraryIssueItem {
    constructor() {
        super(
            CODES.ANIMATION_IMMUTABLE,
            "animation.frameCount",
            "The frame count cannot change after the asset is created."
        );
    }
}

import { TILESET_VALIDATION_MESSAGES } from "../consts/validationMessages";
import type { CreateTilesetFormValues } from "../types/createForm";
import type { TileSheetGrid } from "../types/sheet";

type Errors = Partial<Record<keyof CreateTilesetFormValues, string>>;

// Only what saves a round trip. The API decides the rest. `grid` is what the
// sheet reads as with the margin and spacing typed, null when it does not
// divide into whole cells.
export const validateCreateTileset = (
    values: CreateTilesetFormValues,
    grid: TileSheetGrid | null
): Errors => {
    const errors: Errors = {};
    const hasImage = values.image.length > 0;
    if (!hasImage) errors.image = TILESET_VALIDATION_MESSAGES.IMAGE_REQUIRED;
    if (values.name.trim() === "") {
        errors.name = TILESET_VALIDATION_MESSAGES.REQUIRED;
    }
    if (hasImage && grid === null) {
        errors.margin = TILESET_VALIDATION_MESSAGES.GRID_MISMATCH;
    }
    return errors;
};

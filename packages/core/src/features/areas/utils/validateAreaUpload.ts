import {
    AreaBodySchema,
    AreaNameInvalidIssue,
    AreaValidationError,
    StampSchema,
    TILE_SIZE,
    ThumbnailSizeMismatchIssue,
    validateStamp,
} from "@standin/contracts";
import type { AreaIssue, Stamp } from "@standin/contracts";
import { buildGlobalPalette } from "../../assets/palette";
import { readUploadedPng } from "../../assets/utils/readUploadedPng";
import type { UploadedImage } from "../../assets/types";
import type { AreaData } from "../types";

type Valid = { name: string; stamp: Stamp };

/**
 * Every problem of an area upload, collected before anything is written: the
 * PNG, the name, the stamp against the global palette, the thumbnail size.
 */
export const validateAreaUpload = async (
    image: UploadedImage,
    data: AreaData
): Promise<Valid> => {
    const { size, issues } = readUploadedPng(image.buffer);
    const errors: AreaIssue[] = [...issues];

    const name = AreaBodySchema.shape.name.safeParse(data.name);
    if (!name.success) errors.push(new AreaNameInvalidIssue());

    errors.push(...validateStamp(data.stamp, await buildGlobalPalette()));

    const stamp = StampSchema.safeParse(data.stamp);
    if (stamp.success) {
        const { width, height } = stamp.data;
        if (
            size &&
            (size.width !== width * TILE_SIZE ||
                size.height !== height * TILE_SIZE)
        ) {
            errors.push(new ThumbnailSizeMismatchIssue());
        }
    }

    if (errors.length > 0 || !name.success || !stamp.success) {
        throw new AreaValidationError(errors);
    }
    return { name: name.data, stamp: stamp.data };
};

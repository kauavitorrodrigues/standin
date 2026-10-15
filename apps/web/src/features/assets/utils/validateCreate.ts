import {
    ASSET_TYPES,
    isFootprintMaskFitting,
    isFootprintSolidMaskFitting,
    MIN_ANIMATION_FRAME_COUNT,
    TILE_SIZE,
} from "@standin/contracts";
import { ASSET_ACTION_BEHAVIOR } from "../consts/actionBehavior";
import { DEFAULT_CATEGORY_OPTION } from "../consts/createForm";
import { ASSET_VALIDATION_MESSAGES } from "../consts/validationMessages";
import type { ImageSize } from "../queries/useImageSize";
import type { CreateAssetFormValues } from "../types/createForm";
import { getEffectiveCategory } from "./getEffectiveCategory";
import {
    footprintFitsFrame,
    getFrameSize,
    isMultipleOfTile,
} from "./getFrameSize";
import { validateColorPair } from "./validateColorPair";

type Errors = Partial<Record<keyof CreateAssetFormValues, string>>;

const REQUIRED = "Campo obrigatório.";

// What a door needs on top of the rest: its closed and open frames, a strip
// that divides evenly into them and a footprint at least one tile wide.
const validateDoor = (
    values: CreateAssetFormValues,
    imageSize: ImageSize | undefined
): Errors => {
    if (values.type !== ASSET_TYPES.DOOR) return {};
    const errors: Errors = {};
    const frames = values.frameCount ?? 0;
    if (!values.isAnimated || frames < MIN_ANIMATION_FRAME_COUNT) {
        errors.frameCount = ASSET_VALIDATION_MESSAGES.DOOR_MIN_FRAMES;
    } else if (imageSize && imageSize.w % frames !== 0) {
        errors.frameCount = ASSET_VALIDATION_MESSAGES.DOOR_FRAMES_DIVIDE;
    }
    if (!values.footprintW || values.footprintW < 1) {
        errors.footprintW = ASSET_VALIDATION_MESSAGES.DOOR_FOOTPRINT_WIDTH;
    }
    return errors;
};

// Only what saves a round trip. The API decides the rest.
export const validateCreateAsset = (
    values: CreateAssetFormValues,
    imageSize: ImageSize | undefined
): Errors => {
    const errors: Errors = {};
    if (values.image.length === 0) errors.image = "Envie o PNG do asset.";
    if (values.name.trim() === "") errors.name = REQUIRED;
    if (!values.cropW || !values.cropH) {
        errors.cropW = ASSET_VALIDATION_MESSAGES.CROP_REQUIRED;
    }
    if (!values.footprintW || values.footprintW <= 0) {
        errors.footprintW = ASSET_VALIDATION_MESSAGES.FOOTPRINT_REQUIRED;
    }
    if (!values.footprintH || values.footprintH <= 0) {
        errors.footprintH = ASSET_VALIDATION_MESSAGES.FOOTPRINT_REQUIRED;
    }
    if (
        !isFootprintMaskFitting({
            w: values.footprintW ?? 0,
            h: values.footprintH ?? 0,
            mask: values.footprintMask,
        })
    ) {
        errors.footprintMask = ASSET_VALIDATION_MESSAGES.MASK_NOT_FITTING;
    }
    if (
        values.solid &&
        !values.isAnimated &&
        !isFootprintSolidMaskFitting({
            w: values.footprintW ?? 0,
            h: values.footprintH ?? 0,
            mask: values.footprintMask,
            solidMask: values.footprintSolidMask,
        })
    ) {
        errors.footprintSolidMask =
            ASSET_VALIDATION_MESSAGES.SOLID_MASK_NOT_FITTING;
    }
    Object.assign(
        errors,
        ASSET_ACTION_BEHAVIOR[values.action].validate(values)
    );
    if (
        values.type === "DECORATION" &&
        getEffectiveCategory(values) === DEFAULT_CATEGORY_OPTION
    ) {
        errors.category = "Decoração precisa de uma categoria.";
    }

    Object.assign(errors, validateColorPair(values));

    if (values.isAnimated) {
        if (
            !values.frameCount ||
            values.frameCount < MIN_ANIMATION_FRAME_COUNT
        ) {
            errors.frameCount = `Use ${MIN_ANIMATION_FRAME_COUNT} frames ou mais.`;
        }
        if (!values.frameDurationMs || values.frameDurationMs <= 0) {
            errors.frameDurationMs = REQUIRED;
        }
    }

    Object.assign(errors, validateDoor(values, imageSize));

    if (!imageSize || errors.frameCount) return errors;

    const frame = getFrameSize(
        imageSize,
        values.isAnimated ? (values.frameCount ?? 1) : 1
    );
    if (!frame) {
        errors.frameCount = "A largura da imagem não divide em frames iguais.";
    } else if (!isMultipleOfTile(frame)) {
        errors.image = `O frame precisa ter largura e altura múltiplas de ${TILE_SIZE}.`;
    } else if (
        !errors.footprintW &&
        !errors.footprintH &&
        !footprintFitsFrame(frame, {
            w: values.footprintW ?? 0,
            h: values.footprintH ?? 0,
            offsetX: values.footprintOffsetX ?? 0,
        })
    ) {
        errors.footprintW = "A pegada precisa caber dentro do frame.";
    }

    return errors;
};

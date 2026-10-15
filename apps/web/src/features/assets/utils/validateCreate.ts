import { MIN_ANIMATION_FRAME_COUNT, TILE_SIZE } from "@standin/contracts";
import { DEFAULT_CATEGORY_OPTION } from "../consts/createForm";
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

// Only what saves a round trip. The API decides the rest.
export const validateCreateAsset = (
    values: CreateAssetFormValues,
    imageSize: ImageSize | undefined
): Errors => {
    const errors: Errors = {};
    if (values.image.length === 0) errors.image = "Envie o PNG do asset.";
    if (values.name.trim() === "") errors.name = REQUIRED;
    if (!values.footprintW || values.footprintW <= 0) {
        errors.footprintW = REQUIRED;
    }
    if (!values.footprintH || values.footprintH <= 0) {
        errors.footprintH = REQUIRED;
    }
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

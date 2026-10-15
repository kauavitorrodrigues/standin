import { PREVIEW_STAGE_FILL } from "../consts/preview";

// The width of a map card of the given proportion, the biggest that fits in
// the stage at its fill. The stage is a size container, so the units are its
// width and height.
export const getPreviewWidth = (width: number, height: number): string => {
    const fill = PREVIEW_STAGE_FILL * 100;
    return `min(${fill}cqw, calc(${fill}cqh * ${width} / ${height}))`;
};

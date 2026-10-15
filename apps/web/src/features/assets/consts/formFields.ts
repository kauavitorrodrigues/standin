// Paths of the issues the API answers and the form fields that show them. A
// path can be spread over several inputs.
export const ASSET_SCHEMA_FIELD_TO_FORM_FIELDS = {
    image: ["image"],
    name: ["name"],
    key: ["name"],
    category: ["category"],
    rotation: ["rotation"],
    color: ["colorKey", "colorHex"],
    footprint: ["footprintW", "footprintH", "footprintOffsetX"],
    placement: ["placement"],
    surfaceHeightPx: ["surfaceHeightPx"],
    solid: ["solid"],
    action: ["action"],
    actionParams: ["actionParams"],
    promptText: ["promptText"],
    animation: ["frameCount", "frameDurationMs", "repeatCount"],
    margin: ["margin"],
    spacing: ["spacing"],
    tileMeta: ["tileMeta"],
} as const;

export const NO_VALUE = "";

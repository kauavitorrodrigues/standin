import { ASSET_ROTATIONS } from "@standin/contracts";

// The option of a select that stands for "no rotation".
export const NO_ROTATION = "";

export const ROTATION_OPTIONS = [
    { value: NO_ROTATION, label: "Sem rotação" },
    { value: ASSET_ROTATIONS.DEG_0, label: "0°" },
    { value: ASSET_ROTATIONS.DEG_90, label: "90°" },
    { value: ASSET_ROTATIONS.DEG_180, label: "180°" },
    { value: ASSET_ROTATIONS.DEG_270, label: "270°" },
];

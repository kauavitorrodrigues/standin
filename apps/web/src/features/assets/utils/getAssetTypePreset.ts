import { ASSET_PLACEMENTS, ASSET_TYPES } from "@standin/contracts";
import { NO_ACTION } from "../consts/actionMeta";
import {
    DOOR_PRESET_FRAME_COUNT,
    DOOR_PRESET_FRAME_DURATION_MS,
} from "../consts/doorPreset";
import type { CreateAssetFormValues } from "../types/createForm";

export type PresetValues = Pick<
    CreateAssetFormValues,
    | "placement"
    | "solid"
    | "action"
    | "isAnimated"
    | "frameCount"
    | "frameDurationMs"
    | "loopForever"
    | "repeatCount"
>;

export type PresetLocks = {
    placement: boolean;
    solid: boolean;
    action: boolean;
    isAnimated: boolean;
};

export type AssetTypePreset = {
    // What the form is set to when the type is chosen.
    values: PresetValues;
    // The fields the user cannot change while the type is chosen.
    locked: PresetLocks;
};

export const NO_LOCKS: PresetLocks = {
    placement: false,
    solid: false,
    action: false,
    isAnimated: false,
};

// The setup a type needs to work, null for a type that has none. A door sits
// on the ground, never blocks by itself (the game blocks a locked one) and
// has no action, and it always animates.
export const getAssetTypePreset = (
    type: CreateAssetFormValues["type"]
): AssetTypePreset | null => {
    switch (type) {
        case ASSET_TYPES.DOOR:
            return {
                values: {
                    placement: ASSET_PLACEMENTS.GROUND,
                    solid: false,
                    action: NO_ACTION,
                    isAnimated: true,
                    frameCount: DOOR_PRESET_FRAME_COUNT,
                    frameDurationMs: DOOR_PRESET_FRAME_DURATION_MS,
                    loopForever: false,
                    repeatCount: 0,
                },
                locked: {
                    placement: true,
                    solid: true,
                    action: true,
                    isAnimated: true,
                },
            };
        default:
            return null;
    }
};

export const getPresetLocks = (
    type: CreateAssetFormValues["type"]
): PresetLocks => getAssetTypePreset(type)?.locked ?? NO_LOCKS;

// What the form holds in the fields a preset sets, to give back when the type
// changes again.
export const snapshotPresetFields = (
    values: CreateAssetFormValues,
    preset: AssetTypePreset
): Partial<PresetValues> => {
    const keys = Object.keys(preset.values) as (keyof PresetValues)[];
    const snapshot: Record<string, unknown> = {};
    for (const key of keys) snapshot[key] = values[key];
    return snapshot as Partial<PresetValues>;
};

export type VisibleTypeFields = {
    placement: boolean;
    action: boolean;
    solid: boolean;
    animatedSwitch: boolean;
    // The note that explains the preset, under the animation.
    presetNote: boolean;
    // The row that holds the placement and the action.
    behaviorRow: boolean;
};

// The fields shown for a type. A field the preset forces is not editable, so
// it is hidden instead of shown disabled. Its value stays in the form.
export const getVisibleTypeFields = (
    type: CreateAssetFormValues["type"]
): VisibleTypeFields => {
    switch (type) {
        case ASSET_TYPES.DOOR:
            return {
                placement: false,
                action: false,
                solid: false,
                animatedSwitch: false,
                presetNote: true,
                behaviorRow: false,
            };
        default:
            return {
                placement: true,
                action: true,
                solid: true,
                animatedSwitch: true,
                presetNote: false,
                behaviorRow: true,
            };
    }
};

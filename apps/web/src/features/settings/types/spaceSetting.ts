import type { SpaceSettings } from "@standin/contracts";

// The settings of a space that are a switch.
export type BooleanSpaceSetting = {
    [K in keyof SpaceSettings]: SpaceSettings[K] extends boolean ? K : never;
}[keyof SpaceSettings];

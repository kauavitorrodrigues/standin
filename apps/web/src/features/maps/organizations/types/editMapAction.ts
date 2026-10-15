import type { MapLockState } from "@standin/contracts";
import type { EDIT_MAP_ACTION } from "../consts/edit-map-action";

export type EditMapAction =
    (typeof EDIT_MAP_ACTION)[keyof typeof EDIT_MAP_ACTION];

export type ResolveEditMapActionInput = {
    canEdit: boolean;
    lock: MapLockState;
    userId: string;
};

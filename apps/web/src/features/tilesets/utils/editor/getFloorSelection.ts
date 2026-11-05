import {
    DEFAULT_FLOOR_MATERIAL,
    type FloorMaterial,
    type TileMeta,
} from "@standin/contracts";
import { canHaveMaterial } from "./categoryRules";

export type FloorSelection = {
    // The selected tiles that are floors.
    floors: number[];
    // The material they all share, null when they differ.
    material: FloorMaterial | null;
};

// What the floor panel needs to know about the selection. A floor with no
// material counts as wood, which is what it sounds like.
export const getFloorSelection = (
    meta: TileMeta,
    selected: number[]
): FloorSelection => {
    const floors = selected.filter((index) => {
        const entry = meta[String(index)];
        return entry !== undefined && canHaveMaterial(entry.category);
    });
    const materials = new Set(
        floors.map(
            (index) => meta[String(index)]?.material ?? DEFAULT_FLOOR_MATERIAL
        )
    );
    const [only] = materials;
    return {
        floors,
        material: materials.size === 1 && only ? only : null,
    };
};

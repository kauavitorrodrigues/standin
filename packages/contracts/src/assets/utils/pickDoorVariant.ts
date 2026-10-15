import { ROTATION_BY_DOOR_SIDE, type DOOR_SIDES } from "../consts/door";
import { getFamilyBase, type FamilyMember } from "./assetFamily";

type DoorSideValue = (typeof DOOR_SIDES)[keyof typeof DOOR_SIDES];

export type DoorVariantPick<T> = {
    variant: T;
    // False when the family has no variant for the side, so the sprite may not
    // match the wall.
    exact: boolean;
};

const byId = (a: FamilyMember, b: FamilyMember) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

// The variant of a door family that fits a wall. With several colors, the one
// of the base color wins, then the first by id. Without a variant for the
// side, the base one is returned with `exact` false. Null for no variants.
export const pickDoorVariantForSide = <T extends FamilyMember>(
    variants: T[],
    side: DoorSideValue
): DoorVariantPick<T> | null => {
    if (variants.length === 0) return null;

    const rotation = ROTATION_BY_DOOR_SIDE[side];
    const base = findBase(variants);
    const matches = variants
        .filter((variant) => variant.rotation === rotation)
        .sort(byId);
    const sameColor = matches.find(
        (variant) => variant.colorKey === (base?.colorKey ?? null)
    );
    const match = sameColor ?? matches[0];
    if (match) return { variant: match, exact: true };

    return { variant: base ?? (variants[0] as T), exact: false };
};

const findBase = <T extends FamilyMember>(variants: T[]): T | null => {
    try {
        return getFamilyBase(variants);
    } catch {
        return null;
    }
};

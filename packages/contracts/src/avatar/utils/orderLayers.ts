import { AVATAR_SLOT_ORDER } from "../consts/slot-order";
import { AVATAR_SLOTS } from "../enums/slots";
import type { AvatarOrderedLayer, AvatarPartSheets } from "../types/layer";

// The parts that are drawn, in the order of the front sheets. The costume
// replaces every other part, which stay stored but are not drawn.
export const selectEffectiveParts = <T extends { slot: string }>(
    parts: readonly T[]
): T[] => {
    const costume = parts.find((part) => part.slot === AVATAR_SLOTS.COSTUME);
    if (costume) return [costume];

    return AVATAR_SLOT_ORDER.flatMap((slot) =>
        parts.filter((part) => part.slot === slot)
    );
};

// The stack from bottom to top: the base (the blank avatar, when there is
// one), then the sheets in `AVATAR_SLOT_ORDER`. With a costume only its own
// layer is returned, because the costume is the whole sprite and the base is
// not drawn under it.
export const orderLayers = <T>(
    parts: readonly AvatarPartSheets<T>[],
    base: T | null = null
): AvatarOrderedLayer<T>[] => {
    const effective = selectEffectiveParts(parts);
    const hasCostume = effective.some(
        (part) => part.slot === AVATAR_SLOTS.COSTUME
    );

    const fronts = sortBy(effective, AVATAR_SLOT_ORDER).map((part) =>
        toLayer(part, part.front)
    );
    const baseLayers: AvatarOrderedLayer<T>[] =
        base === null || hasCostume
            ? []
            : [{ slot: null, side: "base", sheet: base }];

    return [...baseLayers, ...fronts];
};

const toLayer = <T>(
    part: AvatarPartSheets<T>,
    sheet: T
): AvatarOrderedLayer<T> => ({
    slot: part.slot,
    side: "front",
    sheet,
});

// The costume is not in either order, so it stays where it is.
const sortBy = <T extends { slot: string }>(
    parts: readonly T[],
    order: readonly string[]
): T[] => {
    const position = (slot: string) => {
        const index = order.indexOf(slot);
        return index === -1 ? order.length : index;
    };
    return [...parts].sort((a, b) => position(a.slot) - position(b.slot));
};

import { NEARBY_OPACITY_MIN } from "@/features/game/consts/nearby";

// The opacity of a bubble in a stack, where index 0 is the oldest and the
// newest is opaque: 1 for a lone bubble, else 0.4 up to 1 along the stack.
export const getNearbyOpacity = (index: number, count: number): number => {
    if (count <= 1) return 1;

    return NEARBY_OPACITY_MIN + (index / (count - 1)) * (1 - NEARBY_OPACITY_MIN);
};

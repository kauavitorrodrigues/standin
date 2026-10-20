import type { AvatarSlot } from "../enums/slots";

// A decoded sheet ready to be assembled: RGBA of `AVATAR_SHEET_PX`.
export type AvatarLayer = {
    rgba: Uint8Array;
};

// What a part brings to the stack. `T` is the sheet itself: a file id for the
// hash, the decoded RGBA for the assembly. A color is a variation, which is
// another part with its own sheet, so there is no tint here.
export type AvatarPartSheets<T> = {
    slot: AvatarSlot;
    front: T;
};

export type AvatarLayerSide = "base" | "front";

// One layer of the stack, in drawing order. The base layer has no slot.
export type AvatarOrderedLayer<T> = {
    slot: AvatarSlot | null;
    side: AvatarLayerSide;
    sheet: T;
};

// A part as the hash sees it.
export type AvatarHashPart = {
    slot: AvatarSlot;
    partId: string;
    fileId: string;
};

// The blank avatar as the hash sees it.
export type AvatarHashBase = {
    baseId: string;
    fileId: string;
};

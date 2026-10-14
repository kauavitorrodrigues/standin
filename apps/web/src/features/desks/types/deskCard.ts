export type DeskCardAction = "claim" | "move";

// What the desk under the mouse offers: a free one can be claimed or moved
// to, one with an owner shows who it is.
export type DeskView =
    | { kind: "free"; action: DeskCardAction }
    | { kind: "owned"; ownerId: string; isSelf: boolean };

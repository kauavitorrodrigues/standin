import type { AvatarSlot } from "@standin/contracts";

// A part the person chose in a slot. It carries what the preview needs to
// draw it, so the draft does not depend on which pages of the list are loaded.
export type DraftPartChoice = {
    // The id of the row, which for a color variation is the variation itself.
    partId: string;
    // The id of the family the row belongs to, to mark the tile in the grid.
    familyId: string;
    // The color picked from the list, null for a part that came from the
    // saved avatar until the person picks a color.
    colorKey: string | null;
    url: string;
};

export type DraftPartsBySlot = Record<AvatarSlot, DraftPartChoice | null>;

// What the preview and the download draw.
export type AvatarDraft = {
    // Null means the default base.
    baseId: string | null;
    parts: DraftPartsBySlot;
};

// The values of the form of the editor. Nothing goes to the server until the
// person confirms.
export type AvatarEditorFormValues = AvatarDraft & {
    activeSlot: AvatarSlot;
};

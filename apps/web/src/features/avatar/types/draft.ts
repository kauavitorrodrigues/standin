import type { RefObject } from "react";
import type { AvatarSlot } from "@standin/contracts";

// A part the person chose in a slot. It carries what the preview needs to
// draw it, so the draft does not depend on which pages of the list are loaded.
export type DraftPartChoice = {
    // The id of the row, which for a color variation is the variation itself.
    partId: string;
    // The id of the family the row belongs to, to mark the tile in the grid.
    familyId: string;
    // The color of the row, null for a part with no colors.
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

// Filled by the editor form with its save, so the discard dialog can run it.
export type SaveDraftRef = RefObject<(() => Promise<void>) | null>;

// How a random draw applies to the draft.
export type RandomizeOptions = {
    // The draft as it was when the start draw began, null to always apply.
    untouchedKey: string | null;
};

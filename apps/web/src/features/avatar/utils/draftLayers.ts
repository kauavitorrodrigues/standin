import {
    AVATAR_SLOT_ORDER,
    AVATAR_SLOTS,
    orderLayers,
} from "@standin/contracts";
import type { AvatarLayer, AvatarPartSheets } from "@standin/contracts";
import type { AvatarDraft } from "../types/draft";
import type { AvatarEditorBase, SheetPixelsByUrl } from "../types/editor";
import { resolveDraftBase } from "./draft";

const ALL_SLOTS = [...AVATAR_SLOT_ORDER, AVATAR_SLOTS.COSTUME] as const;

// The urls of every sheet the draft needs: the base and the sheet of each
// chosen part, without repeats.
export const collectDraftUrls = (
    draft: AvatarDraft,
    bases: readonly AvatarEditorBase[]
): string[] => {
    const urls = new Set<string>();

    const base = resolveDraftBase(bases, draft.baseId);
    if (base) urls.add(base.url);

    for (const slot of ALL_SLOTS) {
        const choice = draft.parts[slot];
        if (!choice) continue;
        urls.add(choice.url);
    }

    return [...urls];
};

// The layers of the draft in drawing order, ready for `assembleSheet`: the
// base, then the sheets in slot order. A sheet that has not been decoded yet
// is left out until it arrives, and a costume leaves the base out.
export const buildDraftLayers = (
    draft: AvatarDraft,
    bases: readonly AvatarEditorBase[],
    pixels: SheetPixelsByUrl
): AvatarLayer[] => {
    const parts: AvatarPartSheets<Uint8Array>[] = [];

    for (const slot of ALL_SLOTS) {
        const choice = draft.parts[slot];
        const front = choice ? pixels.get(choice.url) : undefined;
        if (!choice || !front) continue;

        parts.push({ slot, front });
    }

    const base = resolveDraftBase(bases, draft.baseId);
    const basePixels = base ? (pixels.get(base.url) ?? null) : null;

    return orderLayers(parts, basePixels).map((layer) => ({
        rgba: layer.sheet,
    }));
};

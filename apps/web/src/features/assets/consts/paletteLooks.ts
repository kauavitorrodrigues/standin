import type { PaletteLook } from "@/features/assets/types/paletteLook";

export const PALETTE_LOOKS = {
    // The side panel of the map editor.
    EDITOR: { names: true, searchIcon: true, plainTabs: false },
    // The panel of the decorator: only the pictures.
    DECORATOR: { names: false, searchIcon: false, plainTabs: true },
} as const satisfies Record<string, PaletteLook>;

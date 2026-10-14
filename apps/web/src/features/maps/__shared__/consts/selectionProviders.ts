import { createZoneSelectionProvider } from "@/features/maps/__shared__/lib/createZoneSelectionProvider";
import { createObjectSelectionProvider } from "@/features/maps/__shared__/lib/createObjectSelectionProvider";
import type { SelectionProviderFactory } from "@/features/maps/__shared__/types/SelectionProvider";

// What the select tool can pick. To make something selectable, write its
// provider (one file) and add ONE line here.
export const SELECTION_PROVIDERS: readonly SelectionProviderFactory[] = [
    createObjectSelectionProvider,
    createZoneSelectionProvider,
];

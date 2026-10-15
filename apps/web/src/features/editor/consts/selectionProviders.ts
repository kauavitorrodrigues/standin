import { createZoneSelectionProvider } from "@/features/editor/lib/createZoneSelectionProvider";
import { createObjectSelectionProvider } from "@/features/editor/lib/createObjectSelectionProvider";
import type { SelectionProviderFactory } from "@/features/editor/types/SelectionProvider";

// What the select tool can pick. To make something selectable, write its
// provider (one file) and add ONE line here.
export const SELECTION_PROVIDERS: readonly SelectionProviderFactory[] = [
    createObjectSelectionProvider,
    createZoneSelectionProvider,
];

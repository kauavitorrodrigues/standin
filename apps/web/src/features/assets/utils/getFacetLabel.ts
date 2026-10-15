import type { MetaItem } from "@/types/meta";

// The name of an option of the sidebar: the one the page gives it, or the one
// the server sent.
export const getFacetLabel = (
    item: MetaItem | undefined,
    serverLabel: string
): string => {
    if (!item) return serverLabel;
    return item.label;
};

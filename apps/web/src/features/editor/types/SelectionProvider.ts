import type { SelectionHitQuery } from "@/features/editor/types/SelectionHitQuery";
import type { SelectionTarget } from "@/features/editor/types/SelectionTarget";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";

// One kind of thing that can be selected. It answers the best target of its
// own kind under a point, or null. The select tool asks every provider and
// keeps the winner (see pickSelectionTarget).
export type SelectionProvider = {
    hitTest: (query: SelectionHitQuery) => SelectionTarget | null;
};

export type SelectionProviderFactory = (env: ToolEnv) => SelectionProvider;

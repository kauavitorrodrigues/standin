import type { SelectionMode } from "../../types/sheet";

type Modifiers = { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean };

// The keys held while picking say how it joins the selection: shift adds, ctrl
// (or cmd) takes away, and both keep only what is in both.
export const getSelectionMode = ({
    shiftKey,
    ctrlKey,
    metaKey,
}: Modifiers): SelectionMode => {
    const mod = ctrlKey || metaKey;
    if (mod && shiftKey) return "intersect";
    if (mod) return "subtract";
    if (shiftKey) return "add";
    return "replace";
};

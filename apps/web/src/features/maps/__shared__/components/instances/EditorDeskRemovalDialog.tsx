import { DeskRemovalPrompt } from "@/features/maps/__shared__/components/instances/DeskRemovalPrompt";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";

// The confirmation of removing a desk that has an owner. Delete, the bar and
// the eraser all end here through the pending request of the store. Cancel
// removes nothing, and confirming removes with `releaseDesk`.
export const EditorDeskRemovalDialog = () => {
    const pending = useEditorSelector((state) => state.pendingDeskRemoval);

    if (pending.length === 0) return null;

    return <DeskRemovalPrompt pending={pending} />;
};

import { useEffect, useState, type ReactNode } from "react";
import type { EditorModel } from "@standin/contracts";
import { DraftStoreContext } from "@/features/maps/__shared__/contexts/DraftStoreContext";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";
import { createDraftStore } from "@/features/maps/__shared__/lib/DraftStore";

type DraftStoreProviderProps = {
    model: EditorModel;
    children: ReactNode;
};

// One draft per mount of the editor, started from the published model. The
// draft tells the EditorStore its summary, which the toolbar and the status
// badge read. A model that arrives later does not replace the draft.
export const DraftStoreProvider = ({
    model,
    children,
}: DraftStoreProviderProps) => {
    const editorStore = useEditorStore();
    const [draftStore] = useState(() =>
        createDraftStore(model, editorStore.setDraftSummary)
    );

    // The selection actions of the store (move, remove) work on this draft.
    useEffect(
        () =>
            editorStore.attachSelectionHost({
                getModel: () => draftStore.getState().draft,
                dispatch: draftStore.dispatchGesture,
            }),
        [editorStore, draftStore]
    );

    return (
        <DraftStoreContext.Provider value={draftStore}>
            {children}
        </DraftStoreContext.Provider>
    );
};

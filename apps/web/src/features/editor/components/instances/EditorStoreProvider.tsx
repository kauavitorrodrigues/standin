import { useState, type ReactNode } from "react";
import { EditorStoreContext } from "@/features/editor/contexts/EditorStoreContext";
import { createEditorStore } from "@/features/editor/lib/EditorStore";

type EditorStoreProviderProps = {
    children: ReactNode;
};

// One store per mount of the editor. Mount it with a key per map so a new map
// starts from a clean store.
export const EditorStoreProvider = ({ children }: EditorStoreProviderProps) => {
    const [store] = useState(createEditorStore);

    return (
        <EditorStoreContext.Provider value={store}>
            {children}
        </EditorStoreContext.Provider>
    );
};

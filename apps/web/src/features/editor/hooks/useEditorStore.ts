import { useContext } from "react";
import { EditorStoreContext } from "@/features/editor/contexts/EditorStoreContext";

export const useEditorStore = () => {
    const store = useContext(EditorStoreContext);
    if (!store) {
        throw new Error(
            "useEditorStore must be used within an EditorStoreProvider"
        );
    }
    return store;
};

import { useContext } from "react";
import { EditorStoreContext } from "@/features/maps/__shared__/contexts/EditorStoreContext";

export const useEditorStore = () => {
    const store = useContext(EditorStoreContext);
    if (!store) {
        throw new Error(
            "useEditorStore must be used within an EditorStoreProvider"
        );
    }
    return store;
};

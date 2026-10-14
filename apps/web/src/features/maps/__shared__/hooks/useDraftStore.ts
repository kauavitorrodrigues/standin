import { useContext } from "react";
import { DraftStoreContext } from "@/features/maps/__shared__/contexts/DraftStoreContext";

export const useDraftStore = () => {
    const store = useContext(DraftStoreContext);
    if (!store) {
        throw new Error(
            "useDraftStore must be used within a DraftStoreProvider"
        );
    }
    return store;
};

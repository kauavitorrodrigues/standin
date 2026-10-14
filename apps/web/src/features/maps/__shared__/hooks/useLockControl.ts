import { useContext } from "react";
import { EditorLockContext } from "@/features/maps/__shared__/contexts/EditorLockContext";

export const useLockControl = () => {
    const control = useContext(EditorLockContext);
    if (!control) {
        throw new Error("useLockControl must be used within an EditorLockGate");
    }
    return control;
};

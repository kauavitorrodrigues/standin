import { useState } from "react";
import type { ClipDialogKind } from "../types/dialog";

/** Which dialog of a clip is open, if any. */
export const useClipDialogs = () => {
    const [kind, setKind] = useState<ClipDialogKind | null>(null);

    return {
        kind,
        open: (next: ClipDialogKind) => setKind(next),
        close: () => setKind(null),
    };
};

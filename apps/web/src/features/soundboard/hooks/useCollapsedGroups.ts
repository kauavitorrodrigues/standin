import { useState } from "react";
import type { SoundboardClipScope } from "@standin/contracts";
import { toggleInSet } from "@/utils/toggleInSet";

/** Which groups the person folded. They start open, and it is only for this view. */
export const useCollapsedGroups = () => {
    const [collapsed, setCollapsed] = useState<
        ReadonlySet<SoundboardClipScope>
    >(new Set());

    return {
        collapsed,
        toggle: (scope: SoundboardClipScope) =>
            setCollapsed((current) => toggleInSet(current, scope)),
    };
};

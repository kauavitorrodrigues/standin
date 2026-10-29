import { useState } from "react";

export type AssignTarget = { id: string; name: string };

// Who the owner is giving a desk to: from the people list they choose a
// person, then click a free desk on the map. Null while no one is chosen.
export const useAssignPick = () => {
    const [target, setTarget] = useState<AssignTarget | null>(null);

    return {
        target,
        start: setTarget,
        cancel: () => setTarget(null),
    };
};

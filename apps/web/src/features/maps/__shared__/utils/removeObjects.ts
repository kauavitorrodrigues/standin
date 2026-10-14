import { buildRemoveOps } from "@/features/maps/__shared__/utils/buildRemoveOps";
import type { SelectionHost } from "@/features/maps/__shared__/types/SelectionHost";

type Params = {
    host: SelectionHost;
    ids: readonly string[];
    // Called with the claimed desks, instead of removing anything, so the
    // interface can ask for confirmation. This is the extension point of
    // W-OBJ-7.
    onClaimedDesks: (ids: readonly string[]) => void;
};

// Removes objects as ONE gesture. A claimed desk among them holds the whole
// removal back and asks for confirmation. True when something was removed.
export const removeObjects = ({
    host,
    ids,
    onClaimedDesks,
}: Params): boolean => {
    const plan = buildRemoveOps({ model: host.getModel(), ids });

    if (plan.claimedIds.length > 0) {
        onClaimedDesks(plan.claimedIds);
        return false;
    }
    if (plan.ops.length === 0) return false;

    return host.dispatch(plan.ops).ok;
};

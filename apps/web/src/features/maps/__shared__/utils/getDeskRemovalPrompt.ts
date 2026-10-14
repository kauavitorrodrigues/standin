import type { ModelDesk, UserSummary } from "@standin/contracts";
import { DESK_MESSAGES } from "@/features/maps/__shared__/consts/messages";
import type { DeskRemovalPrompt } from "@/features/maps/__shared__/types/DeskRemovalPrompt";
import { joinNames } from "@/features/maps/__shared__/utils/joinNames";

type Params = {
    // The claimed desks the user asked to remove.
    pending: readonly string[];
    desks: readonly ModelDesk[];
    // The members of the organization of the space. Empty while they load.
    members: readonly UserSummary[];
};

// Decides whether the confirmation shows and what it says. Null when no
// claimed desk is waiting, which is always the case in a template (nobody
// claims a desk there). An owner that is not among the members is named by the
// fallback, so the warning never hides.
export const getDeskRemovalPrompt = ({
    pending,
    desks,
    members,
}: Params): DeskRemovalPrompt | null => {
    if (pending.length === 0) return null;

    const names = new Set<string>();
    for (const objectId of pending) {
        const desk = desks.find(({ mapAssetId }) => mapAssetId === objectId);
        if (!desk) continue;
        const member = members.find(({ id }) => id === desk.userId);
        names.add(member?.name ?? DESK_MESSAGES.OWNER_FALLBACK);
    }
    if (names.size === 0) return null;

    return { owners: joinNames([...names]), plural: pending.length > 1 };
};

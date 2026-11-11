import type { UserSummary } from "@standin/contracts";

/**
 * The person whose card opens: the one whose avatar was clicked. Nothing for no
 * selection, for the own account (another tab of it, which the own profile
 * covers) or for a person the organization does not list, such as a guest.
 */
export const resolveSelectedPerson = (
    selectedUserId: string | null,
    selfUserId: string,
    peopleById: ReadonlyMap<string, UserSummary>
): UserSummary | null => {
    if (selectedUserId === null) return null;
    if (selectedUserId === selfUserId) return null;

    return peopleById.get(selectedUserId) ?? null;
};

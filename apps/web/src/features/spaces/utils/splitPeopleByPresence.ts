import type { UserSummary } from "@standin/contracts";

const normalize = (text: string): string =>
    text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim();

// Keeps the people whose name matches the query (accents and case ignored)
// and splits them into who is in the space right now and who is not, each
// group sorted by name.
export const splitPeopleByPresence = (
    people: readonly UserSummary[],
    onlineUserIds: readonly string[],
    query: string
): { online: UserSummary[]; offline: UserSummary[] } => {
    const normalizedQuery = normalize(query);
    const onlineIds = new Set(onlineUserIds);

    const matching = people
        .filter((person) => normalize(person.name).includes(normalizedQuery))
        .sort((first, second) => first.name.localeCompare(second.name));

    return {
        online: matching.filter((person) => onlineIds.has(person.id)),
        offline: matching.filter((person) => !onlineIds.has(person.id)),
    };
};

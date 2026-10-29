import type { UserSummary } from "@standin/contracts";

export type PeopleGroup = "online" | "offline";

// One line of the list of people: the title of a group or a person. The list
// is flat so that it can be virtualized.
export type PeopleRow =
    | {
          kind: "header";
          key: string;
          group: PeopleGroup;
          count: number;
          isOpen: boolean;
      }
    | { kind: "person"; key: string; person: UserSummary; isOnline: boolean };

/**
 * The lines of the list: a title for each group that has people, followed by
 * its people unless the group is folded away.
 */
export const buildPeopleRows = (
    online: readonly UserSummary[],
    offline: readonly UserSummary[],
    folded: ReadonlySet<PeopleGroup>
): PeopleRow[] => {
    const rows: PeopleRow[] = [];

    const addGroup = (
        group: PeopleGroup,
        people: readonly UserSummary[]
    ): void => {
        if (people.length === 0) return;

        const isOpen = !folded.has(group);
        rows.push({
            kind: "header",
            key: `header:${group}`,
            group,
            count: people.length,
            isOpen,
        });
        if (!isOpen) return;

        for (const person of people) {
            rows.push({
                kind: "person",
                key: `${group}:${person.id}`,
                person,
                isOnline: group === "online",
            });
        }
    };

    addGroup("online", online);
    addGroup("offline", offline);
    return rows;
};

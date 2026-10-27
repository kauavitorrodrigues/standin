import type { ConversationSummary } from "@standin/contracts";
import { CONVERSATION_TYPES } from "@standin/contracts";
import { normalizeSearch } from "../../areas/utils/normalizeSearch";

const includesTerm = (text: string, term: string): boolean =>
    normalizeSearch(text).includes(term);

// Keeps the conversations whose title matches the search, ignoring case and
// accents. A direct conversation is titled by its participants, a space
// conversation by the name of its space. A blank search keeps everything.
export const filterSummariesBySearch = (
    summaries: ConversationSummary[],
    spaceNameById: Map<string, string>,
    search: string
): ConversationSummary[] => {
    const term = normalizeSearch(search.trim());
    if (term === "") return summaries;

    return summaries.filter((summary) => {
        if (summary.type === CONVERSATION_TYPES.DIRECT) {
            return summary.participants.some((participant) =>
                includesTerm(participant.name, term)
            );
        }

        const spaceName = summary.spaceId
            ? spaceNameById.get(summary.spaceId)
            : undefined;
        return spaceName !== undefined && includesTerm(spaceName, term);
    });
};

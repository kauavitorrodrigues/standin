import type { LibraryFamilyFacets } from "@standin/contracts";
import { buildFacets } from "./families/filterFamilies";
import { loadFamilySources } from "./families/loadFamilySources";
import { toFamilySummary } from "./families/toFamilySummary";

/**
 * The options of every filter of the library sidebar, with how many families
 * each holds. It does not depend on the filters chosen on the list.
 */
export const listLibraryFamilyFacets = async (
    organizationId: string | null
): Promise<LibraryFamilyFacets> => {
    const summaries = (await loadFamilySources(organizationId)).map(
        toFamilySummary
    );
    return buildFacets(summaries);
};

import type {
    LibraryFamilyList,
    LibraryFamilyQuerySchemaType,
} from "@standin/contracts";
import { matchesQuery } from "./families/filterFamilies";
import { loadFamilySources } from "./families/loadFamilySources";
import { sortFamilies } from "./families/sortFamilies";
import { toFamilySummary } from "./families/toFamilySummary";

/**
 * The families of a scope as the library screen shows them (the base assets):
 * searched, filtered, sorted and paged. The facets of the sidebar have their
 * own request, `listLibraryFamilyFacets`.
 */
export const listLibraryFamilies = async (
    organizationId: string | null,
    query: LibraryFamilyQuerySchemaType
): Promise<LibraryFamilyList> => {
    const summaries = (await loadFamilySources(organizationId)).map(
        toFamilySummary
    );

    const matching = sortFamilies(
        summaries.filter((family) => matchesQuery(family, query)),
        query.sort
    );
    const start = (query.page - 1) * query.pageSize;

    return {
        families: matching.slice(start, start + query.pageSize),
        page: query.page,
        pageSize: query.pageSize,
        total: matching.length,
        totalPages: Math.ceil(matching.length / query.pageSize),
    };
};

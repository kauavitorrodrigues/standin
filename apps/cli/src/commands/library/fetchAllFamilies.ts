import { MAX_LIBRARY_FAMILY_PAGE_SIZE } from "@standin/contracts";
import type {
    LibraryFamilyList,
    LibraryFamilySummary,
} from "@standin/contracts";
import { callApi } from "../../api/callApi";
import { MAX_LIBRARY_PAGES } from "../../consts/api";
import { LibraryPagesExceededError } from "../../errors/LibraryPagesExceededError";
import type { HttpTransport, RemoteTarget } from "../../types";
import { LIBRARY_PATHS } from "./consts";

// Every family of the library, one page at a time until the last. The number
// of pages is capped: a server that never stops saying "one more" is not
// followed for ever.
export const fetchAllFamilies = async (
    http: HttpTransport,
    target: RemoteTarget
): Promise<LibraryFamilySummary[]> => {
    const families: LibraryFamilySummary[] = [];
    let page: number = 1;
    let totalPages: number = 1;
    while (page <= totalPages) {
        if (page > MAX_LIBRARY_PAGES) {
            throw new LibraryPagesExceededError(MAX_LIBRARY_PAGES);
        }
        const answer: LibraryFamilyList = await callApi<LibraryFamilyList>(
            http,
            target,
            {
                method: "GET",
                path: LIBRARY_PATHS.ASSETS,
                query: { page, pageSize: MAX_LIBRARY_FAMILY_PAGE_SIZE },
            }
        );
        families.push(...answer.families);
        totalPages = answer.totalPages;
        page += 1;
    }
    return families;
};

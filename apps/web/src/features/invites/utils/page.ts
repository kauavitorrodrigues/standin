import type { PaginationState } from "@tanstack/react-table";

/** The same page size, back at the first page. */
export const toFirstPage = (page: PaginationState): PaginationState =>
    page.pageIndex === 0 ? page : { ...page, pageIndex: 0 };

/**
 * Whether a page past the first came back with nothing, so the list must step
 * back. A failed or loading request is not an empty page.
 */
export const shouldStepBack = (state: {
    pageIndex: number;
    isFetching: boolean;
    isError: boolean;
    count: number;
}): boolean =>
    state.pageIndex > 0 &&
    !state.isFetching &&
    !state.isError &&
    state.count === 0;

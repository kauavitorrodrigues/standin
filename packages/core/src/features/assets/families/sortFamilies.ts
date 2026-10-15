import {
    LIBRARY_FAMILY_SORTS,
    type LibraryFamilySort,
    type LibraryFamilySummary,
} from "@standin/contracts";

const bySortKey = (sort: LibraryFamilySort) =>
    sort === LIBRARY_FAMILY_SORTS.TYPE
        ? (family: LibraryFamilySummary) => family.type
        : (family: LibraryFamilySummary) => family.name;

// The chosen key first, then name and key, so the order is stable.
export const sortFamilies = (
    families: LibraryFamilySummary[],
    sort: LibraryFamilySort
) => {
    const key = bySortKey(sort);
    return [...families].sort(
        (a, b) =>
            key(a).localeCompare(key(b)) ||
            a.name.localeCompare(b.name) ||
            a.key.localeCompare(b.key)
    );
};

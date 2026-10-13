import {
    ASSET_CATEGORY_META,
    ASSET_PLACEMENTS,
    ASSET_TYPES,
} from "@standin/contracts";
import type {
    LibraryFacetOption,
    LibraryFamilyFacets,
    LibraryFamilyQuerySchemaType,
    LibraryFamilySummary,
} from "@standin/contracts";

const matchesSearch = (family: LibraryFamilySummary, search?: string) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return [family.name, family.key].some((text) =>
        text.toLowerCase().includes(term)
    );
};

// A family passes when it matches the search and every filter.
export const matchesQuery = (
    family: LibraryFamilySummary,
    query: LibraryFamilyQuerySchemaType
) =>
    matchesSearch(family, query.search) &&
    (!query.type || family.type === query.type) &&
    (!query.category || family.category === query.category) &&
    (!query.placement || family.placement === query.placement) &&
    (query.inUse === undefined || family.inUse === query.inUse);

const countBy = (
    families: LibraryFamilySummary[],
    read: (family: LibraryFamilySummary) => { value: string; label: string }
): LibraryFacetOption[] => {
    const options = new Map<string, LibraryFacetOption>();
    for (const family of families) {
        const { value, label } = read(family);
        const option = options.get(value) ?? { value, label, count: 0 };
        option.count += 1;
        options.set(value, option);
    }
    return [...options.values()].sort((a, b) => a.label.localeCompare(b.label));
};

// Every known value shows up, with zero when no family matches, so the
// sidebar can list them disabled instead of hiding them.
const withAllValues = (
    options: LibraryFacetOption[],
    all: { value: string; label: string }[]
): LibraryFacetOption[] => {
    const known = new Set(options.map(({ value }) => value));
    const missing = all
        .filter(({ value }) => !known.has(value))
        .map((option) => ({ ...option, count: 0 }));
    return [...options, ...missing].sort((a, b) =>
        a.label.localeCompare(b.label)
    );
};

const toValueOptions = (values: Record<string, string>) =>
    Object.values(values).map((value) => ({ value, label: value }));

// The sidebar counts the whole library, no filter applies to it.
export const buildFacets = (
    families: LibraryFamilySummary[]
): LibraryFamilyFacets => ({
    types: withAllValues(
        countBy(families, ({ type }) => ({ value: type, label: type })),
        toValueOptions(ASSET_TYPES)
    ),
    categories: countBy(families, ({ category }) => ({
        value: category,
        label: ASSET_CATEGORY_META[category].label,
    })).sort(
        (a, b) =>
            ASSET_CATEGORY_META[a.value as keyof typeof ASSET_CATEGORY_META]
                .order -
            ASSET_CATEGORY_META[b.value as keyof typeof ASSET_CATEGORY_META]
                .order
    ),
    placements: withAllValues(
        countBy(families, ({ placement }) => ({
            value: placement,
            label: placement,
        })),
        toValueOptions(ASSET_PLACEMENTS)
    ),
    usage: withAllValues(
        countBy(families, ({ inUse }) => ({
            value: String(inUse),
            label: inUse ? "Em uso" : "Livre",
        })),
        [
            { value: "true", label: "Em uso" },
            { value: "false", label: "Livre" },
        ]
    ),
});

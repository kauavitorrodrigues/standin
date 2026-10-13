import type { LibraryFamilyFacets } from "@standin/contracts";
import type { LibraryFilters } from "../../../types/libraryFilters";
import { FacetsSidebar } from "./FacetsSidebar";

type Props = {
    // Not loaded yet, so there is nothing to filter by.
    facets: LibraryFamilyFacets | undefined;
    filters: LibraryFilters;
    onChange: (changes: LibraryFilters) => void;
};

export const LibraryFacetsSidebar = ({ facets, filters, onChange }: Props) => {
    if (!facets) return null;

    return (
        <FacetsSidebar facets={facets} filters={filters} onChange={onChange} />
    );
};

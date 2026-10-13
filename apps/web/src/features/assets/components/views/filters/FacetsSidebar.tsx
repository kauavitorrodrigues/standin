import type { LibraryFamilyFacets } from "@standin/contracts";
import { FacetSection } from "@/features/assets/components/views/filters/FacetSection";
import { ASSET_PLACEMENT_META } from "@/features/assets/consts/placementMeta";
import { ASSET_TYPE_META } from "@/features/assets/consts/typeMeta";
import type { LibraryFilters } from "@/features/assets/types/libraryFilters";

type Props = {
    facets: LibraryFamilyFacets;
    filters: LibraryFilters;
    onChange: (changes: LibraryFilters) => void;
};

const readUsage = ({ inUse }: LibraryFilters) =>
    inUse === undefined ? null : String(inUse);

// Fixed column glued to the edges of the page: the container above cancels
// its padding with negative margins.
export const FacetsSidebar = ({ facets, filters, onChange }: Props) => (
    <aside className="flex w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r px-3 py-4">
        <FacetSection
            title="Tipo"
            options={facets.types}
            meta={ASSET_TYPE_META}
            selected={filters.type ?? null}
            onSelect={(value) =>
                onChange({
                    type: (value ?? undefined) as LibraryFilters["type"],
                })
            }
        />
        <FacetSection
            title="Posicionamento"
            options={facets.placements}
            meta={ASSET_PLACEMENT_META}
            selected={filters.placement ?? null}
            onSelect={(value) =>
                onChange({
                    placement: (value ??
                        undefined) as LibraryFilters["placement"],
                })
            }
        />
        <FacetSection
            title="Uso"
            options={facets.usage}
            selected={readUsage(filters)}
            onSelect={(value) =>
                onChange({
                    inUse: value === null ? undefined : value === "true",
                })
            }
        />
    </aside>
);

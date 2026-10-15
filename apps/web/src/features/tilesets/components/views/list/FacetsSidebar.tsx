import type { LibraryTilesetFacets } from "@standin/contracts";
import { FacetSection } from "@/features/assets/components/views/filters/FacetSection";
import type { TilesetFilters } from "../../../types/filters";

type Props = {
    facets: LibraryTilesetFacets;
    filters: TilesetFilters;
    onChange: (changes: TilesetFilters) => void;
};

const readUsage = ({ inUse }: TilesetFilters) =>
    inUse === undefined ? null : String(inUse);

export const TilesetFacetsSidebar = ({ facets, filters, onChange }: Props) => (
    <aside className="flex w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r px-3 py-4">
        <FacetSection
            title="Categorias"
            options={facets.progress}
            selected={filters.progress ?? null}
            onSelect={(value) =>
                onChange({
                    progress: (value ??
                        undefined) as TilesetFilters["progress"],
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

import type {
    AvatarPartFacets,
    AvatarPartFilters,
} from "../../../../types/admin/partFilters";
import { FacetSection } from "./FacetSection";

type Props = {
    facets: AvatarPartFacets;
    filters: AvatarPartFilters;
    onChange: (changes: AvatarPartFilters) => void;
};

// Fixed column glued to the edges of the page, as in the base and the asset
// library sidebars.
export const PartsFacetsSidebar = ({ facets, filters, onChange }: Props) => (
    <aside className="flex w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r px-3 py-4">
        <FacetSection
            title="Tipo"
            options={facets.slot}
            selected={filters.slot ?? null}
            onSelect={(value) =>
                onChange({
                    slot: (value ?? undefined) as AvatarPartFilters["slot"],
                })
            }
        />
    </aside>
);

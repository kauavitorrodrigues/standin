import { AVATAR_BASE_KIND_META } from "../../../../consts/admin/baseKindMeta";
import type { AvatarBaseFacets, AvatarBaseFilters } from "../../../../types/admin/baseFilters";
import { FacetSection } from "./FacetSection";

type Props = {
    facets: AvatarBaseFacets;
    filters: AvatarBaseFilters;
    onChange: (changes: AvatarBaseFilters) => void;
};

const readPreview = ({ hasPreview }: AvatarBaseFilters) =>
    hasPreview === undefined ? null : String(hasPreview);

// Fixed column glued to the edges of the page: the container above cancels
// its padding so the sidebar touches the top, the bottom and the left edge.
export const FacetsSidebar = ({ facets, filters, onChange }: Props) => (
    <aside className="flex w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r px-3 py-4">
        <FacetSection
            title="Tipo"
            options={facets.kind}
            meta={AVATAR_BASE_KIND_META}
            selected={filters.kind ?? null}
            onSelect={(value) =>
                onChange({
                    kind: (value ?? undefined) as AvatarBaseFilters["kind"],
                })
            }
        />
        <FacetSection
            title="Imagem"
            options={facets.preview}
            selected={readPreview(filters)}
            onSelect={(value) =>
                onChange({
                    hasPreview: value === null ? undefined : value === "true",
                })
            }
        />
    </aside>
);

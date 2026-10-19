import type { AvatarBase } from "@standin/contracts";
import type { AvatarBaseFilters } from "../../types/admin/baseFilters";

const matchesKind = (base: AvatarBase, filters: AvatarBaseFilters) =>
    filters.kind === undefined || base.kind === filters.kind;

const matchesPreview = (base: AvatarBase, filters: AvatarBaseFilters) =>
    filters.hasPreview === undefined ||
    (base.previewUrl !== null) === filters.hasPreview;

export const filterBases = (
    bases: AvatarBase[],
    filters: AvatarBaseFilters
): AvatarBase[] =>
    bases.filter(
        (base) => matchesKind(base, filters) && matchesPreview(base, filters)
    );

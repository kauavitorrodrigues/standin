import type { AvatarPart } from "@standin/contracts";
import type { AvatarPartFilters } from "../../types/admin/partFilters";

export const filterParts = (
    parts: AvatarPart[],
    filters: AvatarPartFilters
): AvatarPart[] =>
    parts.filter(
        (part) => filters.slot === undefined || part.slot === filters.slot
    );

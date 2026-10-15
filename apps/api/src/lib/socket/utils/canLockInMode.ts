import { EDIT_SCOPES } from "@standin/contracts";
import type { EditScopeKind } from "@standin/contracts";
import type { MapAccess } from "@standin/core";

// The permission each lock mode asks of the person, read from the database.
export const canLockInMode = (
    access: Pick<MapAccess, "canEdit" | "canDecorate">,
    mode: EditScopeKind
): boolean => {
    switch (mode) {
        case EDIT_SCOPES.OBJECTS:
            return access.canDecorate;
        default:
            return access.canEdit;
    }
};

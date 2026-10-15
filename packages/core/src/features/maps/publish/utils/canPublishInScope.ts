import { EDIT_SCOPES } from "@standin/contracts";
import type { EditScope } from "@standin/contracts";
import type { MapAccess } from "../../types/map-access";

// The permission each scope asks of the person, read from the database.
export const canPublishInScope = (
    access: MapAccess,
    scope: EditScope
): boolean => {
    switch (scope.kind) {
        case EDIT_SCOPES.OBJECTS:
            return access.canDecorate;
        default:
            return access.canEdit;
    }
};
